# 설정

- 프로젝트: `multicampus-2026-09-practice`
- 세션 ID: `500c697c-ade8-4470-a1b1-13668338caf4`
- 기간: 2026-11-12 10:47 ~ 2026-11-12 10:50 (KST)
- 사용자 요청 수: 1
- 추가된 코드 줄 수: 102

> 원본 대화 기록(.jsonl)에서 사용자 요청과 Claude의 답변만 추렸습니다. 도구 사용은 🔧 한 줄로 요약했고, 키·토큰·이메일은 가렸습니다.

---
### 🙋 사용자 (11-12 10:47)

> 세팅해줘~!

> 🔧 Skill

**🤖 Claude:**

이 컴퓨터에 필요한 프로그램이 있는지 확인하고, 없는 것만 준비할게요.

먼저 지금 폴더와 기존 기록, 컴퓨터 상태를 확인할게요.

> 🔧 PowerShell: Show current folder contents and system info · PowerShell: Find Python, Node, and winget commands

**🤖 Claude:**

Node.js 24는 이미 깔려 있어요. Python은 스토어 바로가기만 보여서, 실제 Python이 있는지 더 확인할게요.

> 🔧 PowerShell: Look for real Python installations · PowerShell: Check Node, npm, and npx versions · PowerShell: Check the Python 3.13 package in winget

**🤖 Claude:**

Python 3.13.17을 이 사용자 계정에만 설치할게요. 관리자 비밀번호 없이 진행되는 방식이에요. 조금 걸릴 수 있어요.

> 🔧 PowerShell: Install Python 3.13 for the current user

**🤖 Claude:**

설치 프로그램은 성공이라고 했어요. 실제로 Python이 실행되는지 직접 확인할게요.

> 🔧 PowerShell: Run the newly installed Python to verify it

**🤖 Claude:**

Python 3.13.17(64비트)이 정상 실행돼요. 이제 이 폴더 전용 Python 공간(가상환경)을 만들고 라이브러리 5개를 설치할게요.

> 🔧 PowerShell: Create the practice virtual environment and verify it · PowerShell: Install the five document libraries into the venv

**🤖 Claude:**

설치는 끝났어요(빨간 글씨는 pip 새 버전 알림이라 문제없어요). 라이브러리 5개를 하나씩 불러와서 확인할게요.

> 🔧 PowerShell: Import each of the five libraries in the venv · Read `multicampus-2026-09-practice\.claude\skills\korean-safe-windows\SKILL.md`

**🤖 Claude:**

라이브러리 5개 모두 정상이에요. 마지막으로 한글 폴더·파일을 만들고 다시 읽어보는 검사를 할게요.

> 🔧 Write `C:\Users\student\AppData\Local\Temp\claude\15fc2ec022da0b6b\500c697c-ade8-4470-a1b1-13668338caf4\scratchpad\ko_check.py` · Write `C:\Users\student\AppData\Local\Temp\claude\15fc2ec022da0b6b\500c697c-ade8-4470-a1b1-13668338caf4\scratchpad\ko_check.js` · PowerShell: Run the Korean path and file encoding checks

**🤖 Claude:**

한글 검사도 모두 통과했어요. 다음 대화에서 쓸 수 있게 결과를 기록해둘게요.

> 🔧 Write `multicampus-2026-09-practice\.setup-status.md`

**🤖 Claude:**

Node.js·Python과 파일 실습 도구 준비가 끝났어요. 한글 폴더에서 파일을 만들고 다시 읽는 것도 확인했어요. 이제 새 대화에서 실습을 시작해주세요.

**이번에 한 일**
- **Node.js**: 이미 설치되어 있어서 그대로 썼어요. Node 24.20.0, npm·npx 11.19.0 모두 잘 작동해요.
- **Python**: 이 컴퓨터에는 스토어로 연결되는 바로가기만 있고, 실제 Python은 없었어요. 그래서 Python 3.13.17을 새로 설치했어요. 지금 사용자 계정에만 설치해서 관리자 비밀번호는 필요 없었어요.
- **실습 폴더 전용 Python 공간(`.venv`)**: 이 공간을 만들고 라이브러리 5개를 설치했어요.
  - 엑셀: openpyxl
  - Word: python-docx
  - PPT: python-pptx
  - PDF 읽기: pdfplumber
  - 표 정리: pandas
  - 5개 모두 하나씩 불러와서 정상인 것을 확인했어요.
- **한글 확인**: 한글·공백·괄호가 들어간 폴더에서 아래 검사를 모두 통과했어요. 검사용으로 만든 폴더는 다시 지웠어요.
  - Python과 Node.js로 텍스트 파일을 서로 쓰고 읽기
  - CSV 파일에 한글 쓰고 읽기
  - 엑셀 파일에 한글 쓰고 읽기
- 컴퓨터 설정(PATH, 실행 정책 등)은 바꾸지 않았어요.

결과는 [.setup-status.md](.setup-status.md)에 정리해뒀어요. 다음 대화에서 이 기록을 보고 같은 Python을 쓰게 돼요.
