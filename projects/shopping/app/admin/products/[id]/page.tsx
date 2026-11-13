import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getThemes } from "@/lib/catalog";
import ProductForm from "../ProductForm";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: links }, categories, themes] = await Promise.all([
    supabase.from("shop_products").select("*").eq("id", Number(id)).maybeSingle<Product>(),
    supabase.from("shop_product_themes").select("theme_id").eq("product_id", Number(id)),
    getCategories(),
    getThemes(),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">상품 수정</h2>
      <ProductForm categories={categories} themes={themes} product={product} themeIds={(links ?? []).map((l) => l.theme_id)} />
    </div>
  );
}
