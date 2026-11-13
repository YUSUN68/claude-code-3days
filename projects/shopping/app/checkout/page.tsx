import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient, getProfile } from "@/lib/supabase/server";
import CheckoutForm, { type CheckoutLine } from "./CheckoutForm";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "주문/결제" };

type SP = Promise<{ buy?: string; qty?: string; items?: string }>;

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { user, profile } = await getProfile();
  if (!user) redirect("/login?next=/checkout");
  const supabase = await createClient();

  let lines: CheckoutLine[] = [];
  if (sp.buy) {
    // 바로 구매
    const qty = Math.max(1, Math.min(99, Number(sp.qty) || 1));
    const { data } = await supabase.from("shop_products").select("*").eq("id", Number(sp.buy)).maybeSingle();
    if (data) lines = [{ product: data as Product, quantity: qty }];
  } else {
    // 장바구니에서 선택한 상품
    const ids = (sp.items ?? "").split(",").map(Number).filter(Boolean);
    let query = supabase.from("shop_cart_items").select("quantity, shop_products(*)").order("created_at");
    if (ids.length) query = query.in("product_id", ids);
    const { data } = await query;
    lines = ((data ?? []) as unknown as { quantity: number; shop_products: Product }[]).map((r) => ({
      product: r.shop_products,
      quantity: r.quantity,
    }));
  }
  lines = lines.filter((l) => l.product && l.product.is_active && l.product.stock > 0);
  if (lines.length === 0) redirect("/cart");

  return (
    <div className="container-page pt-12">
      <h1 className="section-title mb-8">주문 / 결제</h1>
      <CheckoutForm
        lines={lines}
        customerKey={user.id}
        email={user.email ?? ""}
        defaults={{
          recipient: profile?.name ?? "",
          phone: profile?.phone ?? "",
          zipcode: profile?.zipcode ?? "",
          address1: profile?.address1 ?? "",
          address2: profile?.address2 ?? "",
        }}
      />
    </div>
  );
}
