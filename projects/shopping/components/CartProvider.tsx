"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CartLine = { productId: number; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (productId: number, quantity: number) => Promise<void>;
  setQuantity: (productId: number, quantity: number) => Promise<void>;
  remove: (productIds: number[]) => Promise<void>;
  reload: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ongi-cart";
const MAX_QTY = 99;

function readLocal(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((l) => Number.isInteger(l.productId) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* 저장 불가 환경은 무시 */
  }
}

export function CartProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const loadFromDb = useCallback(async () => {
    const { data } = await supabase
      .from("shop_cart_items")
      .select("product_id, quantity")
      .order("created_at");
    setLines((data ?? []).map((r) => ({ productId: r.product_id, quantity: r.quantity })));
  }, [supabase]);

  // 로그인 상태가 바뀌면 장바구니 소스를 전환. 로그인 시 비회원 장바구니를 DB로 병합
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      if (!userId) {
        if (!cancelled) setLines(readLocal());
      } else {
        const local = readLocal();
        if (local.length > 0) {
          const { data: existing } = await supabase
            .from("shop_cart_items")
            .select("product_id, quantity");
          const merged = local.map((l) => {
            const prev = existing?.find((e) => e.product_id === l.productId)?.quantity ?? 0;
            return {
              user_id: userId,
              product_id: l.productId,
              quantity: Math.min(prev + l.quantity, MAX_QTY),
            };
          });
          await supabase.from("shop_cart_items").upsert(merged, { onConflict: "user_id,product_id" });
          writeLocal([]);
        }
        if (!cancelled) await loadFromDb();
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, supabase, loadFromDb]);

  const persist = useCallback(
    async (next: CartLine[], changed: CartLine[], removed: number[] = []) => {
      setLines(next);
      if (!userId) {
        writeLocal(next);
        return;
      }
      if (changed.length) {
        await supabase.from("shop_cart_items").upsert(
          changed.map((l) => ({ user_id: userId, product_id: l.productId, quantity: l.quantity })),
          { onConflict: "user_id,product_id" }
        );
      }
      if (removed.length) {
        await supabase.from("shop_cart_items").delete().in("product_id", removed);
      }
    },
    [userId, supabase]
  );

  const add = useCallback(
    async (productId: number, quantity: number) => {
      const cur = linesRef.current;
      const prev = cur.find((l) => l.productId === productId);
      const line = { productId, quantity: Math.min((prev?.quantity ?? 0) + quantity, MAX_QTY) };
      const next = prev ? cur.map((l) => (l.productId === productId ? line : l)) : [...cur, line];
      await persist(next, [line]);
    },
    [persist]
  );

  const setQuantity = useCallback(
    async (productId: number, quantity: number) => {
      const q = Math.max(1, Math.min(quantity, MAX_QTY));
      const line = { productId, quantity: q };
      await persist(
        linesRef.current.map((l) => (l.productId === productId ? line : l)),
        [line]
      );
    },
    [persist]
  );

  const remove = useCallback(
    async (productIds: number[]) => {
      await persist(
        linesRef.current.filter((l) => !productIds.includes(l.productId)),
        [],
        productIds
      );
    },
    [persist]
  );

  const reload = useCallback(async () => {
    if (userId) await loadFromDb();
    else setLines(readLocal());
  }, [userId, loadFromDb]);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      reload,
    }),
    [lines, ready, add, setQuantity, remove, reload]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
