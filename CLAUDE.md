# 이 저장소를 연 Claude에게

이 저장소는 사용자가 2026-11-11~13에 Claude Code로 만든 프로젝트 7개(`projects/`)와 대화 기록(`sessions/`), Claude 기억(`claude/memory/`)을 모은 것입니다. 사용자는 비개발자로 바이브코딩을 배우는 중이니, 설명은 쉬운 한국어로 짧게 해 주세요.

## 사용자가 "세팅해줘"라고 하면
1. 필요한 도구가 있는지 확인하고, 없으면 winget으로 설치합니다: Git, Node.js LTS, Python 3.13, GitHub CLI(`gh`).
2. 저장소 루트에서 `powershell -ExecutionPolicy Bypass -File .\setup.ps1`을 실행합니다. 이 스크립트가
   - `claude/memory/<프로젝트>`를 이 컴퓨터의 `~/.claude/projects/<경로 키>/memory`로 복사하고,
   - 각 프로젝트의 `.env.example`(shopping은 `.env.local.example`)을 `.env.local`로 복사하고,
   - goguma·shopping·scheduler에서 `npm install`, multicampus 실습 폴더에 `.venv`를 만듭니다.
3. shopping의 `SUPABASE_SERVICE_ROLE_KEY`는 비어 있습니다. 결제완료 처리를 테스트할 때만 필요하니, 그때 사용자에게 Supabase 대시보드에서 직접 넣어 달라고 안내하세요. 키를 대신 받아 적지는 마세요.
4. 끝나면 README.md의 "프로젝트별 실행 방법" 표대로 하나를 실행해 동작을 확인합니다.

## 작업할 때 지킬 것
- 각 프로젝트 폴더의 `CLAUDE.md`·`AGENTS.md`·`README.md`를 먼저 읽으세요. 프로젝트 안에서 작업할 때는 그 폴더를 작업 폴더로 여는 것이 좋습니다.
- 가계부·goguma·shopping·scheduler는 **Supabase 프로젝트 하나(YUSUN1)를 함께 씁니다.** 다른 앱의 테이블은 건드리지 말고, 새 객체에는 그 앱의 접두어(`shop_`, `sched_` 등)를 붙입니다. 자세한 건 `claude/memory/`.
- 이 저장소는 **공개**입니다. `.env.local`, 서비스 롤 키, 토큰, 개인 이메일·생년월일을 커밋하지 마세요.
- 가계부와 goguma는 원래 GitHub 저장소(`YUSUN68/household-ledger`, `YUSUN68/goguma-market`)가 따로 있고 goguma는 그 저장소 push로 Vercel 자동 배포됩니다. 여기서 고친 내용을 배포하려면 원래 저장소에 반영해야 한다는 점을 사용자에게 알려 주세요.
- shopping은 Vercel CLI(`vercel deploy --prod`)로 배포합니다. 새 컴퓨터에서는 `vercel login`, `vercel link`가 먼저 필요합니다.
- 퀘스트 스케줄러 윈도우 설치 파일은 GitHub Releases에 있습니다. 새로 만들려면 `projects/scheduler`에서 `npm run dist:win`.
