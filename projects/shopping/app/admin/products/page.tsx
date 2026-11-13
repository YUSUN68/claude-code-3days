import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog";
import { won } from "@/lib/format";
import type { Product } from "@/lib/types";

type SP = Promise<{ q?: string; category?: string; filter?: string }>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const categories = await getCategories();
  const supabase = await createClient();
  let query = supabase.from("shop_products").select("*").order("created_at", { ascending: false });
  const cat = categories.find((c) => c.slug === sp.category);
  if (cat) query = query.eq("category_id", cat.id);
  if (sp.filter === "soldout") query = query.eq("stock", 0);
  if (sp.q) query = query.ilike("name", `%${sp.q.replace(/[%,()*\\]/g, " ")}%`);
  const { data } = await query;
  const products = (data ?? []) as Product[];
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <form className="flex gap-2">
          <input name="q" defaultValue={sp.q} placeholder="상품명 검색" className="input w-48" />
          <select name="category" defaultValue={sp.category ?? ""} className="input w-32">
            <option value="">전체</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <button className="btn-outline">검색</button>
        </form>
        <Link href="/admin/products?filter=soldout" className={sp.filter === "soldout" ? "chip-active" : "chip"}>품절만</Link>
        <Link href="/admin/products/new" className="btn-primary ml-auto">+ 상품 등록</Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-line bg-white/70">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-beige/50 text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">상품</th>
              <th className="px-4 py-3 font-normal">카테고리</th>
              <th className="px-4 py-3 text-right font-normal">판매가</th>
              <th className="px-4 py-3 text-right font-normal">재고</th>
              <th className="px-4 py-3 font-normal">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-beige/40">
                <td className="px-4 py-2">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-brown">
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-beige">
                      {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                    </span>
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted">{catName[p.category_id]}</td>
                <td className="whitespace-nowrap px-4 py-2 text-right">
                  {won(p.final_price)}
                  {p.sale_price != null && <span className="ml-1 text-xs text-muted line-through">{won(p.price)}</span>}
                </td>
                <td className={`px-4 py-2 text-right ${p.stock === 0 ? "font-semibold text-terracotta" : ""}`}>{p.stock}</td>
                <td className="px-4 py-2 text-xs">
                  {!p.is_active ? <span className="text-muted">숨김</span> : p.is_featured ? <span className="text-brown">추천</span> : "판매중"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="py-12 text-center text-sm text-muted">상품이 없어요.</p>}
      </div>
    </div>
  );
}
