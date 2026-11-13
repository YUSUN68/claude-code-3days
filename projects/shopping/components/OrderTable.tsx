import Link from "next/link";
import { formatDate, won } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import type { Order } from "@/lib/types";

export function OrderTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return <p className="rounded-md border border-line py-12 text-center text-sm text-muted">주문이 없어요.</p>;
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-white/70">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-line bg-beige/50 text-left text-muted">
          <tr>
            <th className="px-4 py-3 font-normal">주문일시</th>
            <th className="px-4 py-3 font-normal">주문번호</th>
            <th className="px-4 py-3 font-normal">상품</th>
            <th className="px-4 py-3 font-normal">받는 분</th>
            <th className="px-4 py-3 text-right font-normal">금액</th>
            <th className="px-4 py-3 font-normal">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-beige/40">
              <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(o.created_at, true)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o.id}`} className="text-brown hover:underline">{o.order_no}</Link>
              </td>
              <td className="max-w-[220px] truncate px-4 py-3">{o.order_name}</td>
              <td className="px-4 py-3">{o.recipient}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">{won(o.total_amount)}</td>
              <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
