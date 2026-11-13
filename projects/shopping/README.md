# 온기 ONGI — 인테리어 소품 쇼핑몰

Next.js 15 (App Router) + Supabase + 토스페이먼츠(테스트) + Vercel

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 값 채우기 (아래 참고)
npm run dev
```

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 프로젝트 URL / publishable 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용.** 결제 승인 후 주문을 결제완료로 바꿀 때 사용 (Supabase 대시보드 > Project Settings > API Keys) |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` | 토스페이먼츠 결제위젯 테스트 키 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 주소 |

## 데이터베이스

- `supabase/migrations/` : 스키마·RLS·함수 (모든 테이블은 `shop_` 접두어 — 같은 프로젝트의 다른 앱 테이블과 분리)
- `supabase/seed/shop_seed.sql` : 샘플 데이터 (카테고리 6, 상품 48, 선물 테마 7)
- 샘플 데이터 수정: `scripts/seed-data.mjs` 편집 후 `node scripts/seed-data.mjs`
- 샘플 상품 사진: [Unsplash](https://unsplash.com) 무료 라이선스 사진을 링크로 사용 (`scripts/product-photos.json`에 상품별 사진 ID). 실제 상품 사진은 관리자 > 상품 관리에서 업로드해 교체하세요.

### 관리자 지정
가입 후 Supabase SQL Editor에서:
```sql
update public.shop_profiles set role = 'admin'
where id = (select id from auth.users where email = '관리자이메일');
```

## Supabase Auth 설정 (대시보드 > Authentication)
- **URL Configuration**: Site URL = 배포 주소, Redirect URLs 에 `http://localhost:3000/**`, `https://<vercel-도메인>/**` 추가
- **Email Templates**: 가입 확인·비밀번호 재설정 메일 문구를 한글로 변경
- 개발 중 빠른 테스트: Providers > Email 에서 "Confirm email" 끄기 (운영 전 다시 켜기)
- 보안: Password Security 의 "Leaked password protection" 켜기 권장

## Vercel 배포
1. GitHub에 푸시 → Vercel에서 Import
2. Environment Variables 에 `.env.local` 값 모두 등록 (`NEXT_PUBLIC_SITE_URL` 은 Vercel 도메인)
3. Supabase Redirect URLs 에 Vercel 도메인 추가

## 결제 테스트
테스트 키 사용 중에는 실제 결제가 되지 않습니다. 결제창에서 아무 카드나 선택해 진행하면 됩니다.
실서비스 전환 시 토스페이먼츠 가맹점 계약 후 라이브 키로 교체하세요.
