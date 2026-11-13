import { CATEGORIES } from './categories';
import type { Category, Task } from './types';

export const XP_PER_LEVEL = 500;

export const PRIORITIES = [
  { value: 1, label: '낮음', stars: '★', multiplier: 0.5 },
  { value: 2, label: '보통', stars: '★★', multiplier: 1 },
  { value: 3, label: '높음', stars: '★★★', multiplier: 2 },
] as const;

export const DEFAULT_PRIORITY = 2;

export function priorityInfo(p: number | null | undefined) {
  return PRIORITIES.find((x) => x.value === p) ?? PRIORITIES[1];
}

/** 퀘스트 XP = 카테고리 기본 XP × 중요도 배율 (5 단위로 반올림) */
export function questXp(category: Category, priority: number = DEFAULT_PRIORITY): number {
  const base = CATEGORIES[category].xp;
  return Math.round((base * priorityInfo(priority).multiplier) / 5) * 5;
}

export function totalXp(tasks: Task[]): number {
  return tasks.reduce((s, t) => (t.kind === 'quest' && t.status === 'done' ? s + t.xp : s), 0);
}

export function levelInfo(xp: number) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    current: xp % XP_PER_LEVEL,
    next: XP_PER_LEVEL,
  };
}
