import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate, won } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import type { Order, OrderItem } from "@/lib/types";

export const metadata: Metadata = { title: "주문 내역" };

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_orders")
    .select("*, shop_order_items(product_image)")
    .neq("status", "pending")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as (Order & { shop_order_items: Pick<OrderItem, "product_image">[] })[];

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-line py-20 text-center">
        <p className="text-muted">아직 주문 내역이 없어요.</p>
        <Link href="/products" className="btn-primary mt-6 px-8">쇼핑하러 가기</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/mypage/orders/${o.id}`} className="flex items-center gap-4 rounded-md border border-line bg-white/60 p-4 transition-colors hover:border-brown">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-beige">
              {o.shop_order_items[0]?.product_image && (
                <img src={o.shop_order_items[0].product_image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{formatDate(o.created_at)}</span>
                <span>·</span>
                <span>{o.order_no}</span>
              </div>
              <p className="mt-1 truncate text-sm">{o.order_name}</p>
              <p className="text-sm font-semibold">{won(o.total_amount)}</p>
            </div>
            <StatusBadge status={o.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
