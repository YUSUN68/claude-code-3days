"""월별 매출 파일 → 통합 엑셀 + HTML 대시보드.

사용법 (실습 폴더에서, 가상환경 Python으로):
  .venv\\Scripts\\python.exe -X utf8 <이 파일> check  [--folder 03_매출데이터]
  .venv\\Scripts\\python.exe -X utf8 <이 파일> add 원본파일 --month 2026-09 [--folder ...] [--replace]
  .venv\\Scripts\\python.exe -X utf8 <이 파일> build  [--folder ...] [--out-dir ...] [--note "교육용 가상 자료"] [--allow-gap]

원본 파일은 읽기만 하고 바꾸지 않는다. 결과는 --report 로 UTF-8 파일에도 남길 수 있다.
"""
import argparse
import csv
import datetime as dt
import html
import json
import re
import shutil
import sys
from pathlib import Path
from unicodedata import normalize

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL_DIR / "templates" / "dashboard.html"

STD = ["부서", "항목", "거래처", "담당자", "매출액", "비용", "이익"]
TEXT_COLS = STD[:4]
MONEY_COLS = STD[4:]

# 원본 열 이름 → 표준 열 이름. 띄어쓰기·대소문자·(원) 같은 단위 괄호는 비교 전에 지운다.
# 새 이름이 나오면 뜻을 수강생에게 확인한 뒤 여기에 추가한다.
SYNONYMS = {
    "부서": ["부서", "부서명", "팀", "팀명", "사업부", "department", "dept", "team", "division"],
    "항목": ["항목", "매출항목", "품목", "상품", "상품명", "제품", "제품명", "category", "item", "product"],
    "거래처": ["거래처", "거래처명", "고객", "고객사", "고객명", "client", "customer", "account"],
    "담당자": ["담당자", "담당", "담당자명", "영업담당", "영업담당자", "manager", "owner", "salesrep", "rep"],
    "매출액": ["매출액", "매출", "매출금액", "revenue", "sales"],
    "비용": ["비용", "원가", "매출원가", "cost", "cogs", "expense"],
    "이익": ["이익", "매출이익", "매출총이익", "영업이익", "profit", "grossprofit"],
}
LOOKUP = {normalize("NFC", s): k for k, vs in SYNONYMS.items() for s in vs}
OK_UNITS = {"", "원", "krw", "₩"}
TOTAL_WORDS = ("합계", "총계", "소계", "total", "subtotal")
DATA_SUFFIXES = {".xlsx", ".xlsm", ".csv"}
OUTPUT_WORDS = ("통합", "대시보드")
UNIT_RE = re.compile(r"[\(\[（](.*?)[\)\]）]")
MONTH_RES = [
    re.compile(r"(20\d{2})\s*년\s*[_\-. ]*\s*(\d{1,2})\s*월"),
    re.compile(r"(20\d{2})[-_.](\d{1,2})(?!\d)"),
    re.compile(r"(?<!\d)(20\d{2})(0[1-9]|1[0-2])(?!\d)"),
]


class Stop(Exception):
    """진행하면 안 되는 문제. 메시지를 수강생에게 그대로 알린다."""


# ---------------------------------------------------------------- 경로·이름
def nfc(s):
    return normalize("NFC", str(s))


def resolve_dir(arg):
    """폴더 인자를 실제 경로로. 없으면 현재 폴더에서 NFC 이름 비교로 찾는다."""
    p = Path(arg)
    if p.is_dir():
        return p.resolve()
    parent = p.parent if str(p.parent) not in ("", ".") else Path.cwd()
    if parent.is_dir():
        hits = [c for c in parent.iterdir() if c.is_dir() and nfc(c.name) == nfc(p.name)]
        if len(hits) == 1:
            return hits[0].resolve()
    raise Stop(f"폴더를 찾지 못했어요: {arg}")


def month_from_name(name):
    n = nfc(name)
    for rx in MONTH_RES:
        m = rx.search(n)
        if m:
            y, mo = int(m.group(1)), int(m.group(2))
            if 1 <= mo <= 12:
                return f"{y:04d}-{mo:02d}"
    return None


def parse_month(s):
    m = re.fullmatch(r"\s*(20\d{2})\s*[-./년]\s*(\d{1,2})\s*월?\s*", nfc(s))
    if not m or not 1 <= int(m.group(2)) <= 12:
        raise Stop(f"--month 는 2026-09 처럼 적어주세요: {s}")
    return f"{int(m.group(1)):04d}-{int(m.group(2)):02d}"


def is_output(name):
    n = nfc(name)
    return any(w in n for w in OUTPUT_WORDS)


def is_source_candidate(p):
    n = nfc(p.name)
    return (p.is_file() and p.suffix.lower() in DATA_SUFFIXES and not n.startswith("~$")
            and "매출" in n and not is_output(n))


# ---------------------------------------------------------------- 원본 읽기
def norm_header(h):
    s = nfc(h if h is not None else "").strip()
    units = [u.strip().lower() for u in UNIT_RE.findall(s)]
    base = re.sub(r"\s+", "", UNIT_RE.sub("", s)).lower()
    return base, units


def map_header(row):
    """한 행이 머리글이면 {표준이름: 열번호}, 단위 문제 목록을 돌려준다. 아니면 None."""
    found, unit_issues = {}, []
    for i, cell in enumerate(row):
        base, units = norm_header(cell)
        std = LOOKUP.get(base)
        if not std:
            continue
        if std in found:
            return None, [f"'{std}'에 해당하는 열이 둘 이상이에요"]
        found[std] = i
        if std in MONEY_COLS:
            bad = [u for u in units if u not in OK_UNITS]
            if bad:
                unit_issues.append(f"'{nfc(cell)}' 열의 단위가 원이 아니에요({', '.join(bad)})")
    if len(found) == len(STD):
        return found, unit_issues
    return None, []


def read_csv_rows(path):
    raw = path.read_bytes()
    for enc in ("utf-8-sig", "cp949"):
        try:
            text = raw.decode(enc)
            return list(csv.reader(text.splitlines())), enc
        except UnicodeDecodeError:
            continue
    raise Stop(f"{path.name}: CSV 인코딩을 읽지 못했어요 (UTF-8·CP949 모두 실패).")


def load_tables(path):
    """[(시트이름, 행 리스트)]"""
    if path.suffix.lower() == ".csv":
        rows, enc = read_csv_rows(path)
        return [(f"CSV({enc})", rows)]
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    try:
        return [(ws.title, [list(r) for r in ws.iter_rows(values_only=True)]) for ws in wb.worksheets]
    finally:
        wb.close()


def to_money(v):
    """숫자로 바꿀 수 있으면 (값, 글자에서 바꿨는지). 아니면 (None, False)."""
    if isinstance(v, bool) or v is None:
        return None, False
    if isinstance(v, (int, float)):
        return (int(v) if float(v).is_integer() else float(v)), False
    s = re.sub(r"[,\s원₩]", "", nfc(v))
    if re.fullmatch(r"-?\d+(\.\d+)?", s):
        f = float(s)
        return (int(f) if f.is_integer() else f), True
    return None, False


def read_source(path, ym):
    """원본 하나를 표준 행으로 읽는다. 진행 불가 문제는 Stop, 확인할 점은 warnings."""
    tables = load_tables(path)
    hits = []
    for sheet, rows in tables:
        for ri, row in enumerate(rows[:10]):
            mapping, unit_issues = map_header(row)
            if mapping:
                hits.append((sheet, ri, mapping, unit_issues, rows))
                break
    if not hits:
        seen = "; ".join(f"[{s}] " + " / ".join(nfc(c) for c in (rows[0] if rows else []) if c is not None)
                         for s, rows in tables)
        raise Stop(f"{path.name}: 머리글에서 {' / '.join(STD)} 7개 열을 모두 찾지 못했어요. "
                   f"원본 첫 줄: {seen}")
    if len(hits) > 1:
        raise Stop(f"{path.name}: 매출 표가 있는 시트가 여러 개예요({', '.join(h[0] for h in hits)}). "
                   "어느 시트를 쓸지 확인이 필요해요.")
    sheet, hr, mapping, unit_issues, rows = hits[0]
    if unit_issues:
        raise Stop(f"{path.name}: " + "; ".join(unit_issues) + ". 단위를 원으로 바꿀지 확인이 필요해요.")

    header = [nfc(rows[hr][mapping[k]]).strip() for k in STD]
    out, warnings, errors = [], [], []
    converted = skipped_total = 0
    for ri in range(hr + 1, len(rows)):
        r = rows[ri]
        excel_row = ri + 1
        vals = [r[mapping[k]] if mapping[k] < len(r) else None for k in STD]
        if all(v is None or nfc(v).strip() == "" for v in vals):
            continue
        texts = [nfc(v).strip() if v is not None else "" for v in vals[:4]]
        squashed = [t.lower().replace(" ", "") for t in texts]
        if any(t == w or t.endswith(w) for t in squashed for w in TOTAL_WORDS):
            skipped_total += 1
            warnings.append(f"{excel_row}행은 합계 줄로 보여서 뺐어요: {' / '.join(t for t in texts if t)}")
            continue
        money = []
        for k, v in zip(MONEY_COLS, vals[4:]):
            num, conv = to_money(v)
            if num is None:
                errors.append(f"{excel_row}행 {k} 칸이 숫자가 아니에요: {v!r}")
            converted += conv
            money.append(num)
        for k, t in zip(TEXT_COLS, texts):
            if not t:
                warnings.append(f"{excel_row}행 {k} 칸이 비어 있어요")
        if None in money:
            continue
        rev, cost, profit = money
        if abs(rev - cost - profit) > 0.5:
            warnings.append(f"{excel_row}행 매출액−비용≠이익 ({rev:,} − {cost:,} ≠ {profit:,}). 원본 값 그대로 둠")
        out.append([ym, *texts, rev, cost, profit, path.name])
    if errors:
        raise Stop(f"{path.name}: " + "; ".join(errors[:10]) + (" ..." if len(errors) > 10 else ""))
    if not out:
        raise Stop(f"{path.name}: 머리글 아래에 데이터 행이 없어요.")
    if converted:
        warnings.append(f"글자로 적힌 금액 {converted}칸을 숫자로 바꿨어요(쉼표·'원' 제거)")
    return {
        "file": path.name, "path": path, "ym": ym, "sheet": sheet, "header": header,
        "rows": out, "warnings": warnings, "skipped_total": skipped_total,
        "sum": [sum(r[5 + i] for r in out) for i in range(3)],
    }


def scan(folder):
    """폴더를 훑어 원본 목록·무시한 파일·문제를 정리한다."""
    by_month, ignored, unknown = {}, [], []
    for p in sorted(folder.iterdir(), key=lambda x: nfc(x.name)):
        if not p.is_file():
            continue
        if not is_source_candidate(p):
            if not nfc(p.name).startswith("~$"):
                ignored.append(p.name)
            continue
        ym = month_from_name(p.name)
        if ym is None:
            unknown.append(p.name)
            continue
        by_month.setdefault(ym, []).append(p)
    dup = {ym: ps for ym, ps in by_month.items() if len(ps) > 1}
    if dup:
        raise Stop("같은 달 파일이 둘 이상이에요 — 어느 것을 쓸지 확인이 필요해요: " + "; ".join(
            f"{ym}: {', '.join(p.name for p in ps)}" for ym, ps in sorted(dup.items())))
    if not by_month:
        raise Stop(f"{folder.name} 폴더에서 'YYYY년_MM월_매출' 형태의 파일을 찾지 못했어요.")
    sources = [(ym, by_month[ym][0]) for ym in sorted(by_month)]
    return sources, ignored, unknown


def missing_months(months):
    def idx(ym):
        return int(ym[:4]) * 12 + int(ym[5:]) - 1
    have = {idx(m) for m in months}
    lo, hi = min(have), max(have)
    return [f"{i // 12:04d}-{i % 12 + 1:02d}" for i in range(lo, hi + 1) if i not in have]


# ---------------------------------------------------------------- 기간 이름
def period_names(months):
    y1, m1 = int(months[0][:4]), int(months[0][5:])
    y2, m2 = int(months[-1][:4]), int(months[-1][5:])
    if y1 == y2:
        file_part = f"{y1}년_{m1:02d}월" if m1 == m2 else f"{y1}년_{m1:02d}-{m2:02d}월"
        text = f"{m1}월" if m1 == m2 else f"{m1}~{m2}월"
        title = f"{y1}년 {text}"
    else:
        file_part = f"{y1}년_{m1:02d}월-{y2}년_{m2:02d}월"
        text = title = f"{y1}년 {m1}월~{y2}년 {m2}월"
    return file_part, text, title


# ---------------------------------------------------------------- 엑셀 쓰기
GREEN, PALE, LINE = "00462A", "E8EFEB", "E1E4E8"
F_BODY = Font(name="Malgun Gothic", size=10)
F_HEAD = Font(name="Malgun Gothic", size=10, bold=True, color=GREEN)
FILL_HEAD = PatternFill("solid", fgColor=PALE)
B_ROW = Border(bottom=Side(style="thin", color=LINE))
MONEY_FMT, PCT_FMT = "#,##0", "0.0%"


def style_header(ws, ncol):
    for c in range(1, ncol + 1):
        cell = ws.cell(row=1, column=c)
        cell.font, cell.fill, cell.border = F_HEAD, FILL_HEAD, B_ROW
        cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.freeze_panes = "A2"
    ws.sheet_view.showGridLines = False


def style_body(ws, r, ncol, fmts, total=False):
    for c in range(1, ncol + 1):
        cell = ws.cell(row=r, column=c)
        cell.font = F_HEAD if total else F_BODY
        cell.border = B_ROW
        if total:
            cell.fill = FILL_HEAD
        if fmts.get(c):
            cell.number_format = fmts[c]


def widths(ws, ws_widths):
    for col, w in ws_widths.items():
        ws.column_dimensions[col].width = w


def summary_sheet(wb, title, key_name, keys, key_col, last):
    ws = wb.create_sheet(title)
    ws.append([key_name, "건수", "매출액(원)", "비용(원)", "이익(원)", "이익률"])
    style_header(ws, 6)
    rng = lambda col: f"'통합 데이터'!${col}$2:${col}${last}"  # noqa: E731
    fmts = {2: MONEY_FMT, 3: MONEY_FMT, 4: MONEY_FMT, 5: MONEY_FMT, 6: PCT_FMT}
    for i, k in enumerate(keys, start=2):
        ws.append([k, f"=COUNTIF({rng(key_col)},A{i})",
                   f"=SUMIFS({rng('F')},{rng(key_col)},A{i})",
                   f"=SUMIFS({rng('G')},{rng(key_col)},A{i})",
                   f"=SUMIFS({rng('H')},{rng(key_col)},A{i})",
                   f"=IF(C{i}=0,0,E{i}/C{i})"])
        style_body(ws, i, 6, fmts)
    t, e = len(keys) + 2, len(keys) + 1
    ws.append(["합계", f"=SUM(B2:B{e})", f"=SUM(C2:C{e})", f"=SUM(D2:D{e})", f"=SUM(E2:E{e})",
               f"=IF(C{t}=0,0,E{t}/C{t})"])
    style_body(ws, t, 6, fmts, total=True)
    widths(ws, {"A": 14 if key_name == "부서" else 10, "B": 8, "C": 18, "D": 18, "E": 18, "F": 10})


def write_excel(path, srcs, rows, depts, notes):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "통합 데이터"
    ws.append(["연월", "부서", "항목", "거래처", "담당자", "매출액(원)", "비용(원)", "이익(원)", "원본 파일"])
    style_header(ws, 9)
    fmts = {6: MONEY_FMT, 7: MONEY_FMT, 8: MONEY_FMT}
    for r in rows:
        ws.append(r)
        style_body(ws, ws.max_row, 9, fmts)
    last = len(rows) + 1
    ws.auto_filter.ref = f"A1:I{last}"
    widths(ws, {"A": 10, "B": 13, "C": 18, "D": 17, "E": 9, "F": 15, "G": 15, "H": 15, "I": 24})

    summary_sheet(wb, "월별 요약", "연월", [s["ym"] for s in srcs], "A", last)
    summary_sheet(wb, "부서별 요약", "부서", depts, "B", last)

    ws = wb.create_sheet("정리 기록")
    ws.append(["원본 파일", "연월", "원본 열 이름", "행 수", "매출액 합계(원)", "비용 합계(원)", "이익 합계(원)"])
    style_header(ws, 7)
    for s in srcs:
        ws.append([s["file"], s["ym"], " / ".join(s["header"]), len(s["rows"]), *s["sum"]])
        style_body(ws, ws.max_row, 7, {5: MONEY_FMT, 6: MONEY_FMT, 7: MONEY_FMT})
    ws.append([])
    for n in notes:
        ws.append([n])
        ws.cell(row=ws.max_row, column=1).font = F_BODY
    widths(ws, {"A": 24, "B": 10, "C": 62, "D": 7, "E": 17, "F": 17, "G": 17})
    wb.save(path)


# ---------------------------------------------------------------- 대시보드 쓰기
def write_dashboard(path, rows, xlsx_name, period_text, period_title, note):
    tpl = TEMPLATE.read_text(encoding="utf-8")
    data = json.dumps([r[:8] for r in rows], ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    src = f"출처: {xlsx_name} '통합 데이터' 시트 (거래 {len(rows):,}건) · 금액 단위: 원 (1억 원 = 100,000,000원)"
    if note:
        src += f" · {note}"
    made = dt.date.today().isoformat()
    repl = {
        "__TITLE__": html.escape(f"{period_title} 매출 대시보드"),
        "__HEADING__": html.escape(f"{period_title} 매출 대시보드"),
        "__SOURCE_LINE__": html.escape(src),
        "__MADE__": made,
        "__DATA__": data,
        "__PERIOD_JSON__": json.dumps(period_text, ensure_ascii=False),
    }
    for k, v in repl.items():
        if k not in tpl:
            raise Stop(f"대시보드 틀에 {k} 자리가 없어요. templates/dashboard.html 을 확인해주세요.")
        tpl = tpl.replace(k, v)
    path.write_text(tpl, encoding="utf-8")


# ---------------------------------------------------------------- 검증
def verify(xlsx, dash, srcs, rows, depts):
    """다시 열어서 원본 합계와 맞는지 확인. 문제 목록을 돌려준다."""
    probs = []
    last = len(rows) + 1
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["통합 데이터"]
    data = [list(r) for r in ws.iter_rows(min_row=2, values_only=True)]
    if len(data) != len(rows):
        probs.append(f"통합 데이터 행 수 {len(data)} ≠ 원본 {len(rows)}")
    for s in srcs:
        got = [sum(r[5 + i] for r in data if r[0] == s["ym"]) for i in range(3)]
        if got != s["sum"]:
            probs.append(f"{s['ym']} 합계 불일치: 통합 {got} / 원본 {s['sum']}")
    for name, n_keys in (("월별 요약", len(srcs)), ("부서별 요약", len(depts))):
        sh = wb[name]
        f = str(sh["C2"].value)
        if f"$F$2:$F${last}" not in f:
            probs.append(f"'{name}' 수식 범위가 {last}행까지가 아니에요: {f}")
        if sh.cell(row=n_keys + 2, column=1).value != "합계":
            probs.append(f"'{name}' 합계 줄 위치가 달라요")
    dept_sum = sum(sum(r[5] for r in data if r[1] == d) for d in depts)
    if dept_sum != sum(s["sum"][0] for s in srcs):
        probs.append("부서별 매출 합계가 전체 합계와 달라요")
    wb.close()

    text = dash.read_text(encoding="utf-8")
    m = re.search(r"const RAW = (\[.*?\]);\n", text, re.S)
    if not m:
        probs.append("대시보드에서 데이터를 찾지 못했어요")
    else:
        raw = json.loads(m.group(1).replace("<\\/", "</"))
        if len(raw) != len(rows) or sum(r[5] for r in raw) != sum(r[5] for r in rows):
            probs.append("대시보드 데이터의 건수·매출 합계가 통합 엑셀과 달라요")
    left = re.findall(r"__[A-Z_]+__", text)
    if left:
        probs.append(f"대시보드에 채워지지 않은 자리가 있어요: {sorted(set(left))}")
    return probs


# ---------------------------------------------------------------- 명령
def won(v):
    return f"{v:,.0f}원"


def eok(v):
    return f"{v / 1e8:.1f}억 원"


def read_all(folder):
    sources, ignored, unknown = scan(folder)
    srcs, stops = [], []
    for ym, p in sources:
        try:
            srcs.append(read_source(p, ym))
        except Stop as e:
            stops.append(str(e))
    return srcs, stops, ignored, unknown


def report_scan(folder, srcs, stops, ignored, unknown, lines):
    lines.append(f"[폴더] {folder}")
    lines.append(f"[원본] {len(srcs) + len(stops)}개 중 읽기 성공 {len(srcs)}개")
    for s in srcs:
        lines.append(f"  - {s['ym']}  {s['file']}  ({len(s['rows'])}행, 매출 {won(s['sum'][0])})"
                     f"  열: {' / '.join(s['header'])}")
        for w in s["warnings"]:
            lines.append(f"      ! {w}")
    if unknown:
        lines.append("[확인 필요] 이름에서 연월을 알 수 없어 뺀 파일: " + ", ".join(unknown))
    if ignored:
        lines.append("[참고] 원본이 아니라서 건너뛴 파일: " + ", ".join(ignored))
    for s in stops:
        lines.append(f"[멈춤] {s}")
    if srcs:
        gap = missing_months([s["ym"] for s in srcs] + [])
        if gap:
            lines.append("[확인 필요] 중간에 빠진 달: " + ", ".join(gap))


def cmd_check(args, lines):
    folder = resolve_dir(args.folder)
    srcs, stops, ignored, unknown = read_all(folder)
    report_scan(folder, srcs, stops, ignored, unknown, lines)
    if srcs:
        fp, _, title = period_names([s["ym"] for s in srcs])
        lines.append(f"[예정] 기간 {title} → {fp}_매출_통합.xlsx / {fp}_매출_대시보드.html")
    return 2 if stops else 0


def cmd_add(args, lines):
    folder = resolve_dir(args.folder)
    src = Path(args.source)
    if not src.is_file():
        raise Stop(f"추가할 파일을 찾지 못했어요: {args.source}")
    if src.suffix.lower() not in DATA_SUFFIXES:
        raise Stop(f"엑셀(.xlsx·.xlsm)이나 CSV 파일만 추가할 수 있어요: {src.name}")
    ym = parse_month(args.month) if args.month else month_from_name(src.name)
    if not ym:
        raise Stop(f"{src.name}: 파일 이름에서 연월을 알 수 없어요. --month 2026-09 처럼 알려주세요.")
    info = read_source(src, ym)  # 먼저 읽어 봐서 형식 문제를 미리 잡는다
    dest = folder / f"{ym[:4]}년_{ym[5:]}월_매출{src.suffix.lower()}"
    same_month = [p for p in folder.iterdir() if is_source_candidate(p) and month_from_name(p.name) == ym]
    if src.resolve() in [p.resolve() for p in same_month]:
        lines.append(f"[그대로] {src.name} 는 이미 폴더 안에 있는 {ym} 원본이에요.")
        return 0
    if same_month:
        if src.read_bytes() == same_month[0].read_bytes():
            lines.append(f"[그대로] {same_month[0].name} 와 내용이 같아서 복사하지 않았어요.")
            return 0
        if not args.replace:
            raise Stop(f"{ym} 원본이 이미 있어요({', '.join(p.name for p in same_month)}). "
                       "새 파일로 바꿀지 수강생에게 확인한 뒤 --replace 로 다시 실행해주세요.")
        for p in same_month:
            if p != dest:
                raise Stop(f"이름이 다른 같은 달 파일({p.name})이 있어요. 어떤 파일을 남길지 확인이 필요해요.")
    shutil.copy2(src, dest)
    lines.append(f"[추가] {src.name} → {folder.name}\\{dest.name} 로 복사했어요 (원본은 그대로).")
    lines.append(f"  {ym}: {len(info['rows'])}행, 매출 {won(info['sum'][0])}, 열: {' / '.join(info['header'])}")
    for w in info["warnings"]:
        lines.append(f"      ! {w}")
    return 0


def cmd_build(args, lines):
    folder = resolve_dir(args.folder)
    out_dir = Path(args.out_dir).resolve() if args.out_dir else folder
    out_dir.mkdir(parents=True, exist_ok=True)
    srcs, stops, ignored, unknown = read_all(folder)
    report_scan(folder, srcs, stops, ignored, unknown, lines)
    if stops:
        lines.append("→ 멈춘 파일이 있어서 만들지 않았어요.")
        return 2
    months = [s["ym"] for s in srcs]
    gap = missing_months(months)
    if gap and not args.allow_gap:
        lines.append("→ 빠진 달이 있어서 만들지 않았어요. 그대로 진행하려면 --allow-gap 을 붙여주세요.")
        return 2

    rows = [r for s in srcs for r in s["rows"]]
    depts = list(dict.fromkeys(r[1] for r in rows))
    file_part, period_text, period_title = period_names(months)
    xlsx = out_dir / f"{file_part}_매출_통합.xlsx"
    dash = out_dir / f"{file_part}_매출_대시보드.html"

    headers = {" / ".join(s["header"]) for s in srcs}
    n_warn = sum(len(s["warnings"]) for s in srcs)
    profit_bad = sum(1 for s in srcs for w in s["warnings"] if "≠이익" in w)
    blanks = sum(1 for s in srcs for w in s["warnings"] if "비어 있어요" in w)
    skipped = sum(s["skipped_total"] for s in srcs)
    notes = [
        f"열 이름 통일: 원본 열 이름 {len(headers)}종류를 {' / '.join(STD)}(으)로 맞춤. 금액 단위는 모두 원.",
        f"원본 값 확인: {len(srcs)}개 파일, 총 {len(rows)}행. "
        + ("빈칸 없음" if not blanks else f"빈칸 {blanks}곳(원본 그대로)") + ", 금액 칸은 모두 숫자, "
        + ("모든 행에서 매출액 − 비용 = 이익." if not profit_bad else f"매출액 − 비용 ≠ 이익인 행 {profit_bad}개(원본 값 그대로).")
        + (f" 합계 줄 {skipped}개는 뺌." if skipped else ""),
        "이 시트의 합계는 원본 파일에서 직접 더한 값. '월별 요약' 시트의 수식 결과와 같아야 정상.",
        f"원본 파일 {len(srcs)}개는 바꾸지 않음.",
        f"만든 날: {dt.date.today().isoformat()} · sales-dashboard 스킬로 생성",
    ]
    write_excel(xlsx, srcs, rows, depts, notes)
    write_dashboard(dash, rows, xlsx.name, period_text, period_title, args.note)

    probs = verify(xlsx, dash, srcs, rows, depts)
    tot = [sum(s["sum"][i] for s in srcs) for i in range(3)]
    lines.append(f"[결과] 기간 {period_title} · {len(srcs)}개월 · {len(rows)}건")
    lines.append(f"  매출액 {won(tot[0])} ({eok(tot[0])}) · 비용 {won(tot[1])} · 이익 {won(tot[2])}"
                 f" · 이익률 {tot[2] / tot[0] * 100:.1f}%")
    if len(srcs) >= 2:
        a, b = srcs[-2], srcs[-1]
        ch = (b["sum"][0] - a["sum"][0]) / a["sum"][0] * 100 if a["sum"][0] else 0
        lines.append(f"  최근 달 {b['ym']} 매출 {eok(b['sum'][0])} (전월 대비 {ch:+.1f}%)")
    lines.append(f"  통합 엑셀: {xlsx}")
    lines.append(f"  대시보드: {dash}")
    if n_warn:
        lines.append(f"  확인할 점 {n_warn}개는 위 '!' 줄에 있어요.")
    old = [p.name for p in out_dir.iterdir() if p.is_file() and is_output(p.name)
           and "매출" in nfc(p.name) and p.name not in (xlsx.name, dash.name)
           and not nfc(p.name).startswith("~$")]
    if old:
        lines.append("[이전 결과물] 다른 기간으로 만든 파일이 남아 있어요: " + ", ".join(sorted(old)))
    if probs:
        lines.append("[검증 실패] " + "; ".join(probs))
        return 3
    lines.append("[검증 통과] 통합 엑셀·대시보드의 건수와 월별 합계가 원본과 같아요.")
    return 0


def main():
    ap = argparse.ArgumentParser(description="월별 매출 파일 통합 + 대시보드")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("check", "add", "build"):
        p = sub.add_parser(name)
        p.add_argument("--folder", default="03_매출데이터", help="월별 원본이 모인 폴더")
        p.add_argument("--report", help="결과를 UTF-8 텍스트로도 저장할 경로")
        if name == "add":
            p.add_argument("source", help="새로 받은 매출 파일")
            p.add_argument("--month", help="연월 (예: 2026-09). 파일 이름에 있으면 생략 가능")
            p.add_argument("--replace", action="store_true", help="같은 달 원본을 새 파일로 교체")
        if name == "build":
            p.add_argument("--out-dir", help="결과 저장 폴더 (기본: 원본 폴더)")
            p.add_argument("--note", default="", help="대시보드 출처 줄 끝에 붙일 말 (예: 교육용 가상 자료)")
            p.add_argument("--allow-gap", action="store_true", help="중간에 빠진 달이 있어도 진행")
    args = ap.parse_args()
    lines = []
    try:
        code = {"check": cmd_check, "add": cmd_add, "build": cmd_build}[args.cmd](args, lines)
    except Stop as e:
        lines.append(f"[멈춤] {e}")
        code = 2
    text = "\n".join(lines)
    if args.report:
        Path(args.report).write_text(text + "\n", encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    print(text)
    sys.exit(code)


if __name__ == "__main__":
    main()
