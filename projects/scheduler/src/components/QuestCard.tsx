import type { DragEvent } from 'react';
import { CATEGORIES, DEPLOY_STAGES } from '../lib/categories';
import { dayLabel, isoKey, timeLabel } from '../lib/dates';
import { isQuestLike, taskRange, urgency } from '../lib/today';
import type { Task } from '../lib/types';
import { useTasks } from '../hooks/useTasks';
import { priorityInfo } from '../lib/xp';

export function whenLabel(t: Task): string {
  const r = taskRange(t);
  if (!r) return '기한 없음';
  if (r[0] !== r[1]) return `${dayLabel(r[0])}~${dayLabel(r[1])}`;
  return t.all_day || !t.due_at ? dayLabel(r[0]) : `${dayLabel(r[0])} ${timeLabel(t.due_at)}`;
}

interface Props {
  task: Task;
  draggable?: boolean;
  showDate?: boolean;
  target?: 'main' | 'widget';
}

export function QuestCard({ task: t, draggable, showDate = true, target = 'main' }: Props) {
  const { today, vacations, toggleDone, openForm, imageCounts } = useTasks();
  const info = CATEGORIES[t.category];
  const u = urgency(t, today, vacations);
  const checkable = isQuestLike(t);
  const soft = !checkable;

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('text/task-id', t.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  let dueText: string | null = null;
  if (u && t.status === 'todo') {
    if (u.overdue) dueText = '기한 지남';
    else if (u.remaining === 0) dueText = '오늘 마감';
    else dueText = `${u.remaining}일 남음`;
  }

  return (
    <div
      className={`quest${u?.urgent ? ' urgent' : ''}${t.status === 'done' ? ' done' : ''}${soft ? ' soft' : ''}`}
      style={soft ? { borderColor: info.color } : undefined}
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onClick={() => openForm({ task: t }, target)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openForm({ task: t }, target)}
    >
      {checkable && (
        <button
          className="check"
          aria-label={t.status === 'done' ? '완료 취소' : '완료'}
          onClick={(e) => {
            e.stopPropagation();
            toggleDone(t);
          }}
        >
          {t.status === 'done' ? '✓' : ''}
        </button>
      )}
      <div className="q-body">
        <div className="q-title">
          {checkable && t.priority === 3 && t.status === 'todo' && (
            <span className="bang" title="중요도 높음">
              !{' '}
            </span>
          )}
          <span className="q-cat" style={{ color: info.color }}>
            [{info.label}]
          </span>{' '}
          {t.title}
        </div>
        <div className="q-meta">
          {showDate && <span>{whenLabel(t)}</span>}
          {!showDate && t.due_at && !t.all_day && <span>{timeLabel(t.due_at)}</span>}
          {dueText && <span className={u?.urgent ? 'warn' : ''}>{dueText}</span>}
          {t.status === 'done' && t.completed_at && (
            <span className="done-at">✓ {dayLabel(isoKey(t.completed_at))} 완료</span>
          )}
          {t.location && <span className="loc">@{t.location}</span>}
          {(imageCounts[t.id] ?? 0) > 0 && <span className="loc">그림 {imageCounts[t.id]}</span>}
          {t.category === 'deploy' && t.deploy_stage != null && <span style={{ color: 'var(--orange)' }}>({DEPLOY_STAGES[t.deploy_stage]})</span>}
          {checkable && (
            <span className={`stars prio-${t.priority ?? 2}`} title={`중요도 ${priorityInfo(t.priority).label}`}>
              {priorityInfo(t.priority).stars}
            </span>
          )}
          {checkable && t.xp > 0 && <span className="xp">+{t.xp} XP</span>}
        </div>
      </div>
    </div>
  );
}
