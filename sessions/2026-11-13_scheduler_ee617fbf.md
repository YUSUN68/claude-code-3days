# GitHub 저장소 스킬 통합

- 프로젝트: `scheduler`
- 세션 ID: `ee617fbf-a912-4c8d-b38d-79bc92138575`
- 기간: 2026-11-13 16:51 ~ 2026-11-13 16:52 (KST)
- 사용자 요청 수: 1


> 원본 대화 기록(.jsonl)에서 사용자 요청과 Claude의 답변만 추렸습니다. 도구 사용은 🔧 한 줄로 요약했고, 키·토큰·이메일은 가렸습니다.

---
### 🙋 사용자 (11-13 16:51)

> https://github.com/dreambigou/eli5
> https://github.com/epoko77-ai/im-not-ai
> https://github.com/DAYBYDAI/kakao-windows-reader
>
> 이것들 다 전체스킬로 만들어서 내가 작업해서 필요한순간마다 알아서적용되게해.

> 🔧 Bash: Clone the three repos into scratchpad and list existing global skills · Bash: List files in each cloned repo · Bash: Read the eli5 skill and README · Bash: Read im-not-ai install docs and plugin manifest · Bash: Read kakao-windows-reader README, installer, and skill · Bash: Read kakao AGENTS.md and scan its code for network or injection calls · Bash: Read humanize skill headers and scan scripts for risky calls · Bash: Show kakao AGENTS.md rules and network scan results

**🤖 Claude:**

Three repos cloned and reviewed — no network/exfil code found. Quick check of the Kakao memory-access code, then installing.

> 🔧 Bash: Check process access flags and python3 availability

**🤖 Claude:**

Kakao code opens KakaoTalk read-only (no memory writes). Installing all three now.

> 🔧 Bash: Install eli5 and humanize-korean skills globally · PowerShell: Install the KakaoTalk reader skill with its Python venv · Bash: List installed global skills and agents

**🤖 Claude:**

세 저장소를 모두 전역 스킬로 설치했어요. 위치는 `C:\Users\student\.claude\skills\`예요. 어느 프로젝트에서 작업하든 요청이 맞으면 알아서 쓰이고, **새 세션부터** 적용돼요.

| 저장소 | 설치된 스킬 | 언제 자동으로 쓰이나 |
|---|---|---|
| eli5 | `eli5` | "ELI5", "5살한테 설명하듯", "매니저한테 설명해줘", "쉽게 풀어줘" |
| im-not-ai | `humanize-korean`, `humanize-scan` | "AI 티 없애줘", "번역투 고쳐", "이 글 AI 같아?" |
|  | `humanize`, `humanize-redo` | 원래 설정상 자동으로는 안 쓰이고 `/humanize`, `/humanize-redo`로 불러야 해요 |
| kakao-windows-reader | `kakao-windows` | "카톡 정리해 줘", "카톡에서 ○○ 찾아줘" |

im-not-ai가 쓰는 보조 에이전트 4개도 `~/.claude/agents`에 함께 설치했어요.

**설치하기 전에 확인한 것**
- 세 저장소의 스킬 파일과 스크립트를 읽어봤어요. 외부로 데이터를 보내는 코드는 없었어요.
- 카카오 리더는 카카오톡 프로그램의 메모리를 읽기 전용으로만 열어요. 메모리에 쓰거나 메시지를 보내는 기능은 없어요.
- 이 PC에서는 심볼릭 링크가 안 만들어져서 im-not-ai는 복사 방식으로 설치했어요. 그래서 원본 저장소가 업데이트돼도 자동으로 반영되지 않아요. 새 버전을 쓰려면 다시 설치해야 해요.
- 저장소에 같이 있는 부가 스킬 `commit-ko`(한글 커밋 메시지 다듬기)는 기본 설치 대상이 아니라 넣지 않았어요.

**아직 안 한 것: 카카오톡 첫 설정**
- 설치만 하고 첫 설정은 실행하지 않았어요. 첫 설정은 카카오톡 메모리에서 대화 DB 키를 찾는 단계라서, 실행 전에 직접 확인받게 되어 있거든요.
- 쓰실 때 카카오톡 PC에 로그인한 상태에서 `/kakao-windows 첫 설정을 해 줘`라고 하면 단계마다 확인하면서 진행해요.
- 대화를 요약하거나 검색시키면 그 내용이 AI 서비스로 전송돼요. 그래서 읽을 방은 직접 고르게 되어 있어요.
- 이 PC는 학교나 회사 공용 PC일 수 있어 보여요. 그렇다면 키와 내보낸 대화가 `%LOCALAPPDATA%\KakaoWindowsReader`에 평문으로 남는다는 점을 감안하세요.
