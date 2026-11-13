"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { GIFT_WRAP_PHOTO, shippingFeeFor } from "@/lib/constants";
import type { Product } from "@/lib/types";

const TABS = ["상세 설명", "사이즈 · 정보", "배송 / 교환 안내"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  product: Product;
  categoryName: string;
};

export default function DetailTabs({ product, categoryName }: Props) {
  const [tab, setTab] = useState<Tab>("상세 설명");
  return (
    <section className="mt-20">
      {/* 탭: 스크롤해도 위에 붙어 있도록 sticky (헤더 높이만큼 아래) */}
      <div className="sticky top-16 z-10 flex border-b border-line bg-ivory/95 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px min-h-12 flex-1 border-b-2 text-sm transition-colors sm:flex-none sm:px-10 ${
              tab === t ? "border-brown font-medium text-ink" : "border-transparent text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "상세 설명" && <DetailDescription product={product} categoryName={categoryName} />}
      {tab === "사이즈 · 정보" && (
        <div className="mx-auto max-w-2xl py-12">
          <SpecTable product={product} />
        </div>
      )}
      {tab === "배송 / 교환 안내" && <ShippingInfo />}
    </section>
  );
}

/* ───────── 상세 설명: 사진과 글을 번갈아 보여 주는 쇼핑몰 상세페이지 형식 ───────── */
function DetailDescription({ product, categoryName }: Props) {
  const summary = product.summary ?? "";
  const description = product.description ?? "";
  // description 은 "한 줄 소개 + 이야기" 로 저장되어 있어서, 앞의 한 줄 소개는 빼고 이야기 부분만 씀
  const story = summary && description.startsWith(summary) ? description.slice(summary.length).trim() : description;
  const [main, second] = product.images;
  const [detail1, detail2] = product.detail_images;

  return (
    <div className="mx-auto max-w-3xl py-14 text-center">
      {/* 1. 도입 */}
      <p className="text-xs tracking-[0.3em] text-brown">{categoryName.toUpperCase()}</p>
      <h2 className="mt-3 font-serif text-3xl font-light sm:text-4xl">{product.name}</h2>
      {summary && <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink/80">{summary}</p>}

      {main && <DetailImage src={main} alt={product.name} className="mt-10 aspect-square" />}

      {/* 2. 이런 점이 좋아요 */}
      {product.highlights.length > 0 && (
        <div className="mt-20">
          <h3 className="section-title">이런 점이 좋아요</h3>
          <ol className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {product.highlights.map((h, i) => (
              <li key={h} className="rounded-md border border-line bg-white/70 p-5">
                <span className="font-serif text-2xl text-brown">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 text-sm leading-relaxed">{h}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 3. 이야기 + 상세 사진 */}
      {detail1 && <DetailImage src={detail1} alt="" className="mt-20 aspect-[3/2]" />}
      {story && (
        <p className="mx-auto mt-10 max-w-xl whitespace-pre-line text-left text-[15px] leading-loose text-ink/85 sm:text-center">
          {story}
        </p>
      )}
      {(second || detail2) && (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {second && <DetailImage src={second} alt={`${product.name} 다른 모습`} className="aspect-square" />}
          {detail2 && <DetailImage src={detail2} alt="" className="aspect-square" />}
        </div>
      )}

      {/* 4. 사이즈·정보 요약 */}
      <div className="mt-20 text-left">
        <h3 className="section-title mb-6 text-center">사이즈 · 상세 정보</h3>
        <SpecTable product={product} />
      </div>

      {/* 5. 선물 포장 안내 (선물 쇼핑몰이라 모든 상품에 보여 줌) */}
      <GiftWrapNote />
    </div>
  );
}

function DetailImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  // 상세 사진은 크게 보여 주므로 더 큰 해상도로 요청 (Unsplash 주소의 w·h 값을 바꿈)
  const large = src.replace("w=800&h=800", "w=1200&h=1200");
  return (
    <div className={`overflow-hidden rounded-md bg-beige ${className}`}>
      <img src={large} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

/* ───────── 사이즈·소재·구성·관리 방법 표 ───────── */
function SpecTable({ product }: { product: Product }) {
  const rows: [string, React.ReactNode][] = [
    ["사이즈", product.size_info],
    ["소재", product.material],
    ["구성", product.components],
    [
      "관리 방법",
      product.care_info && (
        <ul className="list-disc space-y-1 pl-4">
          {product.care_info.split("\n").map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ),
    ],
  ];
  const filled = rows.filter(([, v]) => v);
  if (filled.length === 0) return <p className="text-center text-sm text-muted">등록된 상세 정보가 없어요.</p>;

  return (
    <>
      <dl className="divide-y divide-line border-y border-ink/80 text-sm">
        {filled.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[88px_1fr] gap-4 py-4 sm:grid-cols-[120px_1fr]">
            <dt className="font-medium text-ink">{label}</dt>
            <dd className="leading-relaxed text-ink/80">{value}</dd>
          </div>
        ))}
      </dl>
      {product.size_info && (
        <p className="mt-3 text-xs text-muted">* 사이즈는 측정 방법에 따라 1~2cm 정도 차이가 있을 수 있어요.</p>
      )}
    </>
  );
}

function GiftWrapNote() {
  return (
    <div className="mt-20 overflow-hidden rounded-md border border-line bg-white/70 text-left sm:grid sm:grid-cols-2">
      <img src={GIFT_WRAP_PHOTO} alt="크라프트지와 끈으로 포장한 선물 상자" loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
      <div className="p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-medium text-terracotta">
          <Gift size={16} strokeWidth={1.75} /> 선물 포장 안내
        </p>
        <h3 className="mt-3 font-serif text-xl font-light">마음까지 예쁘게 담아 보내 드려요</h3>
        <ul className="mt-4 space-y-2 text-sm text-ink/80">
          <li>· 주문할 때 배송 메모에서 <b>선물 포장 부탁드려요</b>를 고르면 포장해 드려요.</li>
          <li>· 메시지를 함께 남겨 주시면 손글씨 카드에 적어 넣어 드려요.</li>
          <li>· 받는 분께 가격이 보이지 않도록 영수증은 넣지 않아요.</li>
        </ul>
      </div>
    </div>
  );
}

/* ───────── 배송·교환 안내 (기존 내용) ───────── */
function ShippingInfo() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12 text-sm leading-loose text-ink/85">
      <div>
        <h3 className="mb-2 font-medium">배송 안내</h3>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          <li>배송비 {shippingFeeFor(1).toLocaleString()}원, 50,000원 이상 구매 시 무료배송</li>
          <li>평일 오후 2시 이전 결제 완료 건은 당일 출고 (주말·공휴일 제외)</li>
          <li>출고 후 1~3일 이내 수령 (도서산간 지역은 추가 소요)</li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-medium">교환 / 반품 안내</h3>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          <li>상품 수령 후 7일 이내 신청 가능</li>
          <li>단순 변심에 의한 반품 시 왕복 배송비 6,000원 부담</li>
          <li>사용한 캔들·디퓨저 등 상품 가치가 훼손된 경우 교환·반품 불가</li>
          <li>파손·불량 상품은 사진과 함께 접수해 주시면 무료로 교환해 드립니다</li>
        </ul>
      </div>
    </div>
  );
}
