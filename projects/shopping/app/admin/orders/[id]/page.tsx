import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetail from "@/components/OrderDetail";
import StatusControl from "./StatusControl";
import type { Order, OrderItem } from "@/lib/types";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: order } = await supabase.from("shop_orders").select("*").eq("id", id).maybeSingle<Order>();
  if (!order) notFound();
  const { data: items } = await supabase.from("shop_order_items").select("*").eq("order_id", id).order("id");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="mb-6 inline-block text-sm text-muted hover:text-ink">← 주문 목록</Link>
      <StatusControl orderId={order.id} status={order.status} />
      <OrderDetail order={order} items={(items ?? []) as OrderItem[]} />
    </div>
  );
}
