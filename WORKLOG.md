# 작업 일지 (2026-11-11 ~ 11-13)

Claude Code 대화 26개를 날짜순으로 정리했습니다. 각 항목의 🔗 링크를 누르면 그 대화 기록 전체를 볼 수 있습니다.

---

## 📅 1일차 · 11월 11일 (화): 첫 웹사이트부터 배포까지

### 🎮 테트리스 (`projects/게임`)
- HTML 파일 하나로 테트리스 게임 만들기 · 🔗 [대화](sessions/2026-11-11_게임_26531c54.md)

### 🐷 꿀꿀 가계부 (`projects/가계부`)
🔗 [대화](sessions/2026-11-11_가계부_96d320ff.md)
1. DB·회원 없이 한 장짜리 가계부 → 달력 보기, 분류별 아이콘 추가 → 귀여운 디자인으로 변경
2. GitHub 로그인 후 저장소 `household-ledger`에 올리고 **GitHub Pages로 공개**
3. 브라우저 저장(localStorage)에서 **Supabase DB 저장**으로 변경 (`ledger_entries` 테이블)
4. 대문에 「바이브코딩 화이팅」 배지 추가

### 🍠 고구마마켓 (`projects/goguma`)
🔗 [대화 1: 회원가입·상품·좋아요·배포](sessions/2026-11-11_goguma_a810e663.md) · 🔗 [대화 2: 샘플데이터·채팅·알림](sessions/2026-11-11_goguma_42a44456.md)
1. Next.js + Supabase로 당근마켓 같은 중고거래 사이트. 2030 취향의 고구마 콘셉트, **공부용으로 한 단계씩**
2. 회원가입/로그인/로그아웃 → 상품 등록·목록·상세 → 수정·마이페이지
3. GitHub 저장소 `goguma-market` 생성, **Vercel 배포** (main에 push하면 자동 배포)
4. 좋아요 기능, 입력 필수값 표시, 샘플 상품 데이터(실제 사진)
5. AGENTS.md에 "공부용 단계 개발 · 가계부와 같은 Supabase 재사용" 주의사항 기록
6. **채팅 + 알림**: 상단 알림 아이콘과 새 알림 표시, 채팅·좋아요 알림(내가 보낸 메시지는 제외)
7. 채팅 버그 수정: 보내는 순간 메시지가 두 번 보이던 문제, 읽음 표시가 일부만 바뀌던 문제, 다시 열면 놓친 메시지가 안 보이던 문제
8. 상품 카드에 채팅 수 표시, Vercel 서버를 Supabase와 같은 **서울 리전(icn1)**에 두어 속도 개선, 받은 말풍선을 진한 고구마 노랑으로

### 🕯️ ONGI 인테리어 소품 쇼핑몰 시작 (`projects/shopping`)
🔗 [대화](sessions/2026-11-11_shopping_d1aa9087.md)
- 계획서 [claude/plans/wondrous-foraging-pancake.md](claude/plans/wondrous-foraging-pancake.md)를 세운 뒤 Next.js + Supabase(`shop_` 접두어) + 토스페이먼츠 테스트 결제로 구현 시작

---

## 📅 2일차 · 11월 12일 (수): 쇼핑몰 배포와 업무 자동화 실습

### 🕯️ ONGI 쇼핑몰 마무리 (`projects/shopping`)
- 결제 키 연결 후 결제 테스트, 상품 사진을 실제 사진으로
- **선물 가게** 콘셉트 강조, 선물 추천에 **예산 범위 슬라이더**
- **Vercel 배포**: https://ongi-shop.vercel.app
- CLAUDE.md·AGENTS.md에 "수업 실습용 프로젝트" 안내 추가 · 🔗 [대화](sessions/2026-11-12_shopping_1f4f6762.md)

### 🧰 업무 자동화 실습 (`projects/multicampus-2026-09-practice`)
| 시간 | 한 일 | 대화 |
|---|---|---|
| 10:47 | 실습 환경 세팅 (Node, Python, 가상환경, 한글 처리 확인 → `.setup-status.md`) | 🔗 [설정](sessions/2026-11-12_multicampus-2026-09-practice_500c697c.md) |
| 11:17 | 거래처 명단 정리 → 1~8월 매출 통합 엑셀 → HTML 대시보드 → 아티팩트·PT 슬라이드 | 🔗 [데이터 정리](sessions/2026-11-12_multicampus-2026-09-practice_f0d489c2.md) |
| 13:22 | 명상 앱 디자인 | 🔗 [명상 앱](sessions/2026-11-12_multicampus-2026-09-practice_7641b459.md) |
| 13:43 | 폴더를 **Git으로 관리** 시작, 변경 확인·되돌리기, "작업하면 알아서 커밋" 규칙을 CLAUDE.md에 | 🔗 [Git](sessions/2026-11-12_multicampus-2026-09-practice_a0661ac5.md) |
| 14:09 | 메모장 파일 「바이브코딩 재미있다」 | 🔗 [메모](sessions/2026-11-12_multicampus-2026-09-practice_4b4e59cc.md) |
| 14:11 | 매출 통합~대시보드를 한 번에 하는 **`sales-dashboard` 스킬 제작** | 🔗 [스킬 제작](sessions/2026-11-12_multicampus-2026-09-practice_7b9a7ee6.md) · 🔗 [스킬로 다시 실행](sessions/2026-11-12_multicampus-2026-09-practice_088788f4.md) |
| 14:38 | k-skill에서 **사주(`saju-fortune`)**, **식품 안전(`mfds-food-safety`)** 스킬 설치 | 🔗 [사주](sessions/2026-11-12_multicampus-2026-09-practice_cb12a702.md) · 🔗 [식품](sessions/2026-11-12_multicampus-2026-09-practice_2dcf90a8.md) |
| 14:39 | 사주 스킬로 신년운세 상담 | 🔗 [운세](sessions/2026-11-12_multicampus-2026-09-practice_ae14cd94.md) |
| 14:40 | 최근 회수 식품 조회, "스킬 쓴 거야?" → 이런 질문에도 스킬이 쓰이게 설명 보강 | 🔗 [회수 식품](sessions/2026-11-12_multicampus-2026-09-practice_8700e1d5.md) |
| 15:29 | Gmail 이번 주 메일 32건을 우선순위별로 정리 | 🔗 [메일](sessions/2026-11-12_multicampus-2026-09-practice_a4456274.md) |
| 15:46 | 타입캐스트 쇼츠 스킬(`create-typecast-shorts`) 설치 | 🔗 [타입캐스트](sessions/2026-11-12_multicampus-2026-09-practice_679858c4.md) |
| 16:13 | **서브에이전트**로 포르투갈어·중국어 동시 번역 | 🔗 [번역](sessions/2026-11-12_multicampus-2026-09-practice_109b7717.md) |
| 16:37 | **Claude in Chrome**으로 쿠팡에서 갤럭시 폴드8 카드 수납 케이스 찾기 | 🔗 [쇼핑](sessions/2026-11-12_multicampus-2026-09-practice_6ff88d67.md) |
| 17:00 | 이틀간 배운 것을 정리해 허세임 사이트 「깨달음」 게시판에 글 올리기 (`huhsame-board` 스킬) | 🔗 [회고 글](sessions/2026-11-12_multicampus-2026-09-practice_f541e50f.md) |

---

## 📅 3일차 · 11월 13일 (목): 퀘스트 스케줄러와 개인 위키

### ⚔️ 퀘스트 스케줄러 (`projects/scheduler`)
🔗 [대화](sessions/2026-11-13_scheduler_67491744.md) · 📋 [구현 계획서](claude/plans/sorted-frolicking-castle.md)
1. 요구사항: 업무를 **게임 퀘스트**처럼, 대시보드(워킹데이 3일 이하 남은 업무 따로 표시), 월간/주간 캘린더, 카테고리(회의·출장·업무·반영·기타), 이미지 첨부, 기한·알림(10분/30분/1시간/2시간 전, 정시)
2. Vite + React + Supabase(`sched_` 접두어) 웹앱, 웹 푸시 알림(Edge Function `sched-send-reminders`를 pg_cron이 1분마다 호출)
3. **윈도우 프로그램(Electron) + 바탕화면 위젯**, 설치 파일(NSIS) 만들기, 제거 시 설정 폴더까지 삭제
4. 로그인/회원가입: 이름, 비밀번호 8자 이상 안내, 비밀번호 확인, 가입 메일 인증은 끄고 비밀번호 재설정 메일만 사용
5. UI 다듬기: 대시보드/캘린더 전환 탭, 위젯 열림 버튼 비활성화, **중요도에 따른 XP**, 캘린더 등록 버튼, DEPLOY PIPELINE 화살표, 마이페이지 아이콘(내 이메일 표시), 설치 파일 다운로드 메뉴, 휴가 시작일 자동 설정, 점심·저녁 약속은 SOCIAL에만, 퀘스트명 앞에 `[회의]` 형식, 깜빡임 효과 정리
6. 완료한 업무 카드에 **완료일 표시** ("✓ 11/12(목) 완료")
7. **처리 내역** 버튼: 이번 주/지난 주/이번 달/지난 달/직접 지정 기간에 완료한 퀘스트, 얻은 XP, 카테고리별 건수를 보고 주간 보고용 텍스트로 복사
8. 공개 저장소 [`YUSUN68/quest-scheduler`](https://github.com/YUSUN68/quest-scheduler) 생성, **Vercel 배포** https://quest-scheduler-red.vercel.app (비밀번호 재설정 링크도 배포 주소로, Supabase Redirect URL은 직접 추가)
9. 설치 파일을 quest-scheduler 저장소 [Releases](https://github.com/YUSUN68/quest-scheduler/releases/latest)에 올리고, 웹 메뉴의 **윈도우 프로그램 다운로드**가 그 파일을 받게 변경
10. 캘린더 아래 카테고리 범례를 누르면 그 카테고리가 선택된 등록 창이 열림 (약속은 기본 시각, 휴가·출장은 오늘~오늘)
11. **발표 슬라이드**: 가짜 데모 계정과 예시 데이터로 기능 15개를 Playwright로 직접 조작하며 녹화하고, 27장짜리 슬라이드를 [아티팩트](https://claude.ai/artifact/JQxdys5xdwakAJtFhNMEHv)로 발행 (←→ 넘기기, F 전체 화면, N 발표자 노트). 윈도우 알림 팝업은 PC 알림 설정이 꺼져 있어 녹화하지 못함
12. 결과물: 웹앱 + 윈도우 설치 파일 `QuestScheduler Setup 0.1.0.exe`

> 15:50 기준으로 담았습니다. 이때 발표 슬라이드는 아직 비공개였고, 게시판 공유와 데모 계정 삭제는 남아 있었습니다.

### 🕯️ ONGI 쇼핑몰 상세페이지 (`projects/shopping`)
🔗 [대화](sessions/2026-11-11_shopping_d1aa9087.md)
- 상품 상세페이지 강화: 상세 사진, 특징 카드, 사이즈·소재·관리 방법 표, 선물 포장 안내 → Vercel 재배포

### 📚 개인 위키 (`projects/mywiki`)
🔗 [대화](sessions/2026-11-13_mywiki_af685dc1.md)
- 카파시의 [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 방식으로 한국어 개인 위키 구성 (`raw/` 원자료 → `wiki/` 정리본, `/ingest` `/query` `/lint` 명령)
- 이번 달 메일 제목을 모아 주제 지도(바이브코딩, AI 도구, 업무, 생활과 취미, 경제와 시사) 설계

### 📦 이 저장소 만들기
- 3일간의 프로젝트·대화 기록·Claude 기억을 공개 GitHub 저장소 하나로 정리하고, 14:15, 15:50 기준으로 다시 업데이트 · 🔗 [대화](sessions/2026-11-13_scheduler_cad8ff6a.md)

---

## 💡 3일 동안 배운 것 (회고 글에서)
1. 원하는 걸 정확히 말하면 만들어진다. "귀엽게", "고구마니까 노란색" 같은 취향도 반영된다.
2. 처음부터 완벽하게 시키기보다 한 단계씩 키우는 게 낫다.
3. 계획은 바로 승인하지 말고 돌려보내도 된다.
4. 버그는 직접 써봐야 보인다. 증상만 말하면 원인은 Claude가 찾는다.
5. 한 번 잘 된 작업은 스킬로 남기자.
6. CLAUDE.md·AGENTS.md에 규칙을 적어두면 매번 말하지 않아도 지킨다.
7. Git이 있으면 망쳐도 되돌릴 수 있어서 마음 편하게 시도할 수 있다.
