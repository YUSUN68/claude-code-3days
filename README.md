# 클로드 코드 3일 작업 모음 (2026-11-11 ~ 11-13)

> 마지막 업데이트: 2026-11-13 17:00 (KST)

멀티캠퍼스 「비개발자를 위한 바이브코딩 입문 with 클로드 코드」 수업을 들으며 3일 동안 Claude Code로 만든 **모든 결과물과 대화 기록**을 한곳에 모았습니다.
다른 컴퓨터에서 이 저장소 하나만 받으면 바로 이어서 쓸 수 있습니다.

## 📦 들어 있는 것

| 폴더 | 내용 |
|---|---|
| [`projects/`](projects) | 3일 동안 만든 프로젝트 7개 (소스 전체) |
| [`sessions/`](sessions) | Claude Code 대화 기록 27개 (요청·답변을 읽기 쉽게 정리, 날짜순 목록은 [sessions/README.md](sessions/README.md)) |
| [`WORKLOG.md`](WORKLOG.md) | 날짜별 작업 일지: 무엇을 만들고 무엇을 바꿨는지 |
| [`claude/memory/`](claude/memory) | Claude가 프로젝트별로 기억하던 내용 (공유 Supabase 규칙, 배포 정보 등) |
| [`claude/plans/`](claude/plans) | 큰 작업 전에 Claude와 세운 구현 계획서 (스케줄러, 쇼핑몰) |
| [`setup.ps1`](setup.ps1) | 새 컴퓨터 준비 스크립트 (기억 복원, .env 만들기, 패키지 설치, 전역 스킬 설치) |
| [Releases](https://github.com/YUSUN68/claude-code-3days/releases) | 퀘스트 스케줄러 윈도우 설치 파일 (`.exe`, 79MB라 소스와 따로 올림) |

## 🗂 프로젝트 7개

| 날짜 | 프로젝트 | 한 줄 설명 | 기술 | 바로 보기 |
|---|---|---|---|---|
| 11-11 | [`게임`](projects/게임) | HTML 파일 하나로 된 테트리스 | HTML/JS | `tetris.html` 더블클릭 |
| 11-11 | [`가계부`](projects/가계부) | 🐷 꿀꿀 가계부: 달력·분류 아이콘, Supabase 저장 | HTML + Supabase | [GitHub Pages](https://yusun68.github.io/household-ledger/) · [원본 저장소](https://github.com/YUSUN68/household-ledger) |
| 11-11 | [`goguma`](projects/goguma) | 🍠 고구마마켓: 중고거래 (회원·상품·좋아요·채팅·알림) | Next.js 16 + Supabase + Vercel | [배포 사이트](https://goguma-market-flame.vercel.app) · [원본 저장소](https://github.com/YUSUN68/goguma-market) |
| 11-11~13 | [`shopping`](projects/shopping) | ONGI 인테리어 선물 쇼핑몰 (예산 슬라이더, 토스 테스트 결제, 상세페이지) | Next.js 15 + Supabase + Toss | [배포 사이트](https://ongi-shop.vercel.app) |
| 11-12 | [`multicampus-2026-09-practice`](projects/multicampus-2026-09-practice) | 업무 자동화 실습: 데이터 정리, 매출 통합·대시보드, 스킬 설치·제작 | Python + Claude 스킬 | `03_매출데이터/…대시보드.html` |
| 11-13 | [`scheduler`](projects/scheduler) | ⚔️ 퀘스트 스케줄러: 업무를 게임 퀘스트처럼, 웹 + 윈도우 위젯 | Vite + React + Supabase + Electron | [배포 사이트](https://quest-scheduler-red.vercel.app) · [원본 저장소](https://github.com/YUSUN68/quest-scheduler) · [설치 파일](https://github.com/YUSUN68/quest-scheduler/releases/latest) · [발표 슬라이드](https://claude.ai/artifact/JQxdys5xdwakAJtFhNMEHv) |
| 11-13 | [`mywiki`](projects/mywiki) | 카파시의 「LLM 위키」 방식으로 만든 개인 위키 (Obsidian) | Markdown | `wiki/index.md` |

## 💻 다른 컴퓨터에서 쓰기

### 가장 쉬운 방법: Claude Code에게 맡기기
새 컴퓨터에서 Claude Code를 열고 이렇게 말하세요.

> https://github.com/YUSUN68/claude-code-3days 받아서 바탕화면에 풀고 쓸 수 있게 세팅해줘

Claude가 저장소 맨 위의 [`CLAUDE.md`](CLAUDE.md)를 읽고 아래 순서대로 진행합니다.

### 직접 하는 방법
1. 준비물 설치 (없을 때만)
   ```powershell
   winget install Git.Git OpenJS.NodeJS.LTS Python.Python.3.13 GitHub.cli
   ```
2. 저장소 받기
   ```powershell
   cd $HOME\Desktop
   git clone https://github.com/YUSUN68/claude-code-3days.git
   cd claude-code-3days
   ```
3. 준비 스크립트 실행: Claude 기억 복원, `.env.local` 만들기, `npm install`, Python 가상환경, 전역 스킬 설치까지 한 번에
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\setup.ps1
   ```
4. 프로젝트 하나를 골라 실행 (아래 표)

### 프로젝트별 실행 방법

| 프로젝트 | 실행 | 주소 |
|---|---|---|
| 게임 | `projects\게임\tetris.html` 더블클릭 | |
| 가계부 | `projects\가계부\index.html` 더블클릭 | |
| goguma | `cd projects\goguma; npm run dev` | http://localhost:3000 |
| shopping | `cd projects\shopping; npm run dev` | http://localhost:3000 |
| scheduler (웹) | `cd projects\scheduler; npm run dev` | http://localhost:5173 |
| scheduler (윈도우 위젯) | `npm run desktop:dev` 또는 [Releases](https://github.com/YUSUN68/claude-code-3days/releases)의 설치 파일 실행 | |
| scheduler (설치 파일 새로 만들기) | `npm run dist:win` → `release\` 폴더 | |
| multicampus 실습 | 폴더를 Claude Code로 열기 (`.claude/skills`의 스킬이 자동으로 잡힘) | |
| mywiki | Obsidian에서 `projects\mywiki` 폴더를 볼트로 열기, Claude Code에선 `/ingest` `/query` `/lint` | |

## 🧩 전역 스킬 (어느 폴더에서든 자동으로 쓰임)

11-13에 다른 사람이 공개한 스킬 저장소 3개를 전역 스킬로 설치했습니다. 코드는 이 저장소에 복사하지 않았고, `setup.ps1`이 처음 설치 때 검토한 버전(커밋 고정)을 원본 저장소에서 받아 `~/.claude/skills`에 설치합니다. 설치하지 않으려면 `-SkipSkills`를 붙이세요.

| 원본 저장소 (MIT) | 설치되는 스킬 | 이렇게 말하면 쓰임 |
|---|---|---|
| [dreambigou/eli5](https://github.com/dreambigou/eli5) | `eli5` | "5살한테 설명하듯", "쉽게 풀어줘" |
| [epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai) | `humanize-korean`, `humanize-scan`, `/humanize`, `/humanize-redo` (+ 보조 에이전트 4개) | "AI 티 없애줘", "번역투 고쳐", "이 글 AI 같아?" |
| [DAYBYDAI/kakao-windows-reader](https://github.com/DAYBYDAI/kakao-windows-reader) | `kakao-windows` | "카톡 정리해 줘", "카톡에서 ○○ 찾아줘" (처음엔 `/kakao-windows 첫 설정을 해 줘`) |

카카오톡 리더는 PC 카카오톡 대화를 읽기 전용으로 열어 AI에게 보내는 도구라, 공용 PC에서는 첫 설정을 하지 않는 편이 좋습니다.

## 🔐 비밀값 안내 (공개 저장소)

이 저장소는 **공개**라서 비밀값은 넣지 않았습니다.

- **넣어 둔 것**: Supabase 프로젝트 주소와 *publishable(공개용) 키*, 웹 푸시 VAPID *공개* 키, 토스페이먼츠 *공식 문서 공개 테스트 키*. 원래 브라우저에 노출되는 값이라 `.env.example`에 채워 두었고, `setup.ps1`이 `.env.local`로 복사합니다.
- **뺀 것**: shopping의 `SUPABASE_SERVICE_ROLE_KEY`(Supabase 대시보드 → Project Settings → API Keys의 secret 키를 직접 넣기), Vercel 토큰, 스케줄러의 VAPID 비밀키·크론 비밀값(이미 Supabase 안 `sched_private.config`에 있음).
- 대화 기록에서는 키·토큰·이메일 주소·생년월일을 `[REDACTED…]`/`[…가림]`으로 바꿨습니다.

네 웹앱(가계부·goguma·shopping·scheduler)은 **Supabase 프로젝트 하나(YUSUN1)를 함께 씁니다**. 테이블 이름 앞의 `shop_`, `sched_` 같은 접두어로 구분하니, 새 테이블을 만들 때도 이 규칙을 지켜 주세요. 자세한 내용은 [`claude/memory/`](claude/memory)에 있습니다.

## 📝 참고
- 각 프로젝트 폴더의 `README.md`, `CLAUDE.md`, `AGENTS.md`에 프로젝트별 설명과 Claude용 주의사항이 있습니다.
- 가계부·goguma·scheduler는 원래 저장소(위 링크)에 커밋 기록이 따로 있고, 여기에는 11-13 기준 최신 파일만 담았습니다. shopping의 상세페이지 작업(11-13)도 커밋·배포까지 끝난 상태로 담았습니다.
- 대화 기록 원본(.jsonl, 약 50MB)은 내부 도구 출력과 비밀값이 섞여 있어 올리지 않았습니다. 원본은 작업한 PC의 `%USERPROFILE%\.claude\projects\`에 남아 있습니다.
