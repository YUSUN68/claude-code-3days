# 퀘스트 스케줄러

업무를 레트로 픽셀 게임의 퀘스트처럼 관리하는 스케줄러. 웹 브라우저와 윈도우 프로그램(바탕화면 위젯 포함) 두 가지로 쓸 수 있다.

- 웹: https://quest-scheduler-red.vercel.app
- 윈도우 설치 파일: https://github.com/YUSUN68/quest-scheduler/releases/latest/download/QuestScheduler-Setup.exe

## 실행

```bash
npm install
npm run dev            # 웹: http://localhost:5173
npm run desktop:dev    # 윈도우 프로그램 (개발 모드, 웹 서버와 함께 실행)
npm run dist:win       # 윈도우 설치 파일 만들기 → release/QuestScheduler Setup x.y.z.exe
npm test               # 워킹데이·주간 범위·빠른 등록 단위 테스트
```

## 윈도우 프로그램 받기

- **웹에서 받기:** 로그인 → 오른쪽 위 사람 아이콘 → "윈도우 프로그램 다운로드"
  - 배포판(Vercel)은 `VITE_DOWNLOAD_URL`에 넣은 GitHub Releases 주소로 받는다
  - 로컬 개발 서버는 `release/` 폴더의 가장 최근 설치 파일을 `/download/windows` 주소로 내려준다
- **직접 받기:** `release/QuestScheduler Setup x.y.z.exe`를 복사해 실행한다

## 배포

- **웹 (Vercel):** `vercel deploy --prod`. 환경 변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`, `VITE_DOWNLOAD_URL`을 Vercel 프로젝트에 넣어 둔다
- **윈도우 설치 파일:** `.env.local`의 `VITE_WEB_URL`을 배포 주소로 두고 `npm run dist:win` → 파일 이름을 `QuestScheduler-Setup.exe`로 바꿔 새 GitHub Release에 올린다 (`releases/latest/download/...` 주소는 항상 최신 릴리스를 가리킨다)
- **Supabase:** Authentication → URL Configuration의 Redirect URLs에 `https://quest-scheduler-red.vercel.app/reset-password`를 넣어야 비밀번호 재설정 링크가 동작한다

## 기능

- **대시보드**
  - 빠른 등록: `-`로 시작하면 기타 카테고리로 바로 등록되고, 없으면 상세 입력 창이 열린다
  - 오늘/이번 주/다음 주 보드: 카드를 끌어 다른 칸에 놓으면 기한이 바뀐다
  - 긴급 퀘스트: 남은 워킹데이 3일 이하 또는 기한 지남. 주말, 한국 공휴일, 내 휴가를 빼고 센다
  - 반영 파이프라인: 개발요청 → 테스트 → 테스트완료 → 반영 → 반영완료
  - 오늘의 약속(SOCIAL), 퀘스트 로그
  - 처리 내역: 퀘스트 로그의 "처리 내역" 버튼 → 이번 주/지난 주/이번 달/지난 달/직접 지정 기간에 완료한 퀘스트, 획득 XP, 카테고리별 건수를 보고 텍스트로 복사
- **캘린더**: 월간/주간, 공휴일 표시, 날짜를 누르면 등록, 일정을 끌어 옮기면 기한이 바뀐다
- **카테고리**
  - 업무: 업무, 회의, 반영, 출장, 교육, 행사, 휴가, 기타
  - 약속: 점심약속, 저녁약속, 기타약속
  - 출장/교육/행사/휴가는 기간으로 등록할 수 있다
- **알림**: 10분/30분/1시간/2시간 전, 또는 시간 지정
  - 웹: 상단 "알림 켜기" → 웹 푸시. 탭을 닫아도 Chrome이 켜져 있으면 알림이 온다
  - 윈도우 프로그램: 트레이에 있는 동안 윈도우 알림으로 띄운다
  - 같은 알림은 한 번만 울린다(먼저 처리한 쪽이 보냄)
- **위젯**
  - 윈도우 프로그램: 프레임 없는 바탕화면 위젯. 항상 위 설정, 위치·크기를 기억, 트레이 메뉴에서 켜고 끈다
  - 웹: Chrome/Edge의 '항상 위' 미니창(Document Picture-in-Picture)
- **게임 요소**: 완료 시 XP, 500 XP마다 레벨업, QUEST CLEAR 연출
- **계정**: 이메일 로그인/가입, 비밀번호 재설정 메일, 로그인 상태에서 비밀번호 변경

## Supabase (프로젝트 YUSUN1)

다른 앱과 같은 프로젝트를 쓰므로 모든 객체에 `sched_` 접두어를 붙였다.

| 종류 | 이름 |
|---|---|
| 테이블 | `sched_tasks`, `sched_task_images`, `sched_reminders`, `sched_push_subscriptions` (모두 RLS) |
| 저장소 | `sched-images` (비공개, `{user_id}/...` 경로만 접근) |
| 서버 함수 | Edge Function `sched-send-reminders`, pg_cron 작업 `sched-send-reminders` (1분마다) |
| 비공개 설정 | `sched_private.config` (VAPID 키, cron 시크릿. 저장소에 커밋하지 않음) |

SQL은 `supabase/migrations/`, 함수 코드는 `supabase/functions/`에 있다.

### 직접 해야 하는 설정

1. **비밀번호 재설정 링크 허용**
   - Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs에 `http://localhost:5173/reset-password`를 추가한다
   - 웹을 다른 주소에 올리면 그 주소도 추가하고, `.env.local`의 `VITE_WEB_URL`을 바꾼다
2. **메일 발송량**: 기본 메일 서버는 시간당 몇 통만 보낸다. 여러 명이 쓰려면 Authentication → SMTP Settings에서 메일 서버를 연결한다.
3. **설치 파일 서명**
   - 설치 파일은 코드 서명이 없어 처음 실행할 때 Windows SmartScreen 경고가 뜬다("추가 정보 → 실행")
   - 윈도우 시작 시 자동 실행은 설치한 프로그램에서만 켤 수 있다

## 구조

```
src/lib        워킹데이·공휴일·분류·빠른 등록·XP 등 순수 로직 (+ logic.test.ts)
src/hooks      세션, 퀘스트 데이터(실시간 동기화), 윈도우 알림
src/components 퀘스트 카드/등록 창/보드/HUD/위젯/픽셀 아이콘
src/pages      대시보드, 캘린더, 로그인·비밀번호 재설정
electron       윈도우 프로그램 (메인 창, 위젯 창, 트레이)
public/sw.js   웹 푸시 서비스워커
```
