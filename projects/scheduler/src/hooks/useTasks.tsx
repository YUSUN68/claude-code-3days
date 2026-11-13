import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { dateKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { vacationDays } from '../lib/today';
import type { Reminder, Task, TaskImage, TaskInput } from '../lib/types';
import { DEFAULT_PRIORITY, levelInfo, questXp, totalXp } from '../lib/xp';

export interface ReminderDraft {
  offset_minutes: number | null;
  remind_at: string | null;
}

export interface FormDraft {
  task?: Task;
  initial?: Partial<TaskInput>;
}

export interface Celebration {
  key: number;
  xp: number;
  level: number | null;
}

interface SaveOpts {
  reminders?: ReminderDraft[];
  files?: File[];
}

interface TasksCtx {
  userId: string;
  tasks: Task[];
  imageCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
  today: string;
  vacations: Set<string>;
  create(input: TaskInput, opts?: SaveOpts): Promise<Task>;
  update(id: string, patch: Partial<Task>, opts?: SaveOpts): Promise<void>;
  remove(id: string): Promise<void>;
  toggleDone(t: Task): Promise<void>;
  setStage(t: Task, stage: number): Promise<void>;
  loadReminders(taskId: string): Promise<Reminder[]>;
  loadImages(taskId: string): Promise<TaskImage[]>;
  removeImage(img: TaskImage): Promise<void>;
  form: { draft: FormDraft; target: 'main' | 'widget' } | null;
  openForm(draft?: FormDraft, target?: 'main' | 'widget'): void;
  closeForm(): void;
  celebration: Celebration | null;
}

const Ctx = createContext<TasksCtx | null>(null);

export function useTasks(): TasksCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('TasksProvider가 필요합니다');
  return v;
}

function useToday() {
  const [today, setToday] = useState(() => dateKey(new Date()));
  useEffect(() => {
    const id = setInterval(() => setToday(dateKey(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);
  return today;
}

type Row = Task & { sched_task_images?: { count: number }[] };

export function TasksProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [imageCounts, setImageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TasksCtx['form']>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const today = useToday();
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const upsertLocal = useCallback((t: Task) => {
    setTasks((prev) => {
      const i = prev.findIndex((x) => x.id === t.id);
      if (i === -1) return [...prev, t];
      const next = prev.slice();
      next[i] = t;
      return next;
    });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('sched_tasks')
        .select('*, sched_task_images(count)')
        .order('due_at', { ascending: true, nullsFirst: false });
      if (!alive) return;
      if (error) setError('퀘스트를 불러오지 못했어요. 새로고침해 주세요.');
      const rows = (data ?? []) as Row[];
      const counts: Record<string, number> = {};
      setTasks(
        rows.map(({ sched_task_images, ...t }) => {
          counts[t.id] = sched_task_images?.[0]?.count ?? 0;
          return t;
        }),
      );
      setImageCounts(counts);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`sched_tasks:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sched_tasks', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as { id: string }).id;
            setTasks((prev) => prev.filter((t) => t.id !== id));
          } else {
            upsertLocal(payload.new as Task);
          }
        },
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [userId, upsertLocal]);

  const saveReminders = async (taskId: string, reminders: ReminderDraft[]) => {
    const del = await supabase.from('sched_reminders').delete().eq('task_id', taskId);
    if (del.error) throw del.error;
    const rows = reminders
      .filter((r) => r.offset_minutes != null || r.remind_at)
      .map((r) => ({ task_id: taskId, offset_minutes: r.offset_minutes, remind_at: r.offset_minutes == null ? r.remind_at : null }));
    if (rows.length) {
      const ins = await supabase.from('sched_reminders').insert(rows);
      if (ins.error) throw ins.error;
    }
  };

  const uploadFiles = async (taskId: string, files: File[]) => {
    for (const f of files) {
      const ext = (f.name.split('.').pop() || f.type.split('/')[1] || 'png').toLowerCase();
      const path = `${userId}/${taskId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from('sched-images').upload(path, f, { contentType: f.type });
      if (up.error) throw up.error;
      const ins = await supabase.from('sched_task_images').insert({ task_id: taskId, storage_path: path });
      if (ins.error) throw ins.error;
    }
    if (files.length) setImageCounts((c) => ({ ...c, [taskId]: (c[taskId] ?? 0) + files.length }));
  };

  const create: TasksCtx['create'] = async (input, opts) => {
    const kind = input.kind ?? 'quest';
    const category = input.category ?? (kind === 'quest' ? 'etc' : 'lunch');
    const priority = input.priority ?? DEFAULT_PRIORITY;
    const row = {
      ...input,
      kind,
      category,
      priority,
      xp: input.xp ?? questXp(category, priority),
      deploy_stage: category === 'deploy' ? input.deploy_stage ?? 0 : null,
    };
    const { data, error } = await supabase.from('sched_tasks').insert(row).select().single();
    if (error) throw error;
    const t = data as Task;
    upsertLocal(t);
    if (opts?.reminders) await saveReminders(t.id, opts.reminders);
    if (opts?.files?.length) await uploadFiles(t.id, opts.files);
    return t;
  };

  const update: TasksCtx['update'] = async (id, patch, opts) => {
    const prev = tasksRef.current.find((t) => t.id === id);
    if (prev) upsertLocal({ ...prev, ...patch });
    const { data, error } = await supabase.from('sched_tasks').update(patch).eq('id', id).select().single();
    if (error) {
      if (prev) upsertLocal(prev);
      throw error;
    }
    upsertLocal(data as Task);
    if (opts?.reminders) await saveReminders(id, opts.reminders);
    if (opts?.files?.length) await uploadFiles(id, opts.files);
  };

  const remove: TasksCtx['remove'] = async (id) => {
    const { data: imgs } = await supabase.from('sched_task_images').select('storage_path').eq('task_id', id);
    if (imgs?.length) await supabase.storage.from('sched-images').remove(imgs.map((i) => i.storage_path));
    const { error } = await supabase.from('sched_tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((p) => p.filter((t) => t.id !== id));
  };

  const celebrate = (t: Task) => {
    if (t.xp <= 0) return;
    const before = levelInfo(totalXp(tasksRef.current)).level;
    const after = levelInfo(totalXp(tasksRef.current) + t.xp).level;
    setCelebration({ key: Date.now(), xp: t.xp, level: after > before ? after : null });
  };

  const toggleDone: TasksCtx['toggleDone'] = async (t) => {
    if (t.status === 'done') {
      await update(t.id, { status: 'todo', completed_at: null, ...(t.category === 'deploy' && t.deploy_stage === 4 ? { deploy_stage: 3 } : {}) });
    } else {
      celebrate(t);
      await update(t.id, { status: 'done', completed_at: new Date().toISOString(), ...(t.category === 'deploy' ? { deploy_stage: 4 } : {}) });
    }
  };

  const setStage: TasksCtx['setStage'] = async (t, stage) => {
    if (stage === 4 && t.status !== 'done') {
      celebrate(t);
      await update(t.id, { deploy_stage: 4, status: 'done', completed_at: new Date().toISOString() });
    } else if (stage < 4) {
      await update(t.id, { deploy_stage: stage, status: 'todo', completed_at: null });
    }
  };

  const loadReminders = async (taskId: string) => {
    const { data } = await supabase.from('sched_reminders').select('*').eq('task_id', taskId).order('remind_at');
    return (data ?? []) as Reminder[];
  };

  const loadImages = async (taskId: string) => {
    const { data } = await supabase.from('sched_task_images').select('*').eq('task_id', taskId).order('created_at');
    const imgs = (data ?? []) as TaskImage[];
    if (!imgs.length) return imgs;
    const { data: signed } = await supabase.storage.from('sched-images').createSignedUrls(imgs.map((i) => i.storage_path), 3600);
    return imgs.map((i, n) => ({ ...i, url: signed?.[n]?.signedUrl ?? undefined }));
  };

  const removeImage = async (img: TaskImage) => {
    await supabase.storage.from('sched-images').remove([img.storage_path]);
    await supabase.from('sched_task_images').delete().eq('id', img.id);
    setImageCounts((c) => ({ ...c, [img.task_id]: Math.max(0, (c[img.task_id] ?? 1) - 1) }));
  };

  const vacations = useMemo(() => vacationDays(tasks), [tasks]);

  const value: TasksCtx = {
    userId,
    tasks,
    imageCounts,
    loading,
    error,
    today,
    vacations,
    create,
    update,
    remove,
    toggleDone,
    setStage,
    loadReminders,
    loadImages,
    removeImage,
    form,
    openForm: (draft = {}, target = 'main') => setForm({ draft, target }),
    closeForm: () => setForm(null),
    celebration,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
