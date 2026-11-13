import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetail from "@/components/OrderDetail";
import type { Order, OrderItem } from "@/lib/types";

export default async function MyOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  // RLS: 본인 주문만 조회됨
  const { data: order } = await supabase.from("shop_orders").select("*").eq("id", id).maybeSingle<Order>();
  if (!order) notFound();
  const { data: items } = await supabase.from("shop_order_items").select("*").eq("order_id", id).order("id");

  return (
    <div>
      <Link href="/mypage" className="mb-6 inline-block text-sm text-muted hover:text-ink">← 주문 내역</Link>
      <OrderDetail order={order} items={(items ?? []) as OrderItem[]} />
    </div>
  );
}
