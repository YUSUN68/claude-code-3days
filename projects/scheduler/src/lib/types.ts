export type Kind = 'quest' | 'appointment';
export type QuestCategory = 'meeting' | 'trip' | 'work' | 'deploy' | 'vacation' | 'training' | 'event' | 'etc';
export type AppointmentCategory = 'lunch' | 'dinner' | 'personal';
export type Category = QuestCategory | AppointmentCategory;

export interface Task {
  id: string;
  user_id: string;
  kind: Kind;
  title: string;
  description: string | null;
  category: Category;
  location: string | null;
  start_at: string | null;
  due_at: string | null;
  all_day: boolean;
  status: 'todo' | 'done';
  deploy_stage: number | null;
  /** 중요도 1=낮음, 2=보통, 3=높음 */
  priority: number;
  xp: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskInput = Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & {
  title: string;
};

export interface Reminder {
  id: string;
  task_id: string;
  offset_minutes: number | null;
  remind_at: string | null;
  sent_at: string | null;
}

export interface TaskImage {
  id: string;
  task_id: string;
  storage_path: string;
  url?: string;
}
