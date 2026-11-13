"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("shop_is_admin");
  if (!isAdmin) throw new Error("관리자 권한이 필요합니다.");
  return supabase;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["shipping", "cancelled"],
  shipping: ["delivered"],
};

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await requireAdmin();
  const { data: order } = await supabase.from("shop_orders").select("status").eq("id", orderId).single();
  if (!order || !NEXT_STATUS[order.status as OrderStatus]?.includes(status)) {
    return { error: "변경할 수 없는 상태입니다." };
  }
  const { error } = await supabase.from("shop_orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export type ProductInput = {
  id?: number;
  category_id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  theme_ids: number[];
  // 상세페이지 정보
  detail_images: string[];
  highlights: string[];
  size_info: string;
  material: string;
  components: string;
  care_info: string;
};

export async function saveProduct(input: ProductInput) {
  const supabase = await requireAdmin();
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!input.name.trim()) return { error: "상품명을 입력해 주세요." };
  if (!slug) return { error: "주소(slug)는 영문 소문자·숫자·하이픈으로 입력해 주세요." };
  if (!(input.price >= 0)) return { error: "가격을 확인해 주세요." };
  if (input.sale_price != null && input.sale_price >= input.price) return { error: "할인가는 정가보다 낮아야 해요." };

  const row = {
    category_id: input.category_id,
    name: input.name.trim(),
    slug,
    summary: input.summary.trim() || null,
    description: input.description.trim() || null,
    price: Math.round(input.price),
    sale_price: input.sale_price == null ? null : Math.round(input.sale_price),
    stock: Math.max(0, Math.round(input.stock)),
    images: input.images,
    is_featured: input.is_featured,
    is_active: input.is_active,
    detail_images: input.detail_images,
    // 빈 줄은 빼고 저장
    highlights: input.highlights.map((h) => h.trim()).filter(Boolean),
    size_info: input.size_info.trim() || null,
    material: input.material.trim() || null,
    components: input.components.trim() || null,
    care_info: input.care_info.trim() || null,
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("shop_products").update(row).eq("id", id);
    if (error) return { error: error.code === "23505" ? "이미 사용 중인 주소(slug)예요." : error.message };
  } else {
    const { data, error } = await supabase.from("shop_products").insert(row).select("id").single();
    if (error) return { error: error.code === "23505" ? "이미 사용 중인 주소(slug)예요." : error.message };
    id = data.id;
  }

  await supabase.from("shop_product_themes").delete().eq("product_id", id);
  if (input.theme_ids.length) {
    const { error } = await supabase
      .from("shop_product_themes")
      .insert(input.theme_ids.map((theme_id) => ({ product_id: id, theme_id })));
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteProduct(id: number) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("shop_products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
