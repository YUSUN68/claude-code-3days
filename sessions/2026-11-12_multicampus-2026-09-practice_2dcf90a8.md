# 식품 안전 체크 스킬 설치

- 프로젝트: `multicampus-2026-09-practice`
- 세션 ID: `2dcf90a8-01e5-47e7-80bd-ccc273e78b5f`
- 기간: 2026-11-12 14:39 ~ 2026-11-12 14:40 (KST)
- 사용자 요청 수: 1


> 원본 대화 기록(.jsonl)에서 사용자 요청과 Claude의 답변만 추렸습니다. 도구 사용은 🔧 한 줄로 요약했고, 키·토큰·이메일은 가렸습니다.

---
### 🙋 사용자 (11-12 14:39)

> https://github.com/NomaDamas/k-skill 여기서 식품 안전 체크 스킬 이 폴더에 설치해줘

**🤖 Claude:**

레포에서 식품 안전 체크 스킬을 찾아볼게요 🔍🍱

> 🔧 Bash: Clone k-skill repo to scratchpad and search for food skill

**🤖 Claude:**

`mfds-food-safety`(식약처 식품 안전) 스킬을 찾았어요 ✅ 내용을 먼저 읽어볼게요 📖

> 🔧 Bash: List skill files and show the skill instructions · Bash: Show skill metadata, full instructions, and helper script · Bash: Check existing skills layout and Python command · Bash: Install food safety skill into project skills folder

**🤖 Claude:**

설치됐어요 🎉 실제로 작동하는지 시험 조회를 해볼게요 🧪

> 🔧 Bash: Test the interview and search commands

**🤖 Claude:**

조회도 잘 돼요 ✅ 이제 커밋할게요 💾

> 🔧 Bash: Commit the installed skill and show the commit

**🤖 Claude:**

식품 안전 체크 스킬을 이 폴더에 설치했어요 🎉🍱

**설치한 것** 📂
- 스킬 이름: `mfds-food-safety` (식약처·식품안전나라 공개 정보 조회)
- 위치: [.claude/skills/mfds-food-safety/SKILL.md](.claude/skills/mfds-food-safety/SKILL.md)
- 조회할 수 있는 정보: 회수·판매중지 목록, 검사 부적합 이력, 건강기능식품 원료와 하루 섭취량 🔍

**설치하면서 바꾼 점** 🔧
- 원래 스킬은 쓸 때마다 `npx`로 인터넷에서 설명서를 받아오는 방식이었어요.
- 이 폴더 안에서 바로 쓸 수 있게 설명서를 SKILL.md에 넣어뒀어요.
- 실행 명령도 이 컴퓨터에 맞게 `python`으로 바꿨어요. 한글이 깨지지 않도록 설정도 넣었어요 🐍

**작동 확인** 🧪
- 시험으로 "김밥"을 조회해봤어요.
- 식약처 회수 목록에서 실제 결과가 1건 나왔어요: 「바다명가 두번구운김밥김」, 카드뮴 기준 부적합 ⚠️

**사용법** 💬
"이 제품 회수된 적 있어?"나 "차전자피 먹어도 돼?"처럼 물어보시면 돼요. 증상 이야기를 하시면 결론을 내리기 전에 누가, 무엇을, 언제 먹었는지 먼저 되물어봐요 🩺
진단을 대신하지는 않아요. 숨쉬기 힘들거나 혈변이 보이는 등 위험한 증상이 있으면 119나 응급실 안내를 먼저 드려요 🚑

**커밋** ✅ `663ac0b` 식품 안전 체크 스킬(mfds-food-safety)을 k-skill에서 가져와 설치

옛썰 🫡✨
