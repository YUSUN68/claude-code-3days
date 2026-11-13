# 퀘스트형 업무 스케줄러 (웹앱 + Supabase) 구현 계획

## Context
빈 폴더(`C:\Users\student\Desktop\scheduler`)에서 새로 시작한다. 업무를 게임 퀘스트처럼 보여주는 개인 업무 스케줄러를 만든다.
사용자가 정한 내용:
- 웹앱(브라우저)으로 만든다
- 데이터는 Supabase에 저장한다. 기존 프로젝트 `YUSUN1`(ref `wkdhpcyuuhnpoqdzhefp`, 서울 리전)을 쓰고, 테이블 이름 앞에 `sched_`를 붙여 기존 테이블 15개와 분리한다
- 워킹데이는 주말과 한국 공휴일(대체공휴일 포함)을 빼고 센다
- 디자인은 B안 레트로 픽셀 스타일로 한다
- 위젯은 우선 Chrome/Edge의 '항상 위' 미니창(Document Picture-in-Picture)으로만 만든다
- 알림은 탭을 닫아도 오도록 웹 푸시로 보낸다

## 기술 스택
- Vite + React + TypeScript (Node 24 / npm 11 설치되어 있음)
- `@supabase/supabase-js`: 인증(이메일+비밀번호), DB, Storage, Realtime
- FullCalendar (`@fullcalendar/react`, daygrid, timegrid, interaction): 월간·주간 캘린더, 한국어 로케일
- `@hyunbinseo/holidays-kr`: 한국 공휴일 데이터
- 폰트: Galmuri11(한글 픽셀 폰트, OFL) + Press Start 2P(영문 제목용)
- 테스트: Vitest

## DB 설계 (마이그레이션 `supabase/migrations/001_sched.sql`)
모든 테이블에 RLS를 켜고 `user_id = auth.uid()`인 행만 접근할 수 있게 한다.
- `sched_tasks`: id, user_id, kind(`quest|appointment` = 업무 퀘스트/약속), title, description, category, location(약속 장소, null 허용), start_at(여러 날에 걸친 일정의 시작, null 허용), due_at(timestamptz, null 허용), all_day, status(`todo|done`),
  - 업무 카테고리(kind=quest): `meeting|trip|work|deploy|vacation|training|event|etc` = 회의/출장/업무/반영/휴가/교육/행사/기타 (화면에 표시되는 카테고리 이름도 이대로 쓴다. 워크샵, 회식 등은 '행사'로 등록)
  - 약속 카테고리(kind=appointment): `lunch|dinner|personal` = 점심약속/저녁약속/기타약속
  - CHECK 제약으로 kind와 category 조합을 검증한다
  - 출장/휴가/교육/행사는 start_at~due_at 기간으로 등록할 수 있다 deploy_stage(0~4 = 개발요청>테스트>테스트완료>반영>반영완료, 반영 카테고리일 때만 사용), xp, completed_at, created_at, updated_at
- `sched_task_images`: id, task_id, user_id, storage_path. Storage 비공개 버킷 `sched-images`에 `{user_id}/{task_id}/파일`로 저장하고 경로 기준 RLS 적용
- `sched_reminders`: id, task_id, user_id, offset_minutes(10/30/60/120, '시간 지정'이면 null), remind_at, sent_at. 트리거로 `due_at`이 바뀌면 offset 알림의 `remind_at`을 다시 계산
- `sched_push_subscriptions`: user_id, endpoint(unique), p256dh, auth
- Realtime 발행 대상에 `sched_tasks`를 추가해 메인 탭과 위젯 창을 동기화
- 구현 시작할 때 `auth.users`에 기존 앱의 트리거(예: profiles 자동 생성)가 있는지 확인한다. 회원가입이 거기서 실패하지 않는지 보기 위해서다.

## 알림 (탭을 닫아도 동작)
1. 클라이언트: `public/sw.js` 서비스워커에서 `push` 이벤트를 받아 `showNotification`을 띄우고, 알림을 클릭하면 해당 퀘스트를 연다. 로그인한 뒤 알림 권한을 요청하고 구독 정보를 `sched_push_subscriptions`에 저장한다.
2. Edge Function `sched-send-reminders`(Deno, `npm:web-push`): `remind_at <= now()`이고 `sent_at is null`인 알림을 찾아 푸시를 보내고 `sent_at`을 기록한다. 응답이 404/410이면 그 구독을 삭제한다. VAPID 키와 호출용 시크릿은 Supabase secrets에 넣는다.
3. `pg_cron` + `pg_net`으로 1분마다 이 함수를 호출한다.
- Chrome이 백그라운드에서 실행 중이면 탭과 서버가 꺼져 있어도 Windows 알림이 온다.

## 화면 구성 (`src/`)
- `pages/Login.tsx`: 픽셀 스타일 "PRESS START" 로그인/회원가입 + "비밀번호를 잊으셨나요?" 링크
- 비밀번호 재설정
  - `pages/ForgotPassword.tsx`: 이메일을 입력하면 `supabase.auth.resetPasswordForEmail(email, { redirectTo: <origin>/reset-password })`을 호출해 재설정 메일을 보낸다. 가입 여부와 관계없이 같은 안내 문구를 보여준다
  - `pages/ResetPassword.tsx`: 메일 링크로 들어오면 `PASSWORD_RECOVERY` 이벤트를 받아 새 비밀번호와 확인을 입력하게 하고 `supabase.auth.updateUser({ password })`로 변경한다. 완료 후 대시보드로 이동하고, 링크가 만료됐으면 다시 요청하라고 안내한다
  - 로그인 상태에서 HUD 메뉴 → "비밀번호 변경"에서도 같은 폼을 쓴다
  - 사용자가 직접 할 일: Supabase 대시보드 Authentication → URL Configuration의 Redirect URLs에 `http://localhost:5173/reset-password`를 추가해야 한다(MCP로는 설정할 수 없음). 기본 메일 발송은 시간당 몇 통으로 제한되므로, 많이 쓰려면 SMTP를 따로 연결해야 한다
- `pages/Dashboard.tsx`
  - 상단 HUD: 레벨, EXP 바(완료한 퀘스트 XP 합계로 계산), 오늘 남은 퀘스트 수, `[위젯 띄우기]` 버튼
  - 빠른 등록 바 (`QuickAdd`, 위젯과 같은 컴포넌트): HUD 바로 아래 고정. 입력 후 Enter를 누르면 `-`로 시작할 때는 기타 카테고리로 바로 등록되고, 아니면 제목이 채워진 등록 모달이 열림
  - 긴급 퀘스트 구역: 남은 워킹데이가 3일 이하이거나 기한이 지난 퀘스트를 빨간 테두리와 깜빡이는 `!`로 따로 보여줌
  - 반영 파이프라인 (`DeployPipeline`): 개발요청 → 테스트 → 테스트완료 → 반영 → 반영완료, 5칸 보드. 카드의 `▶` 버튼이나 드래그로 다음 단계로 옮기고, 반영완료가 되면 퀘스트를 완료 처리
  - 기간별 퀘스트 보드: [오늘의 업무 | 이번 주 | 다음 주] 세 칸을 나란히 둔다(좁은 화면에서는 탭으로 전환)
    - 오늘의 업무: 기한이 오늘이거나 지난 것 + 기한 없는 것(`today.ts`와 같은 기준)
    - 이번 주: 내일부터 이번 주 일요일까지 기한인 것
    - 다음 주: 다음 주 월요일부터 일요일까지 기한인 것
    - 이번 주/다음 주는 날짜별로 묶어 "11/14(금)"처럼 제목을 달고, 공휴일과 휴가 날짜는 표시한다. 약속과 휴가·행사도 같은 날짜 아래에 아이콘과 점선 스타일로 함께 보여준다. 각 칸 위에 남은 개수를 표시한다
    - 완료된 항목은 줄을 긋고 아래로 내린다. 카드를 다른 칸으로 끌어 놓으면 기한을 그 날로 옮긴다(이번 주 칸은 이번 주 마지막 워킹데이, 다음 주 칸은 다음 주 월요일)
  - 전체 퀘스트 목록: 카테고리 필터, 완료 체크. 완료하면 "QUEST CLEAR! +XP" 연출
  - 오늘의 약속 패널: 업무와 분리된 별도 영역(여관/선술집 느낌의 픽셀 아이콘). 점심·저녁 약속을 시간순으로 보여주고 시간, 장소, 메모를 표시한다. XP, 긴급 구역, 완료 체크 대상이 아니다
  - 휴가·행사 배너: 오늘이나 다가오는 휴가/행사를 HUD 옆에 작게 표시한다
- `pages/CalendarPage.tsx`: FullCalendar 월간/주간 전환, 카테고리별 색, 공휴일 표시, 날짜를 클릭하면 등록하고 일정을 클릭하면 수정. 드래그로 기한을 옮길 수 있음
- `components/QuestForm.tsx` (모달): 맨 위에서 [업무 퀘스트 | 약속]을 고른다. 약속을 고르면 점심/저녁/기타, 일시, 장소, 메모, 알림만 보여주고 점심은 12:00, 저녁은 18:30을 기본 시간으로 채운다. 업무는 제목, 설명, 카테고리, 기한(날짜와 시간, 종일 여부, 출장·휴가·교육·행사는 기간), 반영 단계, 알림(10분/30분/1시간/2시간 전 체크, 시간 지정 추가), 이미지 업로드(여러 장, 썸네일 미리보기, 붙여넣기 지원)
- `components/WidgetPip.tsx`: `documentPictureInPicture.requestWindow({width:320,height:480})`로 창을 열고 스타일시트를 복사한 뒤 React 포털로 렌더링한다. 오늘의 퀘스트 목록(체크로 완료), `QuickAdd`를 넣는다. 지원하지 않는 브라우저에서는 안내 메시지를 보여준다. 메인 탭을 닫으면 미니창도 닫힌다.
- `components/QuestCard.tsx`, `XpBar.tsx`, `PixelButton.tsx`, `styles/pixel.css`: B안 팔레트(남색 배경 #1E1B3A, 흰색 픽셀 테두리, 노랑/초록/빨강 포인트). 그림자 대신 2~4px 계단식 테두리를 쓴다

## 핵심 로직 (`src/lib/`)
- `workdays.ts`: `remainingWorkdays(due, today, vacations)` = (오늘, 기한] 구간에서 주말, 공휴일, 내가 등록한 휴가 날짜를 뺀 일수. 기한이 오늘이면 0, 지났으면 음수. 결과가 3 이하이면 긴급으로 분류. 휴가·행사·약속 자체는 긴급 판정 대상에서 뺀다
- `quickAdd.ts`: `parseQuickAdd(text)`
  - 앞에 `-`가 붙으면(`-회의록 정리`) `-`를 뺀 제목, 카테고리는 기타, 기한·설명 없이 바로 저장
  - `-`가 없으면 제목이 미리 채워진 `QuestForm`을 열어 나머지 항목을 입력받음
- `today.ts`: "오늘의 업무" = 완료하지 않은 퀘스트 중 기한이 오늘이거나 지난 것, 그리고 기한이 없는 것. "오늘의 약속" = 오늘 날짜의 약속(시간순). `thisWeek()`/`nextWeek()`는 월~일 기준 주 범위를 돌려주고 날짜별로 묶는다(KST 기준)
- `xp.ts`: 카테고리별 기본 XP(회의 20, 출장 40, 업무 50, 반영 120, 교육 30, 행사 20, 기타 10, 휴가 0), 레벨 = 누적 XP / 500. 약속은 XP가 없다
- `categories.ts`: 카테고리 하나에 이름, 색, 픽셀 아이콘을 묶어 한곳에서 정의한다. 퀘스트 카드, 등록 모달의 카테고리 선택 버튼, 필터, 캘린더 일정, 위젯 목록, 반영 파이프라인 카드에 같은 아이콘을 쓴다. 아이콘은 16×16 픽셀 SVG(`src/assets/icons/`)이고, pixelarticons(MIT)에 맞는 것이 있으면 그것을 쓰고 없으면 직접 그린다. 확대할 때 `image-rendering: pixelated`를 적용한다
  | 카테고리 | 아이콘 (게임 아이템 느낌) |
  |---|---|
  | 회의 | 말풍선 두 개 |
  | 출장 | 여행 가방 |
  | 업무 | 검 |
  | 반영 | 로켓 |
  | 휴가 | 야자수 |
  | 교육 | 책 |
  | 행사 | 깃발 |
  | 기타 | 물약 병 |
  | 점심약속 | 밥그릇 |
  | 저녁약속 | 건배 잔 |
  | 기타약속 | 악수 |
- 캘린더 색: 업무 카테고리마다 색을 하나씩 정하고, 약속은 점선 테두리와 식기 아이콘으로 업무와 구분한다. 휴가는 하루 종일 칸 전체를 칠한다
- 위젯 미니창: 오늘의 업무 아래에 오늘의 약속을 작은 구역으로 함께 보여준다
- `useTasks.ts`: 조회, 추가, 수정, 삭제 + Realtime 구독

## 파일 구조
```
scheduler/
  package.json, vite.config.ts, index.html, .env.example (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_VAPID_PUBLIC_KEY)
  public/sw.js, public/manifest.webmanifest
  src/main.tsx, App.tsx, lib/*, hooks/*, components/*, pages/*, styles/pixel.css
  supabase/migrations/001_sched.sql, 002_sched_cron.sql
  supabase/functions/sched-send-reminders/index.ts
```
Supabase 적용은 MCP 도구(`apply_migration`, `deploy_edge_function`, `get_publishable_keys`)로 한다. 기존 테이블은 건드리지 않는다.

## 구현 순서
1. Vite 프로젝트 생성, 픽셀 테마와 레이아웃, 로그인/회원가입/비밀번호 재설정
2. DB 마이그레이션, Storage 버킷, RLS 적용 → `useTasks`
3. QuestForm(카테고리, 기한, 이미지), 대시보드(긴급 구역, 반영 파이프라인, 빠른 등록)
4. 캘린더 월간/주간
5. 미니창 위젯
6. 웹 푸시: 서비스워커, Edge Function, pg_cron
7. 게임 연출(XP, 레벨업, QUEST CLEAR) 마무리

## 검증
- `npx vitest`: `workdays`(주말·공휴일·대체공휴일 경계, 금→월 계산), 이번 주/다음 주 범위(일요일·월요일에 열었을 때 경계), `parseQuickAdd`(`-` 있음/없음, 공백만 입력) 단위 테스트
- `npm run dev` 후 브라우저 패널(localhost)에서 직접 확인:
  - 비밀번호 재설정 메일 요청 → 메일 링크 → 새 비밀번호로 로그인되는지
  - 회원가입/로그인 → `-테스트` 입력 시 기타 카테고리로 바로 등록되는지
  - 기한 2워킹데이 퀘스트가 긴급 구역에 뜨는지, 그 사이에 휴가를 등록하면 남은 워킹데이가 줄어드는지
  - 점심약속 등록 시 12:00이 기본으로 채워지고, 대시보드 약속 패널과 캘린더에 업무와 구분되어 보이는지
  - 반영 퀘스트 단계 이동
  - 이미지 업로드
  - 캘린더 월간/주간 표시
  - 위젯 미니창이 열리고 메인 창과 동기화되는지
- 알림: 2분 뒤로 시간 지정 알림을 만들고 탭을 닫은 다음 Windows 알림이 오는지 확인하고, `sched_reminders.sent_at`이 기록됐는지 SQL로 확인
- Supabase `get_advisors`(security)로 RLS 누락이 없는지 점검
