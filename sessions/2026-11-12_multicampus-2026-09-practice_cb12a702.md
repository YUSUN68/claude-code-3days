# 사주팔자 스킬 설치

- 프로젝트: `multicampus-2026-09-practice`
- 세션 ID: `cb12a702-ac88-465d-a64b-a284646196d7`
- 기간: 2026-11-12 14:38 ~ 2026-11-12 14:39 (KST)
- 사용자 요청 수: 1
- 추가된 코드 줄 수: 123

> 원본 대화 기록(.jsonl)에서 사용자 요청과 Claude의 답변만 추렸습니다. 도구 사용은 🔧 한 줄로 요약했고, 키·토큰·이메일은 가렸습니다.

---
### 🙋 사용자 (11-12 14:38)

> https://github.com/NomaDamas/k-skill 여기서 사주팔자 스킬 이 폴더에 설치해줘

> 🔧 Bash: Clone k-skill repo to scratchpad and search for saju skill · Bash: List saju skill files and show its SKILL.md · Bash: Show skill instruction, metadata and package info · Bash: Scan package source for network/file/exec usage and check existing skills · Bash: Copy saju package source and license into skill folder

**🤖 Claude:**

사주 계산 코드를 스킬 폴더에 넣었고, 이제 안내문(SKILL.md)을 쓰고 있어요 ✍️

> 🔧 Bash: Remove unneeded package.json from bundled lib · Write `multicampus-2026-09-practice\.claude\skills\saju-fortune\SKILL.md`

**🤖 Claude:**

설치 파일을 다 넣었어요. 실제로 계산이 되는지 시험해볼게요 🔮

> 🔧 Bash: Test saju calculation and check git status

**🤖 Claude:**

Calculation works (1990-03-15 → year pillar 경오 庚午 ✅). Committing now.

> 🔧 Bash: Commit the installed saju skill

**🤖 Claude:**

사주팔자 스킬을 이 폴더에 설치했어요 🎉🔮

**📂 설치된 곳:** [.claude/skills/saju-fortune](.claude/skills/saju-fortune/SKILL.md)
- 📝 `SKILL.md`: 사용법 안내문이에요. 정보 묻기 → 계산 → 풀이 순서로 진행돼요.
- 🧮 `lib/` 폴더: 사주 계산 코드예요. 원본 저장소에서 가져왔어요.
- 📜 `LICENSE`: 원본의 MIT 라이선스(누구나 써도 되는 공개 사용 허가)예요.

**💡 원본과 다르게 바꾼 점**
- 원본은 사주 계산 프로그램을 컴퓨터 전체에 따로 설치해야 해요.
- 여기서는 계산 코드를 스킬 폴더 안에 함께 넣어서, 설치 없이 바로 쓸 수 있어요 👍
- 계산 코드는 인터넷에 접속하지 않고 다른 프로그램도 실행하지 않아요. 넣기 전에 확인했어요 🔒

**✅ 동작 확인**
- 1990-03-15 10:30 양력 예시로 사주를 계산해봤어요. 연주가 경오(庚午)로 정상으로 나왔어요.
- 궁합 계산도 잘 돌아갔어요 💞

**💾 커밋:** `384eafe` NomaDamas/k-skill의 사주팔자 풀이 스킬(saju-fortune) 설치

**🙋 써보는 방법:** 채팅창에 이렇게 말해보세요.
- "사주 봐줘" 🌟
- "올해 연애운 어때?" 💘
- "우리 궁합 봐줘" 👫

먼저 생년월일, 태어난 시간, 성별, 양력·음력을 물어본 다음 풀이해드려요. 사주 풀이는 재미로 보는 참고용이에요 😊

옛썰 🫡
