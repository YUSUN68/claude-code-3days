import Link from "next/link";
import type { Metadata } from "next";
import { confirmPayment } from "@/lib/payments";
import { won } from "@/lib/format";
import CartRefresh from "./CartRefresh";

export const metadata: Metadata = { title: "결제 결과" };

type SP = Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SP }) {
  const { paymentKey, orderId, amount } = await searchParams;
  if (!paymentKey || !orderId || !amount) {
    return <Result title="잘못된 접근이에요" message="결제 정보가 올바르지 않습니다." />;
  }
  const result = await confirmPayment(paymentKey, orderId, Number(amount));
  if (!result.ok) {
    return <Result title="결제를 완료하지 못했어요" message={result.message} />;
  }
  const { order } = result;

  return (
    <div className="container-page flex justify-center py-20">
      <CartRefresh />
      <div className="w-full max-w-md text-center">
        <p className="text-4xl" aria-hidden>🕯️</p>
        <h1 className="mt-4 font-serif text-3xl font-light">주문이 완료되었어요</h1>
        <p className="mt-2 text-sm text-muted">따뜻한 소품을 정성껏 포장해 보내 드릴게요.</p>
        <dl className="mt-8 space-y-3 rounded-md border border-line bg-white/70 p-6 text-left text-sm">
          <Row label="주문번호" value={order.order_no} />
          <Row label="주문상품" value={order.order_name} />
          <Row label="결제수단" value={order.payment_method ?? "-"} />
          <Row label="결제금액" value={won(order.total_amount)} strong />
          <Row label="배송지" value={`${order.address1} ${order.address2 ?? ""}`} />
        </dl>
        <div className="mt-8 grid grid-cols-2 gap-2">
          <Link href={`/mypage/orders/${order.id}`} className="btn-outline">주문 상세 보기</Link>
          <Link href="/products" className="btn-primary">쇼핑 계속하기</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex gap-4">
      <dt className="w-16 shrink-0 text-muted">{label}</dt>
      <dd className={strong ? "font-semibold text-brown" : ""}>{value}</dd>
    </div>
  );
}

function Result({ title, message }: { title: string; message: string }) {
  return (
    <div className="container-page py-32 text-center">
      <h1 className="section-title">{title}</h1>
      <p className="mt-3 text-sm text-muted">{message}</p>
      <Link href="/cart" className="btn-primary mt-8 px-8">장바구니로 돌아가기</Link>
    </div>
  );
}
