import type { OrderStatus } from "./types";

export const SITE_NAME = "온기 ONGI";

// DB 함수 shop_create_order 와 같은 규칙 유지
export const FREE_SHIPPING_THRESHOLD = 50000;
export const SHIPPING_FEE = 3000;

export function shippingFeeFor(itemsAmount: number) {
  return itemsAmount === 0 || itemsAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

// 선물 예산 슬라이더: 0원 ~ 15만원, 5천원 단위. 최댓값에 두면 "15만원 이상"(상한 없음)
export const BUDGET = { min: 0, max: 150000, step: 5000 } as const;

// 슬라이더 아래 빠른 선택 버튼 (max: null = 상한 없음)
export const PRICE_RANGES = [
  { key: "under-2", label: "~2만원", min: 0, max: 20000 },
  { key: "2-5", label: "2~5만원", min: 20000, max: 50000 },
  { key: "5-10", label: "5~10만원", min: 50000, max: 100000 },
  { key: "over-10", label: "10만원 이상", min: 100000, max: null },
] as const;

export type PriceRangeKey = (typeof PRICE_RANGES)[number]["key"];
export type Budget = { min: number; max: number | null };

const man = (n: number) => `${Number((n / 10000).toFixed(1))}만원`;

/** 예산 범위를 "2만원 ~ 5만원" 같은 문구로 */
export function budgetLabel({ min, max }: Budget) {
  if (min <= 0 && max == null) return "전체 가격대";
  if (min <= 0) return `${man(max!)} 이하`;
  if (max == null) return `${man(min)} 이상`;
  return `${man(min)} ~ ${man(max)}`;
}

export const SORTS = [
  { key: "new", label: "신상품순" },
  { key: "price-asc", label: "낮은가격순" },
  { key: "price-desc", label: "높은가격순" },
] as const;

export const PAGE_SIZE = 12;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제대기",
  paid: "결제완료",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
};

// 상품 상세페이지 아래 "선물 포장 안내" 사진 (Unsplash 무료 라이선스)
export const GIFT_WRAP_PHOTO = "https://images.unsplash.com/photo-1764764138818-0b22ab4d4023?w=900&h=675&fit=crop&q=80&auto=format";
