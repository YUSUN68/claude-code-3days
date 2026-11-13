import { CATEGORIES } from './categories';
import { addDays, dayLabel, isoKey, startOfWeek } from './dates';
import { isQuestLike } from './today';
import type { Task } from './types';

export type ReportPreset = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export const REPORT_PRESETS: { id: Exclude<ReportPreset, 'custom'>; label: string }[] = [
  { id: 'thisWeek', label: '이번 주' },
  { id: 'lastWeek', label: '지난 주' },
  { id: 'thisMonth', label: '이번 달' },
  { id: 'lastMonth', label: '지난 달' },
];

/** 프리셋 기간 [시작, 끝] (양 끝 포함, 주는 월~일) */
export function presetRange(p: Exclude<ReportPreset, 'custom'>, today: string): [string, string] {
  if (p === 'thisWeek' || p === 'lastWeek') {
    const mon = addDays(startOfWeek(today), p === 'lastWeek' ? -7 : 0);
    return [mon, addDays(mon, 6)];
  }
  const [y, m] = today.split('-').map(Number);
  const first = p === 'thisMonth' ? new Date(y, m - 1, 1) : new Date(y, m - 2, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const k = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return [k(first), k(last)];
}

/** 기간 안에 완료한 퀘스트 (최근 완료 순) */
export function completedBetween(tasks: Task[], from: string, to: string): Task[] {
  return tasks
    .filter((t) => isQuestLike(t) && t.status === 'done' && t.completed_at)
    .filter((t) => {
      const k = isoKey(t.completed_at!);
      return k >= from && k <= to;
    })
    .sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1));
}

/** 완료일별로 묶기 (입력 순서 유지) */
export function groupByCompletedDay(list: Task[]): [string, Task[]][] {
  const map = new Map<string, Task[]>();
  for (const t of list) {
    const k = isoKey(t.completed_at!);
    map.set(k, [...(map.get(k) ?? []), t]);
  }
  return [...map.entries()];
}

/** 보고서에 붙여 넣을 텍스트 */
export function reportText(list: Task[], from: string, to: string): string {
  const head = `[${dayLabel(from)} ~ ${dayLabel(to)}] 완료 ${list.length}건`;
  const lines = list.map((t) => `- ${dayLabel(isoKey(t.completed_at!))} [${CATEGORIES[t.category].label}] ${t.title}`);
  return [head, ...lines].join('\n');
}
