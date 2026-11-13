import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductCard";
import { getCategories, getGiftProducts, getThemes } from "@/lib/catalog";
import { BUDGET, PRICE_RANGES, type Budget } from "@/lib/constants";
import BudgetSlider from "./BudgetSlider";

export const metadata: Metadata = { title: "선물 추천" };

type SP = Promise<{ theme?: string; price?: string; min?: string; max?: string; category?: string }>;

/** ?min=&max= (또는 예전 ?price=키) 를 예산 범위로 */
function parseBudget(sp: Awaited<SP>): Budget | null {
  const preset = PRICE_RANGES.find((r) => r.key === sp.price);
  if (preset) return { min: preset.min, max: preset.max };
  if (sp.min == null && sp.max == null) return null;
  const clamp = (n: number) => Math.min(BUDGET.max, Math.max(0, Math.round(n / BUDGET.step) * BUDGET.step));
  const min = clamp(Number(sp.min) || 0);
  const maxRaw = sp.max == null ? null : Number(sp.max);
  const max = maxRaw == null || !Number.isFinite(maxRaw) || maxRaw >= BUDGET.max ? null : clamp(maxRaw);
  return max != null && max <= min ? { min, max: min + BUDGET.step } : { min, max };
}

export default async function GiftPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [themes, categories] = await Promise.all([getThemes(), getCategories()]);
  const theme = themes.find((t) => t.slug === sp.theme) ?? null;
  const budget = parseBudget(sp);
  const category = categories.find((c) => c.slug === sp.category) ?? null;
  const hasSelection = Boolean(theme || budget || category);

  const result = hasSelection
    ? await getGiftProducts(theme?.id ?? null, budget, category?.id ?? null)
    : null;

  // 테마·카테고리 칩: 같은 칩을 다시 누르면 선택 해제, 예산은 그대로 유지
  const href = (patch: { theme?: string; category?: string }) => {
    const params = new URLSearchParams();
    const t = patch.theme !== undefined ? (patch.theme === theme?.slug ? null : patch.theme) : theme?.slug;
    const c = patch.category !== undefined ? (patch.category === category?.slug ? null : patch.category) : category?.slug;
    if (t) params.set("theme", t);
    if (c) params.set("category", c);
    if (budget) {
      params.set("min", String(budget.min));
      if (budget.max != null) params.set("max", String(budget.max));
    }
    const s = params.toString();
    return `/gift${s ? `?${s}` : ""}`;
  };
  // 슬라이더가 예산을 바꿀 때 유지할 조건
  const baseQuery = new URLSearchParams(
    Object.entries({ theme: theme?.slug, category: category?.slug }).filter((e): e is [string, string] => !!e[1])
  ).toString();

  return (
    <div className="container-page pt-12">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm tracking-[0.3em] text-brown">GIFT GUIDE</p>
        <h1 className="section-title">마음에 꼭 맞는 선물 찾기</h1>
        <p className="mt-2 text-sm text-muted">누구에게, 어떤 날, 얼마 정도의 선물인지 골라 주세요</p>
      </header>

      <div className="mx-auto max-w-4xl space-y-8 rounded-md border border-line bg-white/60 p-5 sm:p-8">
        <Step no={1} title="어떤 날의 선물인가요?">
          {themes.map((t) => (
            <Link key={t.id} href={href({ theme: t.slug })} className={theme?.id === t.id ? "chip-active" : "chip"} scroll={false}>
              <span aria-hidden>{t.emoji}</span> {t.name}
            </Link>
          ))}
        </Step>
        <Step no={2} title="예산은 어느 정도인가요?" hint="막대를 좌우로 움직여 범위를 정해 보세요">
          <BudgetSlider value={budget} baseQuery={baseQuery} />
        </Step>
        <Step no={3} title="원하는 종류가 있나요?" optional>
          {categories.map((c) => (
            <Link key={c.id} href={href({ category: c.slug })} className={category?.id === c.id ? "chip-active" : "chip"} scroll={false}>
              {c.name}
            </Link>
          ))}
        </Step>
        {hasSelection && (
          <div className="text-right">
            <Link href="/gift" className="text-sm text-muted underline-offset-2 hover:underline" scroll={false}>
              선택 초기화
            </Link>
          </div>
        )}
      </div>

      <section className="mt-14">
        {!result ? (
          <p className="py-16 text-center text-muted">위에서 테마나 예산을 골라 보세요. 바로 추천해 드릴게요.</p>
        ) : (
          <>
            <div className="mb-8 text-center">
              {theme && <p className="font-serif text-xl font-light sm:text-2xl">{theme.emoji} {theme.tagline}</p>}
              {theme?.description && <p className="mt-2 text-sm text-muted">{theme.description}</p>}
              {result.widened && (
                <p className="mx-auto mt-4 max-w-md rounded-md bg-beige px-4 py-3 text-sm">
                  선택하신 가격대에 맞는 상품이 없어 <b>{result.widened}</b> 범위의 비슷한 선물을 추천해 드려요.
                </p>
              )}
            </div>
            {result.products.length > 0 ? (
              <ProductGrid products={result.products} />
            ) : (
              <p className="py-16 text-center text-muted">조건에 맞는 상품이 없어요. 다른 조건을 골라 보세요.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function Step({ no, title, hint, optional, children }: { no: number; title: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brown text-xs text-ivory">{no}</span>
        {title}
        {optional && <span className="ml-2 text-xs font-normal text-muted">선택</span>}
        {hint && <span className="ml-2 hidden text-xs font-normal text-muted sm:inline">{hint}</span>}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
