import { useEffect, useMemo, useState, type ClipboardEvent, type DragEvent, type FormEvent } from 'react';
import { APPOINTMENT_CATEGORIES, CATEGORIES, DEPLOY_STAGES, NON_QUEST_CATEGORIES, QUEST_CATEGORIES } from '../lib/categories';
import { DEFAULT_PRIORITY, PRIORITIES, questXp } from '../lib/xp';
import { allDayIso, fromLocalInput, isoKey, timeLabel, toLocalInput } from '../lib/dates';
import type { Category, Kind, TaskImage } from '../lib/types';
import { useTasks, type FormDraft, type ReminderDraft } from '../hooks/useTasks';
import { Modal } from './Modal';
import { PixelIcon } from './PixelIcon';

const OFFSETS = [
  { m: 0, label: '정시' },
  { m: 10, label: '10분 전' },
  { m: 30, label: '30분 전' },
  { m: 60, label: '1시간 전' },
  { m: 120, label: '2시간 전' },
];
const DEFAULT_TIME: Partial<Record<Category, string>> = { lunch: '12:00', dinner: '18:30', personal: '19:00' };

function parts(iso: string | null | undefined, allDay: boolean | undefined) {
  if (!iso) return { date: '', time: '' };
  return { date: isoKey(iso), time: allDay ? '' : timeLabel(iso) };
}

function toIso(date: string, time: string): string | null {
  if (!date) return null;
  return time ? new Date(`${date}T${time}`).toISOString() : allDayIso(date);
}

export function QuestForm({ draft, onClose }: { draft: FormDraft; onClose(): void }) {
  const { create, update, remove, loadReminders, loadImages, removeImage, today } = useTasks();
  const src = draft.task ?? draft.initial ?? {};
  const editing = !!draft.task;

  const [kind, setKind] = useState<Kind>(src.kind ?? 'quest');
  const [title, setTitle] = useState(src.title ?? '');
  const [description, setDescription] = useState(src.description ?? '');
  const [category, setCategory] = useState<Category>(src.category ?? (kind === 'appointment' ? 'lunch' : 'work'));
  const [location, setLocation] = useState(src.location ?? '');
  const [stage, setStage] = useState<number>(src.deploy_stage ?? 0);
  const [priority, setPriority] = useState<number>(src.priority ?? DEFAULT_PRIORITY);
  const startP = parts(src.start_at, src.all_day);
  const dueP = parts(src.due_at, src.all_day);
  // 기간 일정(출장·휴가·교육·행사)은 시작일이 비어 있으면 종료일과 같은 날로 채운다
  const [startDate, setStartDate] = useState(
    startP.date || (src.category && CATEGORIES[src.category].ranged ? dueP.date : ''),
  );
  const [startTime, setStartTime] = useState(startP.time);
  const [dueDate, setDueDate] = useState(dueP.date);
  const [dueTime, setDueTime] = useState(dueP.time);

  const [offsets, setOffsets] = useState<number[]>([]);
  const [customs, setCustoms] = useState<string[]>([]);
  const [images, setImages] = useState<TaskImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  useEffect(() => {
    if (!draft.task) return;
    const id = draft.task.id;
    loadReminders(id).then((rs) => {
      setOffsets(rs.filter((r) => r.offset_minutes != null).map((r) => r.offset_minutes!));
      setCustoms(rs.filter((r) => r.offset_minutes == null && r.remind_at).map((r) => toLocalInput(r.remind_at)));
    });
    loadImages(id).then(setImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.task?.id]);

  const ranged = kind === 'quest' && CATEGORIES[category].ranged;
  const hasPriority = kind === 'quest' && !NON_QUEST_CATEGORIES.includes(category);

  const switchKind = (k: Kind) => {
    if (k === kind) return;
    setKind(k);
    if (k === 'appointment') {
      setCategory('lunch');
      if (!dueDate) setDueDate(today);
      setDueTime(DEFAULT_TIME.lunch!);
    } else {
      setCategory('work');
    }
  };

  const pickCategory = (c: Category) => {
    if (kind === 'appointment') {
      const isDefault = !dueTime || Object.values(DEFAULT_TIME).includes(dueTime);
      if (isDefault) setDueTime(DEFAULT_TIME[c] ?? dueTime);
    }
    if (kind === 'quest' && CATEGORIES[c].ranged && !startDate && dueDate) setStartDate(dueDate);
    setCategory(c);
  };

  const addFiles = (list: FileList | File[]) => {
    const imgs = [...list].filter((f) => f.type.startsWith('image/'));
    const tooBig = imgs.find((f) => f.size > 10 * 1024 * 1024);
    if (tooBig) {
      setError('이미지는 한 장에 10MB까지 올릴 수 있어요');
      return;
    }
    setFiles((p) => [...p, ...imgs]);
  };

  const onPaste = (e: ClipboardEvent) => {
    if (e.clipboardData.files.length) addFiles(e.clipboardData.files);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    addFiles(e.dataTransfer.files);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError(kind === 'quest' ? '퀘스트 이름을 입력하세요' : '약속 이름을 입력하세요');

    let start_at: string | null = null;
    let due_at: string | null = null;
    let all_day = false;
    if (ranged) {
      if (startDate && dueDate) {
        start_at = toIso(startDate, startTime);
        due_at = toIso(dueDate, dueTime);
        if (startDate === dueDate && !startTime) start_at = null;
      } else if (startDate || dueDate) {
        due_at = startDate ? toIso(startDate, startTime) : toIso(dueDate, dueTime);
      }
      all_day = !!due_at && !startTime && !dueTime;
      if (start_at && due_at && start_at > due_at) return setError('종료일이 시작일보다 빠를 수 없어요');
    } else {
      due_at = toIso(dueDate, dueTime);
      all_day = !!dueDate && !dueTime;
    }
    if (kind === 'appointment' && !due_at) return setError('약속 날짜를 입력하세요');

    const hasTime = !!(start_at || due_at);
    if (offsets.length && !hasTime) return setError('정시나 "몇 분 전" 알림을 쓰려면 날짜를 입력하세요');
    const reminders: ReminderDraft[] = [
      ...offsets.map((m) => ({ offset_minutes: m, remind_at: null })),
      ...customs.filter(Boolean).map((v) => ({ offset_minutes: null, remind_at: fromLocalInput(v) })),
    ];

    const payload = {
      kind,
      title: title.trim(),
      description: description.trim() || null,
      category,
      location: kind === 'appointment' ? location.trim() || null : null,
      start_at,
      due_at,
      all_day,
      deploy_stage: category === 'deploy' ? stage : null,
      priority: hasPriority ? priority : DEFAULT_PRIORITY,
      xp: questXp(category, hasPriority ? priority : DEFAULT_PRIORITY),
    };

    setBusy(true);
    try {
      if (draft.task) {
        const t = draft.task;
        const doneByStage = category === 'deploy' && stage === 4;
        await update(
          t.id,
          {
            ...payload,
            ...(doneByStage && t.status !== 'done' ? { status: 'done' as const, completed_at: new Date().toISOString() } : {}),
            ...(category === 'deploy' && stage < 4 && t.status === 'done' ? { status: 'todo' as const, completed_at: null } : {}),
          },
          { reminders, files },
        );
      } else {
        await create(payload, { reminders, files });
      }
      onClose();
    } catch (err) {
      setError(`저장하지 못했어요. ${(err as Error).message ?? ''}`.trim());
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!draft.task) return;
    if (!confirmDel) return setConfirmDel(true);
    setBusy(true);
    try {
      await remove(draft.task.id);
      onClose();
    } catch {
      setError('삭제하지 못했어요');
      setBusy(false);
    }
  };

  const cats = kind === 'quest' ? QUEST_CATEGORIES : APPOINTMENT_CATEGORIES;
  const heading = editing ? (kind === 'quest' ? '퀘스트 수정' : '약속 수정') : kind === 'quest' ? '새 퀘스트' : '새 약속';

  return (
    <Modal title={heading} onClose={onClose}>
      <form className="form-grid" onSubmit={submit} onPaste={onPaste}>
        <div className="seg" role="group" aria-label="종류">
          <button type="button" aria-pressed={kind === 'quest'} onClick={() => switchKind('quest')}>
            <PixelIcon name="work" size={16} /> 업무 퀘스트
          </button>
          <button type="button" aria-pressed={kind === 'appointment'} onClick={() => switchKind('appointment')}>
            <PixelIcon name="dinner" size={16} /> 약속
          </button>
        </div>

        <label className="field">
          {kind === 'quest' ? '퀘스트 이름' : '약속 이름'}
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder={kind === 'quest' ? '주간 보고서 작성' : '김 과장님과 점심'} />
        </label>

        <div className="field" style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
          카테고리
          <div className="chip-set" style={{ marginTop: 4 }}>
            {cats.map((c) => (
              <button type="button" key={c} className="chip" aria-pressed={category === c} onClick={() => pickCategory(c)}>
                <PixelIcon name={c} size={16} />
                {CATEGORIES[c].label}
              </button>
            ))}
          </div>
        </div>

        {hasPriority && (
          <div className="field" style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
            <span className="row" style={{ justifyContent: 'space-between' }}>
              중요도
              <span className="xp-preview">보상 +{questXp(category, priority)} XP</span>
            </span>
            <div className="chip-set" style={{ marginTop: 4 }} role="group" aria-label="중요도">
              {PRIORITIES.map((p) => (
                <button type="button" key={p.value} className={`chip prio-${p.value}`} aria-pressed={priority === p.value} onClick={() => setPriority(p.value)}>
                  <span className="stars">{p.stars}</span>
                  {p.label}
                  <span className="tiny muted">×{p.multiplier}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {category === 'deploy' && (
          <label className="field">
            반영 단계
            <select className="input" value={stage} onChange={(e) => setStage(Number(e.target.value))}>
              {DEPLOY_STAGES.map((s, i) => (
                <option key={s} value={i}>
                  {i + 1}. {s}
                </option>
              ))}
            </select>
          </label>
        )}

        {ranged ? (
          <div className="range-grid">
            <label className="field">
              시작일
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="field">
              시작 시각 (선택)
              <input className="input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label className="field">
              종료일
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className="field">
              종료 시각 (선택)
              <input className="input" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </label>
          </div>
        ) : (
          <div className="row">
            <label className="field grow">
              {kind === 'quest' ? '기한' : '날짜'}
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className="field" style={{ width: 140 }}>
              시각 (비우면 종일)
              <input className="input" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </label>
            {kind === 'quest' && (
              <div className="row" style={{ alignSelf: 'end' }}>
                <button type="button" className="btn small" onClick={() => setDueDate(today)}>
                  오늘
                </button>
                {dueDate && (
                  <button type="button" className="btn small ghost" onClick={() => { setDueDate(''); setDueTime(''); }}>
                    기한 없음
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {kind === 'appointment' && (
          <label className="field">
            장소
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="회사 앞 칼국수집" />
          </label>
        )}

        <label className="field">
          {kind === 'quest' ? '설명' : '메모'}
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="field" style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
          알림
          <div className="chip-set" style={{ marginTop: 4 }}>
            {OFFSETS.map((o) => (
              <button
                type="button"
                key={o.m}
                className="chip"
                aria-pressed={offsets.includes(o.m)}
                onClick={() => setOffsets((p) => (p.includes(o.m) ? p.filter((x) => x !== o.m) : [...p, o.m]))}
              >
                {o.label}
              </button>
            ))}
            <button type="button" className="chip" onClick={() => setCustoms((p) => [...p, ''])}>
              + 시간 지정
            </button>
          </div>
          {customs.map((v, i) => (
            <div className="row" key={i} style={{ marginTop: 6 }}>
              <input
                className="input grow"
                type="datetime-local"
                value={v}
                aria-label="알림 시간"
                onChange={(e) => setCustoms((p) => p.map((x, n) => (n === i ? e.target.value : x)))}
              />
              <button type="button" className="btn small ghost" onClick={() => setCustoms((p) => p.filter((_, n) => n !== i))}>
                삭제
              </button>
            </div>
          ))}
        </div>

        <div className="field" style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
          이미지
          <div className="thumbs" style={{ marginTop: 4 }}>
            {images.map((img) => (
              <div className="thumb" key={img.id}>
                {img.url && (
                  <a href={img.url} target="_blank" rel="noreferrer">
                    <img src={img.url} alt="" />
                  </a>
                )}
                <button
                  type="button"
                  className="btn danger small"
                  aria-label="이미지 삭제"
                  onClick={async () => {
                    await removeImage(img);
                    setImages((p) => p.filter((x) => x.id !== img.id));
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.map((u, i) => (
              <div className="thumb" key={u}>
                <img src={u} alt="" />
                <button type="button" className="btn danger small" aria-label="이미지 빼기" onClick={() => setFiles((p) => p.filter((_, n) => n !== i))}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <label
            className={`dropzone${over ? ' over' : ''}`}
            style={{ marginTop: 6 }}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            클릭해서 고르거나, 끌어다 놓거나, Ctrl+V로 붙여넣기
            <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
          </label>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <div className="row">
          {editing && (
            <button type="button" className="btn danger" onClick={doDelete} disabled={busy}>
              {confirmDel ? '정말 삭제할까요?' : '삭제'}
            </button>
          )}
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? '저장 중…' : editing ? '저장' : kind === 'quest' ? '퀘스트 수락' : '약속 잡기'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function QuestFormHost({ target }: { target: 'main' | 'widget' }) {
  const { form, closeForm } = useTasks();
  if (!form || form.target !== target) return null;
  return <QuestForm key={form.draft.task?.id ?? 'new'} draft={form.draft} onClose={closeForm} />;
}
