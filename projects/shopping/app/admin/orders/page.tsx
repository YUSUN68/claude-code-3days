import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { OrderTable } from "@/components/OrderTable";
import type { Order, OrderStatus } from "@/lib/types";

const FILTERS: (OrderStatus | "all")[] = ["all", "paid", "shipping", "delivered", "cancelled"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = (FILTERS as string[]).includes(status ?? "") ? (status as OrderStatus) : "all";
  const supabase = await createClient();
  let query = supabase.from("shop_orders").select("*").neq("status", "pending").order("created_at", { ascending: false }).limit(200);
  if (active !== "all") query = query.eq("status", active);
  const { data } = await query;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`} className={active === f ? "chip-active" : "chip"}>
            {f === "all" ? "전체" : ORDER_STATUS_LABEL[f]}
          </Link>
        ))}
      </div>
      <OrderTable orders={(data ?? []) as Order[]} />
    </div>
  );
}
