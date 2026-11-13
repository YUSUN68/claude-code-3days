import type { AppointmentCategory, Category, QuestCategory } from './types';

export interface CategoryInfo {
  label: string;
  color: string;
  xp: number;
  /** 기간(시작~종료)으로 등록할 수 있는지 */
  ranged: boolean;
}

export const QUEST_CATEGORIES: QuestCategory[] = ['work', 'meeting', 'deploy', 'trip', 'training', 'event', 'vacation', 'etc'];
export const APPOINTMENT_CATEGORIES: AppointmentCategory[] = ['lunch', 'dinner', 'personal'];

export const CATEGORIES: Record<Category, CategoryInfo> = {
  meeting: { label: '회의', color: '#5fb4ff', xp: 20, ranged: false },
  trip: { label: '출장', color: '#c58bff', xp: 40, ranged: true },
  work: { label: '업무', color: '#5ee07a', xp: 50, ranged: false },
  deploy: { label: '반영', color: '#ff8a3d', xp: 120, ranged: false },
  vacation: { label: '휴가', color: '#3fd6c6', xp: 0, ranged: true },
  training: { label: '교육', color: '#ffd84a', xp: 30, ranged: true },
  event: { label: '행사', color: '#ff6fae', xp: 20, ranged: true },
  etc: { label: '기타', color: '#b8b5d6', xp: 10, ranged: false },
  lunch: { label: '점심약속', color: '#f6c177', xp: 0, ranged: false },
  dinner: { label: '저녁약속', color: '#e98a8a', xp: 0, ranged: false },
  personal: { label: '기타약속', color: '#a3d9a5', xp: 0, ranged: false },
};

export const DEPLOY_STAGES = ['개발요청', '테스트', '테스트완료', '반영', '반영완료'] as const;

/** 긴급(워킹데이) 판정과 완료 체크에서 빼는 카테고리 */
export const NON_QUEST_CATEGORIES: Category[] = ['vacation', 'event'];
