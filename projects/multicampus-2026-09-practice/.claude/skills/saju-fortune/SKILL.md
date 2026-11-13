---
name: saju-fortune
description: 사주팔자 정보를 인터뷰로 확인한 뒤 이 폴더에 들어 있는 사주 계산 코드로 종합운·연애운·재물운·직업운·건강운·한해 운세·궁합을 대화형으로 풀이한다. "사주 봐줘", "올해 운세 어때?", "연애운 봐줘", "우리 궁합 봐줘", "생년월일시로 사주팔자 풀이해줘" 요청에 쓴다.
license: MIT
metadata:
  source: https://github.com/NomaDamas/k-skill (saju-fortune)
  locale: ko-KR
---

# 사주 풀이 (saju-fortune)

출처: [NomaDamas/k-skill](https://github.com/NomaDamas/k-skill)의 `saju-fortune` 스킬과 `saju-fortune` 패키지(MIT 라이선스, `LICENSE` 참고).
원본은 `npm install -g saju-fortune`로 전역 설치해서 쓰지만, 이 실습 폴더에서는 **계산 코드를 `lib/` 폴더에 함께 넣어 두었기 때문에 따로 설치할 필요가 없다.** Node.js 18 이상만 있으면 된다. 외부 인터넷 연결이나 다른 패키지도 필요 없다.

사용자를 바로 점치지 않는다. 먼저 필요한 정보를 인터뷰하고, 계산 결과를 근거로 사주 풀이 상담사처럼 대화한다.

## 쓰지 않는 경우

- 의학 진단, 투자 수익 보장, 법적 판단처럼 전문 책임이 필요한 결정을 대신해야 할 때
- 출생 정보 없이 일반 조언만 원할 때
- 사주를 확정된 사실이나 운명으로 단정해야 할 때

## 1. 먼저 인터뷰

계산 전에 아래를 확인한다. 부족하면 풀이를 시작하지 말고 짧게 묻는다.

1. 이름(선택)
2. 양력/음력
3. 생년월일 (`YYYY-MM-DD`)
4. 태어난 시간 (`HH:mm`, 모르면 모른다고 기록)
5. 성별 (코드에는 `male` / `female`로 넣는다)
6. 출생 시군구(선택)
7. 보고 싶은 주제: 종합운, 연애운, 재물운, 직업운, 건강운, 한해 운세, 궁합

권장 질문:

```text
사주 풀이를 위해 양력/음력, 생년월일, 태어난 시간, 성별을 알려주세요. 보고 싶은 주제도 골라주세요: 연애운, 재물운, 직업운, 건강운, 한해 운세, 궁합.
```

- 태어난 시간을 모르면: "시주는 확정하지 못해요. 대략의 시간대가 있으면 알려주시고, 없으면 연·월·일 중심으로 보수적으로 풀어볼게요."
- 음력 생일이면 이 코드로 변환하지 않는다. 검증된 만세력으로 양력 날짜를 먼저 확인한 뒤 `calendar: "solar"`로 넣고, 변환 근거와 윤달 여부를 한계로 적는다. 양력 날짜를 확인하지 못하면 풀이하지 않는다.
- 궁합은 두 사람 각각의 생년월일·시간·성별을 확인한다.

## 2. 한 사람 사주 계산

계산 코드는 이 스킬 폴더의 `lib/index.js`다. 작업 폴더(프로젝트 루트)에서 아래처럼 실행한다. Windows에서도 Bash 도구로 그대로 실행된다.

```bash
node - <<'JS'
const { analyzeSaju } = require(require("path").resolve(".claude/skills/saju-fortune/lib/index.js"))

const result = analyzeSaju({
  name: "민준",
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  gender: "male",
  birthCity: "서울"
}, {
  analysisType: "fortune",
  fortuneType: "wealth",
  targetYear: 2026
})

console.log(JSON.stringify(result, null, 2))
JS
```

`fortuneType` 대응표:

| 주제 | 값 |
|---|---|
| 종합운 | `general` |
| 연애운 | `love` |
| 재물운 | `wealth` |
| 직업운 | `career` |
| 건강운 | `health` |
| 한해 운세 | `general` + `targetYear` |

## 3. 궁합 계산

```bash
node - <<'JS'
const { checkCompatibility } = require(require("path").resolve(".claude/skills/saju-fortune/lib/index.js"))

const result = checkCompatibility({
  person1: { name: "민준", birthDate: "1990-03-15", birthTime: "10:30", gender: "male" },
  person2: { name: "서연", birthDate: "1992-07-20", birthTime: "14:30", gender: "female" }
})

console.log(JSON.stringify(result, null, 2))
JS
```

## 4. 도구 이름으로 호출 (선택)

```js
const { callSajuTool } = require(require("path").resolve(".claude/skills/saju-fortune/lib/index.js"))
const result = callSajuTool("analyze_saju", {
  birthDate: "1990-03-15", birthTime: "10:30", gender: "male",
  analysisType: "fortune", fortuneType: "love"
})
```

지원 도구명: `analyze_saju`, `check_compatibility`, `get_daily_fortune`, `get_dae_un`, `get_fortune_by_period`, `convert_calendar`, `manage_settings`

## 5. 풀이하는 순서

1. **입력 정보와 정확도 한계** — 양력/음력, 시간, 출생지 누락 여부
2. **사주팔자 요약** — 연주·월주·일주·시주와 일간을 짧게
3. **오행 분포** — 강한 오행과 부족한 오행을 생활 언어로
4. **주제별 풀이** — 사용자가 고른 주제만 깊게
5. **실천 조언** — 단정 대신 대화·습관·리스크 관리 조언
6. **주의 문구** — 사주 풀이는 재미와 자기점검용이며 의료·투자·법률 판단을 대신하지 않는다

## 지킬 것

- 입력한 생년월일시는 풀이 중에만 쓰고 파일로 저장하지 않는다.
- 불안을 주는 단정적 흉언, 저주, 사망 예언, 질병 확정 표현은 하지 않는다.
- 궁합 점수는 관계 대화의 참고자료일 뿐 이별·결혼 결정을 대신하지 않는다.
- 태어난 시간이 없으면 시주 기반 해석은 확정하지 않는다.
