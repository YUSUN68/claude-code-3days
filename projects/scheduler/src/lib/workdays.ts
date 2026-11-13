import { addDays, fromKey } from './dates';
import { holidayName } from './holidays';

export function isWeekend(key: string): boolean {
  const dow = fromKey(key).getDay();
  return dow === 0 || dow === 6;
}

export function isWorkday(key: string, vacations: Set<string> = new Set()): boolean {
  return !isWeekend(key) && !holidayName(key) && !vacations.has(key);
}

/**
 * 남은 워킹데이 = (오늘, 기한] 구간의 근무일 수.
 * 기한이 오늘이면 0, 지났으면 음수(최소 -1).
 */
export function remainingWorkdays(dueKey: string, todayKey: string, vacations: Set<string> = new Set()): number {
  if (dueKey === todayKey) return 0;
  const forward = dueKey > todayKey;
  const [from, to] = forward ? [todayKey, dueKey] : [dueKey, todayKey];
  let n = 0;
  for (let k = addDays(from, 1); k <= to; k = addDays(k, 1)) if (isWorkday(k, vacations)) n++;
  return forward ? n : Math.min(-1, -n);
}

export const URGENT_WORKDAYS = 3;

/** from부터 시작해 처음 나오는 근무일 (최대 2주 탐색) */
export function firstWorkdayFrom(key: string, vacations: Set<string> = new Set()): string {
  let k = key;
  for (let i = 0; i < 14 && !isWorkday(k, vacations); i++) k = addDays(k, 1);
  return k;
}

/** from~to 중 마지막 근무일 (없으면 null) */
export function lastWorkdayBetween(fromK: string, toK: string, vacations: Set<string> = new Set()): string | null {
  for (let k = toK; k >= fromK; k = addDays(k, -1)) if (isWorkday(k, vacations)) return k;
  return null;
}
