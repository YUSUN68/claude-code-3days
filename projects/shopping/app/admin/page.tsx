import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { won } from "@/lib/format";
import { OrderTable } from "@/components/OrderTable";
import type { Order } from "@/lib/types";

export default async function AdminDashboard() {
  const supabase = await createClient();
  // 한국 시간 기준 오늘 0시
  const kstNow = new Date(Date.now() + 9 * 3600_000);
  const todayStart = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - 9 * 3600_000).toISOString();

  const [{ data: today }, { count: soldOut }, { count: toShip }, { data: recent }] = await Promise.all([
    supabase.from("shop_orders").select("total_amount").in("status", ["paid", "shipping", "delivered"]).gte("paid_at", todayStart),
    supabase.from("shop_products").select("id", { count: "exact", head: true }).eq("stock", 0),
    supabase.from("shop_orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("shop_orders").select("*").neq("status", "pending").order("created_at", { ascending: false }).limit(8),
  ]);

  const cards = [
    { label: "오늘 주문", value: `${today?.length ?? 0}건` },
    { label: "오늘 매출", value: won((today ?? []).reduce((s, o) => s + o.total_amount, 0)) },
    { label: "배송 준비 중", value: `${toShip ?? 0}건`, href: "/admin/orders?status=paid" },
    { label: "품절 상품", value: `${soldOut ?? 0}개`, href: "/admin/products?filter=soldout" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const body = (
            <>
              <p className="text-sm text-muted">{c.label}</p>
              <p className="mt-2 text-2xl font-semibold">{c.value}</p>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="rounded-md border border-line bg-white/70 p-5 hover:border-brown">{body}</Link>
          ) : (
            <div key={c.label} className="rounded-md border border-line bg-white/70 p-5">{body}</div>
          );
        })}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">최근 주문</h2>
          <Link href="/admin/orders" className="text-sm text-muted hover:text-brown">전체보기</Link>
        </div>
        <OrderTable orders={(recent ?? []) as Order[]} />
      </section>
    </div>
  );
}
