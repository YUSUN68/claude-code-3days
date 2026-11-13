# AGENTS.md — 온기 ONGI 인테리어 소품 쇼핑몰

AI 코딩 에이전트(Claude Code, Codex, Cursor 등)가 이 저장소에서 작업할 때 먼저 읽어야 할 안내입니다.
사람용 설치·설정 안내는 [README.md](README.md)를 보세요.

## 이 프로젝트의 성격 (가장 중요)

- **수업 시간의 웹 개발 실습용 프로젝트**입니다. 실제로 운영하는 쇼핑몰이 아닙니다.
- 결제는 **토스페이먼츠 테스트 키**로만 동작하며 실제 돈이 오가지 않습니다. 라이브 키로 바꾸거나 실결제를 붙이지 마세요.
- 상품·주문·회원 데이터는 모두 실습용 샘플/테스트 데이터입니다. 실제 개인정보를 넣지 마세요.
- 작업하는 사람은 **학생**입니다. 그래서:
  - 답변과 코드 주석은 **한국어**로, 왜 그렇게 하는지 짧게 설명을 곁들여 주세요.
  - 수업 수준에서 이해할 수 있게 단순하게 유지하세요. 불필요한 추상화, 과한 설계, 새 라이브러리 추가는 피하고, 꼭 필요하면 이유를 먼저 말하세요.
  - 큰 변경(스키마 변경, 배포, 구조 개편)은 실행 전에 무엇을 할지 먼저 알려 주세요.
- 실습 환경은 **학교 Windows PC**(PowerShell)입니다. 셸 명령은 Windows에서 동작하는 형태로 안내하세요.

## 기술 스택

- Next.js 15 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 (`app/globals.css`, 별도 tailwind.config 없음)
- Supabase (Postgres + Auth + Storage), `@supabase/ssr`
- 토스페이먼츠 결제위젯 SDK (테스트 모드)
- 배포: Vercel

## 명령어

```bash
npm install
npm run dev     # http://localhost:3000 (Claude 앱 미리보기 이름: shop-dev)
npm run build   # 타입 체크 + 프로덕션 빌드 — 변경 후 확인용
npm run lint
```

- 자동화된 테스트는 없습니다. 변경 후에는 `npm run build` 와 브라우저에서 직접 확인합니다.

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `app/` | 페이지(라우트). `(auth)` 로그인·가입·비번재설정, `products` 상품, `gift` 예산별 선물 추천, `cart`, `checkout` 결제, `mypage`, `admin` 관리자 |
| `app/**/actions.ts` | Server Actions (서버에서 실행되는 폼 처리) |
| `components/` | 공통 UI (Header, ProductCard, CartProvider 등) |
| `lib/supabase/` | `client.ts`(브라우저) · `server.ts`(서버, 쿠키 세션) · `admin.ts`(service_role, 서버 전용) |
| `lib/payments.ts` | 토스 결제 승인 + 주문 결제완료 처리 |
| `lib/constants.ts` | 배송비 규칙, 가격대, 주문 상태 라벨 등 |
| `middleware.ts` | 로그인 필요 경로(`/mypage`, `/checkout`, `/admin`) 보호 |
| `supabase/migrations/` | DB 스키마·RLS·함수 SQL |
| `supabase/seed/shop_seed.sql` | 샘플 데이터 (`scripts/seed-data.mjs` 로 생성) |

## 반드시 지켜야 할 규칙

### 1. Supabase 프로젝트는 다른 앱과 공유 중
- Supabase 프로젝트 **YUSUN1** 에는 이 쇼핑몰 말고 **다른 수업 앱의 테이블**(`products`, `profiles`, `likes`, `chat_rooms`, `chat_messages`, `notifications`, `ledger_entries` 등)과 트리거가 함께 있습니다. `auth.users` 도 공유합니다.
- 이 쇼핑몰의 테이블·함수·정책·스토리지 버킷은 **모두 `shop_` 접두어**를 씁니다 (예: `shop_products`, `shop_create_order`, 버킷 `shop-product-images`).
- `shop_` 이 아닌 객체는 **절대 수정·삭제하지 마세요.** Supabase advisor 경고도 다른 앱 객체에 대한 것은 무시합니다.
- 새 테이블·함수를 만들 때도 반드시 `shop_` 접두어를 붙이세요.

### 2. DB 변경은 마이그레이션 파일로
- 스키마를 바꿀 때는 `supabase/migrations/` 에 새 파일(`YYYYMMDDHHMMSS_설명.sql`)을 추가하고 적용합니다. 기존 마이그레이션 파일은 고치지 않습니다.
- 모든 `shop_` 테이블은 RLS가 켜져 있습니다. 새 테이블에도 RLS와 정책을 꼭 넣으세요. 관리자 판별은 `shop_is_admin()` 함수를 씁니다.
- 샘플 데이터를 바꾸려면 `scripts/seed-data.mjs` 를 고친 뒤 `node scripts/seed-data.mjs` 로 `shop_seed.sql` 을 다시 만듭니다.

### 3. 보안·결제
- `SUPABASE_SERVICE_ROLE_KEY` 와 `TOSS_SECRET_KEY` 는 **서버 전용**입니다. `NEXT_PUBLIC_` 를 붙이거나 클라이언트 컴포넌트에서 쓰면 안 됩니다. `lib/supabase/admin.ts`, `lib/payments.ts` 는 `server-only` 로 막혀 있습니다.
- service_role 클라이언트(RLS 우회)는 결제 승인 후 주문 처리처럼 꼭 필요한 곳에만 씁니다.
- 결제 흐름: `createOrder`(Server Action → DB 함수 `shop_create_order`, 상태 `pending`) → 토스 결제위젯 → `/checkout/success` 에서 `confirmPayment` 가 **서버에서 금액을 다시 검증**한 뒤 토스 승인 API 호출 → `shop_mark_order_paid` 로 결제완료·재고 차감. 금액 검증을 빼지 마세요.
- 배송비 규칙(5만원 이상 무료, 아니면 3,000원)은 `lib/constants.ts` 와 DB 함수 `shop_create_order` **두 곳에 있습니다.** 바꿀 때는 둘 다 같이 바꾸세요.

### 4. 비밀 값과 Git
- `.env.local` 은 커밋하지 않습니다. 예시는 `.env.local.example` 에만 둡니다(여기에는 토스 공식 문서의 공개 테스트 키만 있음).
- `.gitignore` 의 `.env*` 규칙 뒤에 `!.env.local.example` 이 있어야 예시 파일이 추적됩니다. `vercel link` 를 다시 실행하면 이 부분이 망가질 수 있으니 확인하세요.

## 배포 (Vercel)

- 운영 주소: https://ongi-shop.vercel.app (Vercel 프로젝트 `ongi-shop`)
- Git 원격 저장소가 연결되어 있지 않아서, 배포는 로컬 폴더에서 Vercel CLI로 합니다: `vercel deploy --prod`
- 환경변수는 Vercel 프로젝트 설정에 등록되어 있습니다. 새 환경변수를 추가하면 Vercel에도 추가해야 합니다.
- 배포는 실습 결과물을 공개하는 일이므로, 학생이 요청했을 때만 진행하세요.

## 관리자 계정

가입 후 Supabase SQL Editor 에서 `shop_profiles.role` 을 `'admin'` 으로 바꾸면 `/admin` 에 들어갈 수 있습니다 (README 참고).
