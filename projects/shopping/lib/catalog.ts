import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, PRICE_RANGES, budgetLabel, type Budget } from "@/lib/constants";
import type { Category, GiftTheme, Product } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("shop_categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getThemes(): Promise<GiftTheme[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("shop_gift_themes").select("*").order("sort_order");
  return data ?? [];
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listProducts(opts: {
  categoryId?: number;
  q?: string;
  sort?: string;
  page?: number;
}): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const page = Math.max(1, opts.page ?? 1);
  let query = supabase.from("shop_products").select("*", { count: "exact" }).eq("is_active", true);
  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts.q) {
    // PostgREST 필터 문법 문자 제거 후 부분 일치 검색
    const term = opts.q.replace(/[%,()*\\]/g, " ").trim();
    if (term) query = query.ilike("name", `%${term}%`);
  }
  if (opts.sort === "price-asc") query = query.order("final_price", { ascending: true });
  else if (opts.sort === "price-desc") query = query.order("final_price", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  query = query.order("id").range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count } = await query;
  return { products: data ?? [], total: count ?? 0 };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_products")
    .select("*, shop_categories(*), shop_product_themes(shop_gift_themes(*))")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const { shop_categories, shop_product_themes, ...product } = data as Product & {
    shop_categories: Category;
    shop_product_themes: { shop_gift_themes: GiftTheme }[];
  };
  return {
    product: product as Product,
    category: shop_categories,
    themes: shop_product_themes.map((t) => t.shop_gift_themes).sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("is_featured", { ascending: false })
    .limit(limit);
  return data ?? [];
}

async function queryGift(themeId: number | null, range: { min: number; max: number | null } | null, categoryId: number | null) {
  const supabase = await createClient();
  let query = supabase
    .from("shop_products")
    .select(themeId ? "*, shop_product_themes!inner(theme_id)" : "*")
    .eq("is_active", true);
  if (themeId) query = query.eq("shop_product_themes.theme_id", themeId);
  if (range) {
    query = query.gte("final_price", range.min);
    if (range.max != null) query = query.lte("final_price", range.max);
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query
    .order("is_featured", { ascending: false })
    .order("final_price", { ascending: true })
    .limit(24);
  return ((data ?? []) as unknown as (Product & { shop_product_themes?: unknown })[]).map(
    ({ shop_product_themes: _ignored, ...p }) => p as Product
  );
}

// 선물 추천: 결과가 없으면 가격대를 한 단계씩 넓혀서 대체 추천
export async function getGiftProducts(themeId: number | null, budget: Budget | null, categoryId: number | null) {
  const exact = await queryGift(themeId, budget, categoryId);
  if (exact.length > 0 || !budget) return { products: exact, widened: null as string | null };

  // 예산 양쪽을 1만원씩(최대 5만원) 넓혀 보고, 그래도 없으면 전체 가격대
  const steps = [10000, 20000, 30000, 50000, Infinity];
  for (const d of steps) {
    const range: Budget =
      d === Infinity
        ? { min: 0, max: null }
        : { min: Math.max(0, budget.min - d), max: budget.max == null ? null : budget.max + d };
    const widened = await queryGift(themeId, range, categoryId);
    if (widened.length > 0) return { products: widened, widened: budgetLabel(range) };
  }
  return { products: [], widened: null };
}

// 홈 화면용: 테마별 대표 사진 (추천 상품 우선, 테마끼리 사진이 겹치지 않게)
export async function getThemeCovers(): Promise<Record<number, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_product_themes")
    .select("theme_id, shop_products!inner(images, is_featured, is_active)")
    .eq("shop_products.is_active", true);
  type Row = { theme_id: number; shop_products: { images: string[]; is_featured: boolean } };
  const rows = ((data ?? []) as unknown as Row[])
    .filter((r) => r.shop_products.images?.[0])
    .sort((x, y) => Number(y.shop_products.is_featured) - Number(x.shop_products.is_featured));
  const covers: Record<number, string> = {};
  const used = new Set<string>();
  // 상품이 적은 테마부터 고르면 선택지가 적은 테마도 겹치지 않는 사진을 받음
  const counts = new Map<number, number>();
  for (const r of rows) counts.set(r.theme_id, (counts.get(r.theme_id) ?? 0) + 1);
  for (const themeId of [...counts.keys()].sort((x, y) => counts.get(x)! - counts.get(y)!)) {
    const pick = rows.find((r) => r.theme_id === themeId && !used.has(r.shop_products.images[0]));
    const img = pick?.shop_products.images[0] ?? rows.find((r) => r.theme_id === themeId)!.shop_products.images[0];
    covers[themeId] = img;
    used.add(img);
  }
  return covers;
}

// 홈 화면용: 예산별 상품 수와 대표 사진
export async function getBudgetShowcase() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_products")
    .select("images, final_price, is_featured")
    .eq("is_active", true)
    .order("is_featured", { ascending: false });
  const rows = (data ?? []) as Pick<Product, "images" | "final_price" | "is_featured">[];
  return PRICE_RANGES.map((r) => {
    const inRange = rows.filter((p) => p.final_price >= r.min && (r.max == null || p.final_price <= r.max));
    return { ...r, count: inRange.length, image: inRange[0]?.images?.[0] ?? null };
  });
}
