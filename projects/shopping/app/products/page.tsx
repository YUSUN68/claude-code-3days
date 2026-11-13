import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductCard";
import { getCategories, listProducts } from "@/lib/catalog";
import { PAGE_SIZE, SORTS } from "@/lib/constants";

export const metadata: Metadata = { title: "전체 상품" };

type SP = Promise<{ category?: string; sort?: string; q?: string; page?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === sp.category);
  const sort = SORTS.some((s) => s.key === sp.sort) ? sp.sort! : "new";
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || "";

  const { products, total } = await listProducts({ categoryId: category?.id, q, sort, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category: sp.category, sort: sort === "new" ? undefined : sort, q: q || undefined, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const s = params.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  return (
    <div className="container-page pt-12">
      <header className="mb-8 text-center">
        <h1 className="section-title">{q ? `‘${q}’ 검색 결과` : category?.name ?? "전체 상품"}</h1>
        {category?.description && !q && <p className="mt-2 text-sm text-muted">{category.description}</p>}
      </header>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        <Link href={href({ category: undefined, page: undefined })} className={!category ? "chip-active" : "chip"}>
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.slug, page: undefined })} className={category?.id === c.id ? "chip-active shrink-0" : "chip shrink-0"}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-line pb-3 text-sm">
        <span className="text-muted">총 {total}개</span>
        <div className="flex gap-3">
          {SORTS.map((s) => (
            <Link key={s.key} href={href({ sort: s.key === "new" ? undefined : s.key, page: undefined })} className={sort === s.key ? "font-medium text-ink" : "text-muted hover:text-ink"}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center text-muted">
          <p>찾으시는 상품이 없어요.</p>
          <Link href="/products" className="btn-outline mt-6">전체 상품 보기</Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      {totalPages > 1 && (
        <nav className="mt-14 flex justify-center gap-1" aria-label="페이지">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href({ page: n === 1 ? undefined : String(n) })}
              className={`flex h-10 w-10 items-center justify-center rounded-md text-sm ${n === page ? "bg-brown text-ivory" : "hover:bg-beige"}`}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
