-- 상품 상세페이지용 정보 추가
-- 상세 사진, 특징 3줄, 사이즈·소재·구성·관리 방법
-- (shop_products 의 기존 RLS 정책이 그대로 적용됩니다: 누구나 읽기, 관리자만 쓰기)

alter table public.shop_products
  add column if not exists detail_images text[] not null default '{}',  -- 상세 설명 중간에 크게 보여 줄 사진
  add column if not exists highlights text[] not null default '{}',     -- "이런 점이 좋아요" 특징 문장들
  add column if not exists size_info text,                              -- 예: 지름 12cm × 높이 18cm
  add column if not exists material text,                               -- 예: 세라믹, 린넨
  add column if not exists components text,                             -- 예: 본체 1, USB-C 케이블 1
  add column if not exists care_info text;                              -- 관리·사용 시 주의사항
