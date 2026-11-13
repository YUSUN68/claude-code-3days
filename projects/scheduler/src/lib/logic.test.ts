import { describe, expect, it } from 'vitest';
import { parseQuickAdd } from './quickAdd';
import { firstWorkdayFrom, isWorkday, lastWorkdayBetween, remainingWorkdays } from './workdays';
import { weekRanges } from './today';
import { startOfWeek } from './dates';

describe('remainingWorkdays', () => {
  it('기한이 오늘이면 0', () => {
    expect(remainingWorkdays('2026-11-13', '2026-11-13')).toBe(0);
  });
  it('금요일 → 다음 주 월요일은 1워킹데이 (주말 제외)', () => {
    expect(remainingWorkdays('2026-11-16', '2026-11-13')).toBe(1);
  });
  it('수요일 → 다음 주 월요일은 3워킹데이', () => {
    expect(remainingWorkdays('2026-11-16', '2026-11-11')).toBe(3);
  });
  it('공휴일 제외: 2026-09-23(수) → 2026-09-28(월), 추석 연휴 24·25일 빠짐', () => {
    expect(remainingWorkdays('2026-09-28', '2026-09-23')).toBe(1);
  });
  it('대체공휴일 제외: 2026-03-02(월)은 대체공휴일', () => {
    expect(isWorkday('2026-03-02')).toBe(false);
    expect(remainingWorkdays('2026-03-03', '2026-02-27')).toBe(1);
  });
  it('휴가로 등록한 날은 제외', () => {
    const vac = new Set(['2026-11-16', '2026-11-17']);
    expect(remainingWorkdays('2026-11-18', '2026-11-13', vac)).toBe(1);
  });
  it('지난 기한은 음수', () => {
    expect(remainingWorkdays('2026-11-12', '2026-11-13')).toBe(-1);
    expect(remainingWorkdays('2026-11-13', '2026-11-14')).toBe(-1); // 금 기한, 토요일에 확인
    expect(remainingWorkdays('2026-11-10', '2026-11-13')).toBe(-3);
  });
  it('첫/마지막 근무일', () => {
    expect(firstWorkdayFrom('2026-11-14')).toBe('2026-11-16');
    expect(lastWorkdayBetween('2026-11-14', '2026-11-15')).toBeNull();
    expect(lastWorkdayBetween('2026-11-10', '2026-11-15')).toBe('2026-11-13');
  });
});

describe('weekRanges', () => {
  it('금요일 기준', () => {
    expect(weekRanges('2026-11-13')).toEqual({
      thisWeek: { from: '2026-11-14', to: '2026-11-15' },
      nextWeek: { from: '2026-11-16', to: '2026-11-22' },
    });
  });
  it('일요일에 열면 이번 주는 비고, 다음 주는 내일부터', () => {
    expect(startOfWeek('2026-11-15')).toBe('2026-11-09');
    const r = weekRanges('2026-11-15');
    expect(r.thisWeek.from > r.thisWeek.to).toBe(true);
    expect(r.nextWeek).toEqual({ from: '2026-11-16', to: '2026-11-22' });
  });
  it('월요일에 열면 이번 주는 화~일', () => {
    expect(weekRanges('2026-11-16').thisWeek).toEqual({ from: '2026-11-17', to: '2026-11-22' });
  });
});

describe('parseQuickAdd', () => {
  it('"-"로 시작하면 바로 등록', () => {
    expect(parseQuickAdd('-회의록 정리')).toEqual({ mode: 'instant', title: '회의록 정리' });
    expect(parseQuickAdd('  -  보고서 ')).toEqual({ mode: 'instant', title: '보고서' });
  });
  it('"-"가 없으면 폼 열기', () => {
    expect(parseQuickAdd('주간 보고')).toEqual({ mode: 'form', title: '주간 보고' });
  });
  it('빈 입력이나 "-"만 있으면 무시', () => {
    expect(parseQuickAdd('   ')).toBeNull();
    expect(parseQuickAdd('-')).toBeNull();
    expect(parseQuickAdd(' - ')).toBeNull();
  });
});

import { questXp } from './xp';
import { sortQuests } from './today';
import type { Task } from './types';

describe('questXp (카테고리 기본 XP × 중요도)', () => {
  it('보통은 기본값 그대로', () => {
    expect(questXp('work', 2)).toBe(50);
    expect(questXp('deploy')).toBe(120);
  });
  it('낮음은 절반, 높음은 두 배 (5 단위 반올림)', () => {
    expect(questXp('work', 1)).toBe(25);
    expect(questXp('work', 3)).toBe(100);
    expect(questXp('etc', 1)).toBe(5);
    expect(questXp('meeting', 3)).toBe(40);
  });
  it('휴가는 중요도와 상관없이 0', () => {
    expect(questXp('vacation', 3)).toBe(0);
  });
});

describe('sortQuests', () => {
  const t = (id: string, due: string | null, priority: number, status: 'todo' | 'done' = 'todo') =>
    ({ id, due_at: due, priority, status, created_at: '2026-11-01T00:00:00Z' }) as Task;
  it('같은 날이면 중요도 높은 순, 날짜가 다르면 날짜 순, 완료는 맨 뒤', () => {
    const list = [
      t('a', '2026-11-13T08:00:00Z', 1),
      t('b', '2026-11-13T01:00:00Z', 3),
      t('c', '2026-11-12T05:00:00Z', 1),
      t('d', '2026-11-13T02:00:00Z', 3, 'done'),
      t('e', null, 3),
    ];
    expect(sortQuests(list).map((x) => x.id)).toEqual(['c', 'b', 'a', 'e', 'd']);
  });
});

import { reminderText } from './reminderText';

describe('reminderText', () => {
  it('정시, 분/시간 전, 시간 지정', () => {
    expect(reminderText(0)).toBe('지금 시작이에요');
    expect(reminderText(10)).toBe('10분 후 시작');
    expect(reminderText(120)).toBe('2시간 후 시작');
    expect(reminderText(null)).toBe('알림 시간이에요');
  });
});

import { completedBetween, presetRange, reportText } from './report';

describe('처리 내역', () => {
  it('이번 주/지난 주는 월~일', () => {
    expect(presetRange('thisWeek', '2026-11-13')).toEqual(['2026-11-09', '2026-11-15']);
    expect(presetRange('lastWeek', '2026-11-13')).toEqual(['2026-11-02', '2026-11-08']);
    expect(presetRange('thisWeek', '2026-11-15')).toEqual(['2026-11-09', '2026-11-15']);
  });
  it('이번 달/지난 달 (연도 넘어감 포함)', () => {
    expect(presetRange('thisMonth', '2026-11-13')).toEqual(['2026-11-01', '2026-11-30']);
    expect(presetRange('lastMonth', '2026-01-10')).toEqual(['2025-12-01', '2025-12-31']);
    expect(presetRange('lastMonth', '2026-03-31')).toEqual(['2026-02-01', '2026-02-28']);
  });
  it('기간 안에 완료한 퀘스트만, 최근 완료 순', () => {
    const at = (d: string) => new Date(`${d}T10:00:00`).toISOString();
    const mk = (id: string, p: Partial<Task>) => ({ id, kind: 'quest', category: 'work', title: id, status: 'done', xp: 50, ...p }) as Task;
    const tasks = [
      mk('a', { completed_at: at('2026-11-10') }),
      mk('b', { completed_at: at('2026-11-12') }),
      mk('c', { completed_at: at('2026-11-16') }),
      mk('d', { status: 'todo', completed_at: null }),
      mk('e', { category: 'vacation', completed_at: at('2026-11-11') }),
      mk('f', { kind: 'appointment', category: 'lunch', completed_at: at('2026-11-11') }),
    ];
    const list = completedBetween(tasks, '2026-11-09', '2026-11-15');
    expect(list.map((t) => t.id)).toEqual(['b', 'a']);
    expect(reportText(list, '2026-11-09', '2026-11-15')).toBe('[11/9(월) ~ 11/15(일)] 완료 2건\n- 11/12(목) [업무] b\n- 11/10(화) [업무] a');
  });
});
