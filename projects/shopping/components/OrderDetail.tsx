import { formatDate, won } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import type { Order, OrderItem } from "@/lib/types";

export default function OrderDetail({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-medium">주문번호 {order.order_no}</h2>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">{formatDate(order.created_at, true)}</span>
      </div>

      <section>
        <h3 className="mb-3 border-b border-ink pb-2 text-sm font-medium">주문 상품</h3>
        <ul className="divide-y divide-line">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-4 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-beige">
                {it.product_image && <img src={it.product_image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate">{it.product_name}</p>
                <p className="text-muted">{won(it.unit_price)} · {it.quantity}개</p>
              </div>
              <p className="text-sm font-semibold">{won(it.unit_price * it.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h3 className="mb-3 border-b border-ink pb-2 text-sm font-medium">배송지</h3>
          <dl className="space-y-1 text-sm">
            <p>{order.recipient} · {order.phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3")}</p>
            <p className="text-muted">[{order.zipcode}] {order.address1} {order.address2}</p>
            {order.memo && <p className="text-muted">메모: {order.memo}</p>}
          </dl>
        </section>
        <section>
          <h3 className="mb-3 border-b border-ink pb-2 text-sm font-medium">결제 정보</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">상품 금액</dt><dd>{won(order.items_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">배송비</dt><dd>{order.shipping_fee ? won(order.shipping_fee) : "무료"}</dd></div>
            <div className="flex justify-between font-semibold"><dt>총 결제 금액</dt><dd className="text-brown">{won(order.total_amount)}</dd></div>
            {order.payment_method && <div className="flex justify-between"><dt className="text-muted">결제 수단</dt><dd>{order.payment_method}</dd></div>}
            {order.paid_at && <div className="flex justify-between"><dt className="text-muted">결제 일시</dt><dd>{formatDate(order.paid_at, true)}</dd></div>}
          </dl>
        </section>
      </div>
    </div>
  );
}
