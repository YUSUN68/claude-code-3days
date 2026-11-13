# 매출 데이터 대시보드 자동화

- 프로젝트: `multicampus-2026-09-practice`
- 세션 ID: `7b9a7ee6-4167-4815-a5f8-633eed78af18`
- 기간: 2026-11-12 14:11 ~ 2026-11-12 14:18 (KST)
- 사용자 요청 수: 2
- 추가된 코드 줄 수: 748

> 원본 대화 기록(.jsonl)에서 사용자 요청과 Claude의 답변만 추렸습니다. 도구 사용은 🔧 한 줄로 요약했고, 키·토큰·이메일은 가렸습니다.

---
### 🙋 사용자 (11-12 14:11)

> 다음에도 매출 데이터 다음달거나 또 내가 파일 주면, 통합데이터부터 대시보드까지 진행하는 이 폴더의 스킬로 만들어줘

> 🔧 Bash: 폴더 구조와 커밋 기록 확인 · Bash: 매출 폴더, 환경 상태, 라이브러리 확인 · Read `multicampus-2026-09-practice\.claude\skills\korean-safe-windows\SKILL.md`

**🤖 Claude:**

Monthly files, the existing consolidated file, and the dashboard — let me look at what's inside each. 🔍

> 🔧 Bash: 매출 엑셀 파일 구조 확인

**🤖 Claude:**

The script name collided with Python's built-in `inspect`, so I'm renaming it. 🙂

> 🔧 Bash: 스크립트 이름을 바꿔 다시 실행 · Read `C:\Users\student\AppData\Local\Temp\claude\f2ca86e10f7b4a16\7b9a7ee6-4167-4815-a5f8-633eed78af18\scratchpad\peek.txt`

**🤖 Claude:**

Three different header styles are mixed across the months (Korean A / Korean B / English). Next I'll look at the existing dashboard. 📊

> 🔧 Read `multicampus-2026-09-practice\03_매출데이터\2026년_01-08월_매출_대시보드.html`

**🤖 Claude:**

The dashboard design is set. Next I'll check the consolidated Excel file's formatting (colors, number formats, column widths) so the skill can reproduce it exactly. 🎨

> 🔧 Bash: 통합 엑셀의 서식 정보 확인 · Read `C:\Users\student\AppData\Local\Temp\claude\f2ca86e10f7b4a16\7b9a7ee6-4167-4815-a5f8-633eed78af18\scratchpad\style.txt` · Write `multicampus-2026-09-practice\.claude\skills\sales-dashboard\scripts\build_sales.py` · Edit `multicampus-2026-09-practice\.claude\skills\sales-dashboard\scripts\build_sales.py` · Bash: 기존 대시보드로 템플릿 파일 만들기

**🤖 Claude:**

Next I'll swap the fixed text in the template for placeholders. ✏️

> 🔧 Edit `multicampus-2026-09-practice\.claude\skills\sales-dashboard\templates\dashboard.html`

**🤖 Claude:**

Now the skill's instructions file (SKILL.md). 📝

> 🔧 Write `multicampus-2026-09-practice\.claude\skills\sales-dashboard\SKILL.md`

**🤖 Claude:**

Files are done. Now I'll test with the real data. First, the check run. 🧪

> 🔧 Bash: 실제 1~8월 데이터로 점검·생성 시험 · Bash: 기존 통합 파일과 비교하고 시험용 9월 파일 준비

**🤖 Claude:**

It matches the existing consolidated file 100%, all 200 rows plus the formulas. 🎯 Now I'll run the scenario of receiving a September file. 📥

> 🔧 Bash: 9월 파일 추가·예외 상황·통합 생성 시험 · Bash: 빠진 달·연도 넘김 처리 확인 · Bash: 기간 이름·연월 인식 함수 확인

**🤖 Claude:**

Everything works as intended. Now I'll open the 1–9월 dashboard from the test in the browser and check it. 🖥️

> 🔧 preview_start · computer

**🤖 Claude:**

A local file can't be screenshotted directly, so I'll briefly start a local web server on this PC to check it. 🔧

> 🔧 Bash: 시험 대시보드용 로컬 웹 서버 실행 · tabs_create · browser_batch

**🤖 Claude:**

The screenshot was taken mid-scroll, so I'll take it once more. 📸

> 🔧 browser_batch

**🤖 Claude:**

The dashboard displays correctly, including the September data, the department filter, and the comparison with the previous month, with no errors. ✅ Now I'll shut down the test server and commit.

> 🔧 tabs_close · PowerShell: 시험 서버 종료 후 변경 목록 확인

**🤖 Claude:**

The test server stopped because I shut it down. Only the 3 skill files changed, so I'll commit just those. 📦

> 🔧 Bash: 스킬 파일 3개 커밋

**🤖 Claude:**

I made a skill in this folder, **`sales-dashboard`**. 🎉 Next time, just send a message like "9월 매출 파일 왔어" (September sales file is here) together with the file, and it will handle everything from the consolidated data through to the dashboard. 🚀

## 📂 Files I made
- [SKILL.md](.claude/skills/sales-dashboard/SKILL.md): the order of work, and the cases where I stop and ask you
- [build_sales.py](.claude/skills/sales-dashboard/scripts/build_sales.py): the script that consolidates the files, builds the dashboard, and checks the results
- [dashboard.html](.claude/skills/sales-dashboard/templates/dashboard.html): a template from your current dashboard design (dark green, same layout)

## 🔄 How it works next time
1. **Adding the file** 📥: the file you send is copied into `03_매출데이터` under a standard name like `2026년_09월_매출.xlsx`. Your original stays as it is.
2. **Check** 🔍: it automatically matches column names that vary by month (부서/팀명/Department, etc.) and handles commas in amounts and total rows.
3. **Build** 🏗️: it creates `2026년_01-09월_매출_통합.xlsx` (4 sheets) and `…_대시보드.html` together.
4. **Verify** ✅: it reopens the results and compares row counts, monthly totals, and department totals against the originals.
5. **Commit** 💾: it commits automatically, following the rules in `CLAUDE.md`.

## ✋ When it stops and asks you instead of building
- The year and month aren't in the file name
- It finds a column name it doesn't recognize
- The amounts aren't in 원 (for example 천원 or USD)
- A month is missing in between, or there are two files for the same month

## 🧪 Test results
- **Your actual January–August data**: the result matched your existing consolidated file exactly, including all 200 rows and the summary formulas. 🎯
- **Messy fake September file** (with a title row, different column names, comma amounts, and a total row): it was added and the January–September files were built. The totals matched, and I confirmed in the browser that the dashboard displays correctly. 📊
- The 천원 file, the file with unfamiliar column names, and the missing-month case all stopped correctly. 🛑
- All tests ran in a temporary folder, and your actual files in `03_매출데이터` are unchanged.

## ✏️ One change to the dashboard
"1~8월" (January–August) was fixed in the text, so now the period changes to match the data. I also added one sentence to the summary box comparing the latest month with the month before (for example, "9월 매출액은 9.8억 원으로 전월보다 7.0% 늘었어요" — 9월 sales up 7.0% on the previous month). The rest of the design is the same.

💾 Commit: `efc9609`, 월별 매출 통합·대시보드를 한 번에 만드는 sales-dashboard 스킬 추가 (adds the sales-dashboard skill)

옛썰

### 🙋 사용자 (11-12 14:18)

> 한국어로 얘기해

**🤖 Claude:**

죄송해요! 🙏 방금 정리를 한국어로 다시 알려드릴게요. 😊

이 폴더에 **`sales-dashboard`** 스킬을 만들었어요. 🎉 다음부터는 "9월 매출 파일 왔어"처럼 말씀하시면서 파일만 주시면, 통합 데이터부터 대시보드까지 한 번에 만들어드려요. 🚀

## 📂 만든 파일
- [SKILL.md](.claude/skills/sales-dashboard/SKILL.md): 작업 순서와 멈춰서 여쭤볼 상황을 정리했어요.
- [build_sales.py](.claude/skills/sales-dashboard/scripts/build_sales.py): 통합, 대시보드 생성, 결과 검증을 하는 스크립트예요.
- [dashboard.html](.claude/skills/sales-dashboard/templates/dashboard.html): 지금 대시보드 디자인(진초록, 같은 배치)으로 만든 틀이에요.

## 🔄 다음에 진행되는 순서
1. **파일 넣기** 📥: 주신 파일을 `03_매출데이터`에 `2026년_09월_매출.xlsx` 같은 표준 이름으로 복사해요. 원본은 그대로 둬요.
2. **점검** 🔍: 달마다 다른 열 이름(부서/팀명/Department 등)을 자동으로 맞춰요. 쉼표가 들어간 금액과 합계 줄도 알아서 처리해요.
3. **만들기** 🏗️: `2026년_01-09월_매출_통합.xlsx`(시트 4개)와 `…_대시보드.html`을 함께 만들어요.
4. **검증** ✅: 결과 파일을 다시 열어 건수, 월별 합계, 부서별 합계를 원본과 대조해요.
5. **커밋** 💾: `CLAUDE.md` 규칙대로 자동으로 저장해요.

## ✋ 이럴 땐 바로 만들지 않고 먼저 여쭤봐요
- 파일 이름에 연월이 없을 때 📅
- 처음 보는 열 이름이 있을 때 🏷️
- 금액 단위가 원이 아닐 때 (천원, USD 등) 💱
- 중간에 빠진 달이 있거나, 같은 달 파일이 두 개일 때 📑

## 🧪 시험 결과
- **실제 1~8월 데이터**: 기존 통합 파일과 200행, 요약 수식까지 완전히 같았어요. 🎯
- **일부러 복잡하게 만든 가상 9월 파일**(제목 줄, 다른 열 이름, 쉼표 금액, 합계 줄 포함): 추가부터 1~9월 통합까지 문제없이 됐어요. 합계도 원본과 맞았고, 브라우저에서 대시보드가 잘 나오는 것도 봤어요. 📊
- 천원 단위 파일, 처음 보는 열 이름, 빠진 달이 있는 경우에는 모두 의도대로 멈췄어요. 🛑
- 시험은 모두 임시 폴더에서 했어요. 실제 `03_매출데이터` 파일은 바뀌지 않았어요.

## ✏️ 대시보드에서 바뀐 점 한 가지
예전에는 "1~8월"이 글자로 고정돼 있었는데, 이제 데이터에 맞춰 기간이 바뀌어요. 그리고 결론 상자에 "가장 최근인 9월 매출액은 9.8억 원으로 전월보다 7.0% 늘었어요" 같은 전월 대비 문장을 한 줄 넣었어요. 나머지 디자인은 그대로예요.

💾 커밋: `efc9609` 월별 매출 통합·대시보드를 한 번에 만드는 sales-dashboard 스킬 추가

앞으로도 한국어로 말씀드릴게요! 🇰🇷😊

옛썰
