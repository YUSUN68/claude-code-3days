"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { won } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, shippingFeeFor } from "@/lib/constants";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const { lines, ready, setQuantity, remove } = useCart();
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loaded, setLoaded] = useState(false);
  const [deselected, setDeselected] = useState<Set<number>>(new Set());

  const ids = useMemo(() => lines.map((l) => l.productId).sort().join(","), [lines]);

  useEffect(() => {
    if (!ready) return;
    const list = ids ? ids.split(",").map(Number) : [];
    if (list.length === 0) {
      setLoaded(true);
      return;
    }
    createClient()
      .from("shop_products")
      .select("*")
      .in("id", list)
      .then(({ data }) => {
        setProducts(Object.fromEntries((data ?? []).map((p) => [p.id, p])));
        setLoaded(true);
      });
  }, [ids, ready]);

  const rows = lines
    .map((l) => ({ ...l, product: products[l.productId] }))
    .filter((r) => r.product);
  const orderable = rows.filter((r) => r.product.is_active && r.product.stock > 0);
  const selected = orderable.filter((r) => !deselected.has(r.productId));
  const itemsAmount = selected.reduce((s, r) => s + r.product.final_price * r.quantity, 0);
  const shipping = shippingFeeFor(itemsAmount);
  const overStock = selected.some((r) => r.quantity > r.product.stock);

  const toggle = (id: number) =>
    setDeselected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allSelected = orderable.length > 0 && selected.length === orderable.length;

  if (!ready || !loaded) {
    return <div className="container-page py-32 text-center text-muted">장바구니를 불러오는 중…</div>;
  }

  if (rows.length === 0) {
    return (
      <div className="container-page py-32 text-center">
        <h1 className="section-title">장바구니가 비어 있어요</h1>
        <p className="mt-3 text-sm text-muted">마음에 드는 소품을 담아 보세요.</p>
        <Link href="/products" className="btn-primary mt-8 px-8">쇼핑 계속하기</Link>
      </div>
    );
  }

  return (
    <div className="container-page pt-12">
      <h1 className="section-title mb-8">장바구니</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-center justify-between border-b border-ink pb-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brown"
                checked={allSelected}
                onChange={() => setDeselected(allSelected ? new Set(orderable.map((r) => r.productId)) : new Set())}
              />
              전체 선택 ({selected.length}/{orderable.length})
            </label>
            <button
              className="text-muted hover:text-ink disabled:opacity-40"
              disabled={selected.length === 0}
              onClick={() => remove(selected.map((r) => r.productId))}
            >
              선택 삭제
            </button>
          </div>
          <ul>
            {rows.map(({ productId, quantity, product }) => {
              const unavailable = !product.is_active || product.stock <= 0;
              return (
                <li key={productId} className="flex gap-4 border-b border-line py-5">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-brown"
                    checked={!unavailable && !deselected.has(productId)}
                    disabled={unavailable}
                    onChange={() => toggle(productId)}
                    aria-label={`${product.name} 선택`}
                  />
                  <Link href={`/products/${product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-beige">
                    {product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${product.slug}`} className="text-sm hover:underline">{product.name}</Link>
                      <button onClick={() => remove([productId])} aria-label="삭제" className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center text-muted hover:text-ink">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-muted">{won(product.final_price)}</p>
                    {unavailable ? (
                      <p className="mt-auto text-sm text-terracotta">품절된 상품이에요</p>
                    ) : (
                      <div className="mt-auto flex items-end justify-between pt-3">
                        <div className="flex items-center rounded-md border border-line bg-white">
                          <button className="flex h-9 w-9 items-center justify-center disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity(productId, quantity - 1)} aria-label="수량 줄이기">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{quantity}</span>
                          <button className="flex h-9 w-9 items-center justify-center disabled:opacity-30" disabled={quantity >= Math.min(product.stock, 99)} onClick={() => setQuantity(productId, quantity + 1)} aria-label="수량 늘리기">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-semibold">{won(product.final_price * quantity)}</span>
                      </div>
                    )}
                    {!unavailable && quantity > product.stock && (
                      <p className="mt-1 text-xs text-terracotta">재고가 {product.stock}개 남았어요. 수량을 줄여 주세요.</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="h-fit rounded-md border border-line bg-white/70 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-medium">결제 예정 금액</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">상품 금액</dt><dd>{won(itemsAmount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">배송비</dt><dd>{shipping === 0 ? "무료" : won(shipping)}</dd></div>
          </dl>
          {itemsAmount > 0 && itemsAmount < FREE_SHIPPING_THRESHOLD && (
            <p className="mt-3 rounded-md bg-beige px-3 py-2 text-xs">
              {won(FREE_SHIPPING_THRESHOLD - itemsAmount)} 더 담으면 무료배송!
            </p>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span>총 결제 금액</span>
            <span className="text-xl font-semibold">{won(itemsAmount + shipping)}</span>
          </div>
          <button
            className="btn-primary mt-6 w-full"
            disabled={selected.length === 0 || overStock}
            onClick={() => router.push(`/checkout?items=${selected.map((r) => r.productId).join(",")}`)}
          >
            {selected.length}개 상품 주문하기
          </button>
          <Link href="/products" className="mt-3 block text-center text-sm text-muted hover:text-ink">쇼핑 계속하기</Link>
        </aside>
      </div>
    </div>
  );
}
