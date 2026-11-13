import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductCard";
import Price from "@/components/Price";
import Gallery from "./Gallery";
import BuyBox from "./BuyBox";
import DetailTabs from "./DetailTabs";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  return data ? { title: data.product.name, description: data.product.summary ?? undefined } : {};
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getProductBySlug(decodeURIComponent(slug));
  if (!data) notFound();
  const { product, category, themes } = data;
  const related = await getRelatedProducts(product);

  return (
    <div className="container-page pt-8">
      <nav className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-ink">홈</Link> <span className="mx-1">/</span>
        <Link href={`/products?category=${category.slug}`} className="hover:text-ink">{category.name}</Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} name={product.name} />

        <div>
          <p className="text-sm text-brown">{category.name}</p>
          <h1 className="mt-1 font-serif text-2xl font-light sm:text-3xl">{product.name}</h1>
          <div className="mt-4">
            <Price price={product.price} salePrice={product.sale_price} size="lg" />
          </div>
          {product.summary && <p className="mt-5 text-sm text-muted">{product.summary}</p>}

          {themes.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {themes.map((t) => (
                <Link key={t.id} href={`/gift?theme=${t.slug}`} className="rounded-full bg-beige px-3 py-1 text-xs text-brown hover:bg-line">
                  #{t.name.replace("·", "")}선물
                </Link>
              ))}
            </div>
          )}

          <dl className="mt-6 space-y-2 border-y border-line py-5 text-sm">
            {product.size_info && (
              <div className="flex gap-6">
                <dt className="w-16 shrink-0 text-muted">사이즈</dt>
                <dd>{product.size_info}</dd>
              </div>
            )}
            {product.material && (
              <div className="flex gap-6">
                <dt className="w-16 shrink-0 text-muted">소재</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            <div className="flex gap-6">
              <dt className="w-16 text-muted">배송비</dt>
              <dd>3,000원 (5만원 이상 무료)</dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-16 text-muted">배송</dt>
              <dd>평일 오후 2시 이전 결제 시 당일 출고</dd>
            </div>
          </dl>

          <BuyBox productId={product.id} stock={product.stock} unitPrice={product.final_price} />
        </div>
      </div>

      <DetailTabs product={product} categoryName={category.name} />

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="section-title mb-8">함께 보면 좋은 상품</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
