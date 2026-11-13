import { NON_QUEST_CATEGORIES } from './categories';
import { addDays, eachDay, isoKey, startOfWeek } from './dates';
import type { Task } from './types';
import { remainingWorkdays, URGENT_WORKDAYS } from './workdays';

/** 완료 체크·XP·긴급 판정 대상인 업무 퀘스트인지 (휴가·행사·약속 제외) */
export function isQuestLike(t: Task): boolean {
  return t.kind === 'quest' && !NON_QUEST_CATEGORIES.includes(t.category);
}

/** 일정이 차지하는 날짜 범위 [시작, 끝] */
export function taskRange(t: Task): [string, string] | null {
  const s = t.start_at ?? t.due_at;
  const e = t.due_at ?? t.start_at;
  if (!s || !e) return null;
  return [isoKey(s), isoKey(e)];
}

export function vacationDays(tasks: Task[]): Set<string> {
  const set = new Set<string>();
  for (const t of tasks) {
    if (t.category !== 'vacation') continue;
    const r = taskRange(t);
    if (r) for (const k of eachDay(r[0], r[1])) set.add(k);
  }
  return set;
}

export interface Urgency {
  remaining: number;
  overdue: boolean;
  urgent: boolean;
}

export function urgency(t: Task, today: string, vacations: Set<string>): Urgency | null {
  if (!isQuestLike(t) || !t.due_at) return null;
  const due = isoKey(t.due_at);
  const remaining = remainingWorkdays(due, today, vacations);
  const overdue = due < today;
  return { remaining, overdue, urgent: t.status === 'todo' && (overdue || remaining <= URGENT_WORKDAYS) };
}

export function urgentQuests(tasks: Task[], today: string, vacations: Set<string>): Task[] {
  return tasks
    .filter((t) => urgency(t, today, vacations)?.urgent)
    .sort((a, b) => (a.due_at! < b.due_at! ? -1 : 1));
}

function doneToday(t: Task, today: string) {
  return t.status === 'done' && !!t.completed_at && isoKey(t.completed_at) === today;
}

/** 미완료 먼저 → 기한 날짜 빠른 순 → 같은 날이면 중요도 높은 순 → 시각 순 */
export function sortQuests(list: Task[]): Task[] {
  return list.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
    const ak = a.due_at ? isoKey(a.due_at) : '9999', bk = b.due_at ? isoKey(b.due_at) : '9999';
    if (ak !== bk) return ak < bk ? -1 : 1;
    const ap = a.priority ?? 2, bp = b.priority ?? 2;
    if (ap !== bp) return bp - ap;
    const ad = a.due_at ?? '', bd = b.due_at ?? '';
    return ad < bd ? -1 : ad > bd ? 1 : a.created_at < b.created_at ? -1 : 1;
  });
}

/** 오늘의 업무: 기한이 오늘이거나 지난 것 + 기한 없는 것 (오늘 완료한 것은 줄 그어 아래로) */
export function todayQuests(tasks: Task[], today: string): Task[] {
  return sortQuests(
    tasks.filter(
      (t) =>
        isQuestLike(t) &&
        (t.status === 'todo' || doneToday(t, today)) &&
        (!t.due_at || isoKey(t.due_at) <= today),
    ),
  );
}

export function todayAppointments(tasks: Task[], today: string): Task[] {
  return tasks
    .filter((t) => t.kind === 'appointment' && t.due_at && isoKey(t.due_at) === today)
    .sort((a, b) => (a.due_at! < b.due_at! ? -1 : 1));
}

/** 오늘부터 days일 안에 걸쳐 있는 휴가·행사 */
export function upcomingEvents(tasks: Task[], today: string, days = 7): Task[] {
  const end = addDays(today, days);
  return tasks
    .filter((t) => NON_QUEST_CATEGORIES.includes(t.category))
    .filter((t) => {
      const r = taskRange(t);
      return r && r[1] >= today && r[0] <= end;
    })
    .sort((a, b) => (taskRange(a)![0] < taskRange(b)![0] ? -1 : 1));
}

export interface DayGroup {
  key: string;
  items: Task[];
}

/** [from, to] 구간에 걸친 일정을 날짜별로 묶는다. 여러 날짜 일정은 구간 안 첫날에 표시 */
export function groupByDay(tasks: Task[], from: string, to: string): DayGroup[] {
  if (from > to) return [];
  const groups = new Map<string, Task[]>();
  for (const t of tasks) {
    const r = taskRange(t);
    if (!r || r[1] < from || r[0] > to) continue;
    const anchor = r[0] < from ? from : r[0];
    if (!groups.has(anchor)) groups.set(anchor, []);
    groups.get(anchor)!.push(t);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, items]) => ({ key, items: sortQuests(items) }));
}

export function weekRanges(today: string) {
  const mon = startOfWeek(today);
  const sun = addDays(mon, 6);
  return {
    thisWeek: { from: addDays(today, 1), to: sun },
    nextWeek: { from: addDays(mon, 7), to: addDays(mon, 13) },
  };
}
