import Link from "next/link";
import { ArrowRight, Gift, PackageCheck, Truck } from "lucide-react";
import { ProductGrid } from "@/components/ProductCard";
import { getBudgetShowcase, getCategories, getFeaturedProducts, getNewProducts, getThemeCovers, getThemes } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { won } from "@/lib/format";

// 사진: Unsplash 무료 라이선스
const HERO_PHOTO = "https://images.unsplash.com/photo-1759563871375-d5b140f6646e?w=1600&q=80&auto=format&fit=crop";
const BANNER_PHOTO = "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1600&q=80&auto=format&fit=crop";

export default async function HomePage() {
  const [categories, themes, covers, budgets, newProducts, featured] = await Promise.all([
    getCategories(),
    getThemes(),
    getThemeCovers(),
    getBudgetShowcase(),
    getNewProducts(8),
    getFeaturedProducts(8),
  ]);

  return (
    <>
      {/* 히어로: 선물 가게라는 걸 첫 화면에서 */}
      <section className="relative overflow-hidden bg-beige">
        <div className="absolute inset-0 md:left-auto md:w-[55%]" aria-hidden>
          <img src={HERO_PHOTO} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-beige/80 md:bg-transparent md:bg-gradient-to-r md:from-beige md:via-beige/30 md:to-transparent" />
        </div>
        <div className="container-page relative flex min-h-[480px] flex-col justify-center py-20 sm:min-h-[580px]">
          <p className="mb-4 flex items-center gap-2 text-sm tracking-[0.3em] text-terracotta">
            <Gift size={16} strokeWidth={1.75} /> GIFT SHOP
          </p>
          <h1 className="max-w-xl font-serif text-4xl font-light leading-tight sm:text-5xl">
            마음을 전하는
            <br />
            따뜻한 선물
          </h1>
          <p className="mt-5 max-w-md text-muted">
            집들이, 생일, 기념일에 어울리는 인테리어 소품.
            <br className="hidden sm:block" /> 어떤 날인지, 예산이 얼마인지만 알려 주세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gift" className="btn-primary gap-2 px-8">
              <Gift size={18} strokeWidth={1.75} /> 선물 추천 받기
            </Link>
            <Link href="/products" className="btn-outline px-8">
              전체 상품 보기
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/80">
            <li className="flex items-center gap-1.5">
              <PackageCheck size={16} strokeWidth={1.5} className="text-brown" /> 모든 상품 선물 포장 가능
            </li>
            <li className="flex items-center gap-1.5">
              <Truck size={16} strokeWidth={1.5} className="text-brown" /> {won(FREE_SHIPPING_THRESHOLD)} 이상 무료배송
            </li>
          </ul>
        </div>
      </section>

      {/* 어떤 날의 선물인가요 */}
      <section className="container-page mt-20">
        <div className="mb-8 text-center">
          <h2 className="section-title">어떤 날의 선물인가요?</h2>
          <p className="mt-2 text-sm text-muted">상황을 고르면 어울리는 소품을 모아 보여 드려요</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {themes.map((t, i) => (
            <Link
              key={t.id}
              href={`/gift?theme=${t.slug}`}
              className={`group relative flex items-end overflow-hidden rounded-md bg-beige ${
                // 첫 테마(집들이)는 크게: 모바일 2칸, 태블릿 3칸, 데스크톱 2x2
                i === 0 ? "col-span-2 aspect-[2/1] sm:col-span-3 sm:aspect-[3/1] lg:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-[4/3]"
              }`}
            >
              {covers[t.id] && (
                <img
                  src={covers[t.id]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
              <div className="relative p-4 text-ivory sm:p-5">
                <p className={`font-medium ${i === 0 ? "text-xl lg:text-2xl" : "text-base"}`}>
                  <span aria-hidden>{t.emoji}</span> {t.name} 선물
                </p>
                <p className="mt-1 text-xs text-ivory/80 sm:text-sm">{t.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 예산별 선물 */}
      <section className="mt-24 bg-beige/70 py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <h2 className="section-title">예산에 맞춰 고르기</h2>
            <p className="mt-2 text-sm text-muted">부담 없는 작은 선물부터 특별한 날의 선물까지</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {budgets.map((b) => (
              <Link
                key={b.key}
                href={`/gift?min=${b.min}${b.max != null ? `&max=${b.max}` : ""}`}
                className="group overflow-hidden rounded-md border border-line bg-ivory transition-colors hover:border-brown"
              >
                <div className="aspect-[4/3] overflow-hidden bg-beige">
                  {b.image && (
                    <img src={b.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                  )}
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-serif text-lg">{b.label}</p>
                    <p className="text-xs text-muted">{b.count}개의 선물</p>
                  </div>
                  <ArrowRight size={18} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-brown" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/gift" className="btn-outline px-8">
              원하는 예산 직접 정하기
            </Link>
          </div>
        </div>
      </section>

      {/* 선물로 많이 찾는 */}
      {featured.length > 0 && (
        <section className="container-page mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">선물로 많이 찾는 소품</h2>
              <p className="mt-1 text-sm text-muted">받는 분의 취향을 몰라도 실패 없는 선택</p>
            </div>
            <Link href="/gift" className="flex shrink-0 items-center gap-1 text-sm text-muted hover:text-brown">
              더 찾아보기 <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* 신상품 */}
      <section className="container-page mt-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">새로 들어온 선물</h2>
          <Link href="/products" className="flex items-center gap-1 text-sm text-muted hover:text-brown">
            전체보기 <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={newProducts} />
      </section>

      {/* 카테고리 */}
      <section className="container-page mt-24">
        <h2 className="section-title mb-8 text-center">종류별로 보기</h2>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group flex w-24 shrink-0 flex-col items-center gap-3 sm:w-auto">
              <div className="aspect-square w-full overflow-hidden rounded-full bg-beige">
                {c.image_url && (
                  <img src={c.image_url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05]" />
                )}
              </div>
              <span className="text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 선물 포장 배너 */}
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-md px-6 py-20 text-center text-ivory sm:px-16">
          <img src={BANNER_PHOTO} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink/55" aria-hidden />
          <p className="relative font-serif text-xl font-light leading-relaxed sm:text-2xl">
            “좋은 빛과 좋은 향은
            <br className="sm:hidden" /> 마음을 대신 전합니다.”
          </p>
          <p className="relative mt-4 text-sm text-ivory/80">
            모든 상품은 선물 포장이 가능해요. 주문할 때 배송 메모에 남겨 주세요.
          </p>
          <Link href="/gift" className="btn relative mt-8 border border-ivory/70 px-8 text-ivory hover:bg-ivory hover:text-ink">
            선물 고르러 가기
          </Link>
        </div>
      </section>
    </>
  );
}
