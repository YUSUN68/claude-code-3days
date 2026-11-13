"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BUDGET, PRICE_RANGES, budgetLabel, type Budget } from "@/lib/constants";

type Props = {
  /** 현재 적용된 예산 (null = 선택 안 함) */
  value: Budget | null;
  /** 예산 외에 유지할 쿼리 (theme, category) */
  baseQuery: string;
};

const toSlider = (b: Budget | null): [number, number] => [b?.min ?? BUDGET.min, b?.max ?? BUDGET.max];
const fromSlider = ([lo, hi]: [number, number]): Budget => ({ min: lo, max: hi >= BUDGET.max ? null : hi });

export default function BudgetSlider({ value, baseQuery }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [range, setRange] = useState<[number, number]>(toSlider(value));
  const [lo, hi] = range;

  // 뒤로가기·프리셋 등으로 URL 이 바뀌면 슬라이더도 맞춤
  useEffect(() => setRange(toSlider(value)), [value?.min, value?.max]); // eslint-disable-line react-hooks/exhaustive-deps

  function apply(next: Budget | null) {
    const params = new URLSearchParams(baseQuery);
    if (next) {
      if (next.min > 0) params.set("min", String(next.min));
      if (next.max != null) params.set("max", String(next.max));
      if (next.min <= 0 && next.max == null) params.set("min", "0"); // "전체 가격대"도 선택한 것으로 표시
    }
    const s = params.toString();
    startTransition(() => router.replace(`/gift${s ? `?${s}` : ""}`, { scroll: false }));
  }

  const commit = () => apply(fromSlider(range));
  const pct = (v: number) => ((v - BUDGET.min) / (BUDGET.max - BUDGET.min)) * 100;
  const live = fromSlider(range);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className={`font-serif text-2xl font-light ${value ? "text-brown" : "text-muted"}`} aria-live="polite">
          {value || lo !== BUDGET.min || hi !== BUDGET.max ? budgetLabel(live) : "예산을 정해 주세요"}
        </p>
        {pending && <span className="text-xs text-muted">찾는 중…</span>}
      </div>

      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brown"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="최소 예산"
          className="budget-thumb"
          style={{ zIndex: lo > BUDGET.max / 2 ? 2 : 1 }}
          min={BUDGET.min}
          max={BUDGET.max}
          step={BUDGET.step}
          value={lo}
          onChange={(e) => setRange([Math.min(Number(e.target.value), hi - BUDGET.step), hi])}
          onPointerUp={commit}
          onKeyUp={commit}
        />
        <input
          type="range"
          aria-label="최대 예산"
          className="budget-thumb"
          min={BUDGET.min}
          max={BUDGET.max}
          step={BUDGET.step}
          value={hi}
          onChange={(e) => setRange([lo, Math.max(Number(e.target.value), lo + BUDGET.step)])}
          onPointerUp={commit}
          onKeyUp={commit}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>0원</span>
        <span>5만원</span>
        <span>10만원</span>
        <span>15만원+</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRICE_RANGES.map((r) => {
          const active = value?.min === r.min && value?.max === r.max;
          return (
            <button
              key={r.key}
              type="button"
              className={active ? "chip-active" : "chip"}
              onClick={() => (active ? apply(null) : apply({ min: r.min, max: r.max }))}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
