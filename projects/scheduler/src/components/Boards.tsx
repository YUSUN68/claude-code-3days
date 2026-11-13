import { Fragment, useState, type DragEvent, type ReactNode } from 'react';
import { CATEGORIES, DEPLOY_STAGES, QUEST_CATEGORIES } from '../lib/categories';
import { addDays, dayLabel, isoKey, moveToDay, timeLabel } from '../lib/dates';
import { holidayName } from '../lib/holidays';
import { groupByDay, isQuestLike, todayAppointments, todayQuests, urgentQuests, weekRanges } from '../lib/today';
import type { QuestCategory, Task } from '../lib/types';
import { firstWorkdayFrom, lastWorkdayBetween } from '../lib/workdays';
import { useTasks } from '../hooks/useTasks';
import { PixelIcon, type IconName } from './PixelIcon';
import { QuestCard } from './QuestCard';
import { ReportModal } from './Report';

export function Panel({ icon, title, count, children, action }: { icon?: IconName; title: string; count?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="px-box">
      <div className="panel-title">
        {icon && <PixelIcon name={icon} size={18} />}
        <h2 style={{ fontSize: 'inherit' }}>{title}</h2>
        {count != null && <span className="count">{count}</span>}
        {action}
      </div>
      {children}
    </section>
  );
}

/** 기한 이동: 기간 일정은 시작일도 같은 만큼 옮긴다 */
export function moveTaskPatch(t: Task, key: string): Partial<Task> {
  if (t.start_at && t.due_at) {
    const from = isoKey(t.start_at);
    const diff = Math.round((new Date(key).getTime() - new Date(from).getTime()) / 86400000);
    const shift = (iso: string) => moveToDay(iso, addDays(isoKey(iso), diff));
    return { start_at: shift(t.start_at), due_at: shift(t.due_at) };
  }
  return { due_at: moveToDay(t.due_at, key), all_day: t.due_at ? t.all_day : true };
}

function useDrop(onDropId: (id: string) => void) {
  const [over, setOver] = useState(false);
  return {
    over,
    props: {
      onDragOver: (e: DragEvent) => {
        if (e.dataTransfer.types.includes('text/task-id')) {
          e.preventDefault();
          setOver(true);
        }
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/task-id');
        if (id) onDropId(id);
      },
    },
  };
}

export function UrgentBoard() {
  const { tasks, today, vacations } = useTasks();
  const list = urgentQuests(tasks, today, vacations);
  return (
    <Panel icon="work" title="URGENT QUEST" count={`${list.length}건 · 워킹데이 3일 이하`}>
      <div className="list">
        {list.length ? list.map((t) => <QuestCard key={t.id} task={t} />) : <div className="empty">급한 퀘스트가 없어요. 평화로운 마을입니다.</div>}
      </div>
    </Panel>
  );
}

function StageColumn({ index, items }: { index: number; items: Task[] }) {
  const { tasks, setStage, openForm } = useTasks();
  const drop = useDrop((id) => {
    const t = tasks.find((x) => x.id === id);
    if (t && t.category === 'deploy' && (t.deploy_stage ?? 0) !== index) setStage(t, index);
  });
  return (
    <div className={`stage${drop.over ? ' drop' : ''}`} {...drop.props}>
      <h4>
        <span>
          {DEPLOY_STAGES[index]}
        </span>
        <span className="n">{items.length}</span>
      </h4>
      {items.map((t) => (
        <div
          key={t.id}
          className="stage-card"
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/task-id', t.id)}
          onClick={() => openForm({ task: t })}
          title={t.title}
        >
          <div className="row">
            <span className="name">{t.title}</span>
            {index < 4 && (
              <button
                className="stage-next"
                aria-label={`${DEPLOY_STAGES[index + 1]}(으)로 이동`}
                title={`${DEPLOY_STAGES[index + 1]}(으)로`}
                onClick={(e) => {
                  e.stopPropagation();
                  setStage(t, index + 1);
                }}
              >
                ▶
              </button>
            )}
          </div>
          {t.due_at && <div className="tiny muted">{dayLabel(isoKey(t.due_at))}</div>}
        </div>
      ))}
    </div>
  );
}

export function DeployPipeline() {
  const { tasks, today, openForm } = useTasks();
  const weekAgo = addDays(today, -14);
  const deploys = tasks.filter(
    (t) => t.category === 'deploy' && (t.status === 'todo' || (t.completed_at && isoKey(t.completed_at) >= weekAgo)),
  );
  const cols = DEPLOY_STAGES.map((_, i) => deploys.filter((t) => (t.status === 'done' ? 4 : t.deploy_stage ?? 0) === i));
  return (
    <Panel
      icon="deploy"
      title="DEPLOY PIPELINE"
      count={`진행 중 ${deploys.filter((t) => t.status === 'todo').length}`}
      action={
        <button className="btn small" onClick={() => openForm({ initial: { title: '', kind: 'quest', category: 'deploy', deploy_stage: 0 } })}>
          + 반영
        </button>
      }
    >
      <div className="pipeline">
        {cols.map((items, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div className="stage-arrow" aria-hidden="true">
                ▶
              </div>
            )}
            <StageColumn index={i} items={items} />
          </Fragment>
        ))}
      </div>
      <div className="tiny muted" style={{ marginTop: 6 }}>카드를 끌어 단계를 옮기거나 ▶를 누르세요. 반영완료는 최근 2주 것만 보여요.</div>
    </Panel>
  );
}

type ColKey = 'today' | 'thisWeek' | 'nextWeek';

function PeriodColumn({ k, title, show, children, count, onDropId }: { k: ColKey; title: string; show: boolean; children: ReactNode; count: number; onDropId(id: string): void }) {
  const drop = useDrop(onDropId);
  return (
    <div className={`period-col${drop.over ? ' drop' : ''}${show ? ' show' : ''}`} {...drop.props} data-col={k}>
      <h3>
        {title}
        <span className={`count${count === 0 ? ' zero' : ''}`}>{count}</span>
      </h3>
      {children}
    </div>
  );
}

function DayGroups({ groups }: { groups: ReturnType<typeof groupByDay> }) {
  const { vacations } = useTasks();
  if (!groups.length) return <div className="empty">예정된 퀘스트가 없어요</div>;
  return (
    <>
      {groups.map((g) => (
        <div key={g.key}>
          <div className="day-head">
            {dayLabel(g.key)}
            {holidayName(g.key) && <span className="holiday">{holidayName(g.key)}</span>}
            {vacations.has(g.key) && <span className="vac">휴가</span>}
          </div>
          <div className="list">
            {g.items.map((t) => (
              <QuestCard key={t.id} task={t} showDate={false} draggable={isQuestLike(t)} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function PeriodBoard() {
  const { tasks, today, vacations, update } = useTasks();
  const [tab, setTab] = useState<ColKey>('today');
  const { thisWeek, nextWeek } = weekRanges(today);
  const todayList = todayQuests(tasks, today);
  // 약속(점심·저녁 등)은 퀘스트 보드에서 빼고 SOCIAL 패널에만 보여준다
  const boardTasks = tasks.filter((t) => t.kind !== 'appointment');
  const thisGroups = groupByDay(boardTasks, thisWeek.from, thisWeek.to);
  const nextGroups = groupByDay(boardTasks, nextWeek.from, nextWeek.to);
  const pending = (groups: typeof thisGroups) => groups.reduce((n, g) => n + g.items.filter((t) => t.status === 'todo' && t.kind === 'quest').length, 0);

  const moveTo = (target: ColKey) => (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    let key: string | null = today;
    if (target === 'thisWeek') key = lastWorkdayBetween(thisWeek.from, thisWeek.to, vacations) ?? (thisWeek.from <= thisWeek.to ? thisWeek.to : null);
    if (target === 'nextWeek') key = firstWorkdayFrom(nextWeek.from, vacations);
    if (!key) return;
    update(t.id, moveTaskPatch(t, key));
  };

  const tabs: [ColKey, string][] = [
    ['today', '오늘'],
    ['thisWeek', '이번 주'],
    ['nextWeek', '다음 주'],
  ];

  return (
    <Panel icon="meeting" title="QUEST BOARD" count="카드를 끌어 다른 칸으로 옮기면 기한이 바뀌어요">
      <div className="period-tabs" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} className="chip" role="tab" aria-pressed={tab === k} aria-selected={tab === k} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="period">
        <PeriodColumn k="today" title="오늘의 업무" show={tab === 'today'} count={todayList.filter((t) => t.status === 'todo').length} onDropId={moveTo('today')}>
          <div className="list">
            {todayList.length ? todayList.map((t) => <QuestCard key={t.id} task={t} draggable />) : <div className="empty">오늘의 퀘스트를 모두 끝냈어요!</div>}
          </div>
        </PeriodColumn>
        <PeriodColumn k="thisWeek" title="이번 주 업무" show={tab === 'thisWeek'} count={pending(thisGroups)} onDropId={moveTo('thisWeek')}>
          <DayGroups groups={thisGroups} />
        </PeriodColumn>
        <PeriodColumn k="nextWeek" title="다음 주 업무" show={tab === 'nextWeek'} count={pending(nextGroups)} onDropId={moveTo('nextWeek')}>
          <DayGroups groups={nextGroups} />
        </PeriodColumn>
      </div>
    </Panel>
  );
}

function AppointmentCard({ t, target }: { t: Task; target: 'main' | 'widget' }) {
  const { openForm } = useTasks();
  return (
    <div className="quest soft" style={{ borderColor: CATEGORIES[t.category].color }} onClick={() => openForm({ task: t }, target)} role="button" tabIndex={0}>
      <PixelIcon name={t.category} size={20} />
      <div className="q-body">
        <div className="q-title">
          {t.all_day ? '' : <span style={{ color: 'var(--yellow)' }}>{timeLabel(t.due_at!)} </span>}
          {t.title}
        </div>
        <div className="q-meta">
          <span style={{ color: CATEGORIES[t.category].color }}>[{CATEGORIES[t.category].label}]</span>
          {t.location && <span className="loc">@{t.location}</span>}
          {t.description && <span className="loc">{t.description}</span>}
        </div>
      </div>
    </div>
  );
}

export function AppointmentPanel({ target = 'main' }: { target?: 'main' | 'widget' }) {
  const { tasks, today, openForm } = useTasks();
  const list = todayAppointments(tasks, today);
  const upcoming = groupByDay(
    tasks.filter((t) => t.kind === 'appointment'),
    addDays(today, 1),
    addDays(today, 7),
  );
  return (
    <Panel
      icon="dinner"
      title="SOCIAL"
      count={`오늘의 약속 ${list.length}`}
      action={
        <button className="btn small" onClick={() => openForm({ initial: { title: '', kind: 'appointment', category: 'lunch' } }, target)}>
          + 약속
        </button>
      }
    >
      <div className="list">
        {list.length ? list.map((t) => <AppointmentCard key={t.id} t={t} target={target} />) : <div className="empty">오늘은 약속이 없어요</div>}
      </div>
      {upcoming.length > 0 && (
        <div className="social-upcoming">
          <div className="social-sub">다가오는 약속 (7일)</div>
          {upcoming.map((g) => (
            <div key={g.key}>
              <div className="day-head">{dayLabel(g.key)}</div>
              <div className="list">
                {g.items.map((t) => (
                  <AppointmentCard key={t.id} t={t} target={target} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function AllQuests() {
  const { tasks } = useTasks();
  const [filter, setFilter] = useState<QuestCategory | 'all'>('all');
  const [showDone, setShowDone] = useState(false);
  const [report, setReport] = useState(false);
  const list = tasks
    .filter((t) => t.kind === 'quest' && (filter === 'all' || t.category === filter) && (showDone || t.status === 'todo'))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
      return (a.due_at ?? '9999') < (b.due_at ?? '9999') ? -1 : 1;
    });
  return (
    <Panel
      icon="training"
      title="QUEST LOG"
      count={`${list.length}건`}
      action={
        <button className="btn small" onClick={() => setReport(true)}>
          처리 내역
        </button>
      }
    >
      {report && <ReportModal onClose={() => setReport(false)} />}
      <div className="chip-set" style={{ marginBottom: 10 }}>
        <button className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          전체
        </button>
        {QUEST_CATEGORIES.map((c) => (
          <button key={c} className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
            <PixelIcon name={c} size={14} />
            {CATEGORIES[c].label}
          </button>
        ))}
        <button className="chip" aria-pressed={showDone} onClick={() => setShowDone((v) => !v)}>
          완료 포함
        </button>
      </div>
      <div className="list">{list.length ? list.map((t) => <QuestCard key={t.id} task={t} />) : <div className="empty">해당하는 퀘스트가 없어요</div>}</div>
    </Panel>
  );
}
