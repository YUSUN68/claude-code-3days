"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { won } from "@/lib/format";

export default function BuyBox({ productId, stock, unitPrice }: { productId: number; stock: number; unitPrice: number }) {
  const router = useRouter();
  const { add, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const soldOut = stock <= 0;
  const max = Math.min(stock, 99);
  const inCart = lines.find((l) => l.productId === productId)?.quantity ?? 0;

  async function addToCart() {
    if (inCart + qty > max) {
      alert(`재고가 부족합니다. 장바구니에 이미 ${inCart}개가 담겨 있어요.`);
      return;
    }
    setBusy(true);
    await add(productId, qty);
    setBusy(false);
    setAdded(true);
  }

  if (soldOut) {
    return (
      <div className="mt-6">
        <button className="btn w-full bg-line text-muted" disabled>
          품절
        </button>
        <p className="mt-2 text-center text-xs text-muted">재입고 예정입니다.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">수량</span>
        <div className="flex items-center rounded-md border border-line bg-white">
          <button className="flex h-11 w-11 items-center justify-center disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="수량 줄이기">
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button className="flex h-11 w-11 items-center justify-center disabled:opacity-30" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="수량 늘리기">
            <Plus size={16} />
          </button>
        </div>
      </div>
      {stock <= 5 && <p className="text-right text-xs text-terracotta">남은 수량 {stock}개</p>}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm">총 상품금액</span>
        <span className="text-xl font-semibold">{won(unitPrice * qty)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-outline" onClick={addToCart} disabled={busy}>
          장바구니 담기
        </button>
        <button className="btn-primary" onClick={() => router.push(`/checkout?buy=${productId}&qty=${qty}`)}>
          바로 구매
        </button>
      </div>
      {added && (
        <div className="flex items-center justify-between rounded-md bg-beige px-4 py-3 text-sm">
          <span>장바구니에 담았어요.</span>
          <Link href="/cart" className="font-medium text-brown underline-offset-2 hover:underline">
            장바구니 보기
          </Link>
        </div>
      )}
    </div>
  );
}
