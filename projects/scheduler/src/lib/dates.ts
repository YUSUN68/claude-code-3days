/** 날짜 문자열 'YYYY-MM-DD' (브라우저 로컬 시간대 기준) */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isoKey(iso: string): string {
  return dateKey(new Date(iso));
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** 그 주의 월요일 */
export function startOfWeek(key: string): string {
  const dow = fromKey(key).getDay(); // 0=일
  return addDays(key, dow === 0 ? -6 : 1 - dow);
}

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export function dayLabel(key: string): string {
  const d = fromKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`;
}

export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** datetime-local 입력값 <-> ISO */
export function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  return `${isoKey(iso)}T${timeLabel(iso)}`;
}

export function fromLocalInput(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

/** 종일 일정은 그날 09:00으로 저장 (알림 기준 시각) */
export function allDayIso(key: string): string {
  const d = fromKey(key);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

/** key 날짜에 원래 시각(HH:mm)을 유지해서 옮긴 ISO */
export function moveToDay(iso: string | null, key: string): string {
  const d = fromKey(key);
  if (iso) {
    const src = new Date(iso);
    d.setHours(src.getHours(), src.getMinutes(), 0, 0);
  } else {
    d.setHours(9, 0, 0, 0);
  }
  return d.toISOString();
}

/** 기간의 날짜 목록 (양 끝 포함) */
export function eachDay(fromK: string, toK: string): string[] {
  const out: string[] = [];
  for (let k = fromK; k <= toK; k = addDays(k, 1)) out.push(k);
  return out;
}
