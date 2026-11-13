import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import type { EventClickArg, EventContentArg, EventDropArg, EventInput } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { APPOINTMENT_CATEGORIES, CATEGORIES, QUEST_CATEGORIES } from '../lib/categories';
import { addDays, allDayIso, dateKey } from '../lib/dates';
import { allHolidays } from '../lib/holidays';
import { taskRange } from '../lib/today';
import type { Category, Task } from '../lib/types';
import { useTasks } from '../hooks/useTasks';
import { moveTaskPatch } from '../components/Boards';
import { PixelIcon } from '../components/PixelIcon';
import { DEFAULT_TIME } from '../components/QuestForm';

const HOLIDAY_EVENTS: EventInput[] = allHolidays().map(([k, name]) => ({
  id: `holiday-${k}`,
  start: k,
  allDay: true,
  display: 'background',
  title: name,
  classNames: ['ev-holiday'],
}));

function toEvents(tasks: Task[]): EventInput[] {
  const out: EventInput[] = [];
  for (const t of tasks) {
    const r = taskRange(t);
    if (!r) continue;
    const info = CATEGORIES[t.category];
    const allDay = t.all_day || r[0] !== r[1];
    const cls = ['ev', `ev-${t.kind}`];
    if (t.status === 'done') cls.push('ev-done');
    out.push({
      id: t.id,
      title: t.title,
      start: allDay ? r[0] : t.start_at ?? t.due_at!,
      end: allDay ? addDays(r[1], 1) : undefined,
      allDay,
      backgroundColor: t.kind === 'appointment' ? 'transparent' : info.color,
      borderColor: info.color,
      textColor: t.kind === 'appointment' ? info.color : '#141129',
      classNames: cls,
      extendedProps: { category: t.category },
    });
    if (t.category === 'vacation') {
      out.push({ id: `vac-${t.id}`, start: r[0], end: addDays(r[1], 1), allDay: true, display: 'background', backgroundColor: info.color, classNames: ['ev-vacation-bg'] });
    }
  }
  return out;
}

function renderEvent(arg: EventContentArg) {
  const cat = arg.event.extendedProps.category as Category | undefined;
  if (!cat) return <span className="fc-bg-title">{arg.event.title}</span>;
  return (
    <span className="ev-inner">
      <PixelIcon name={cat} size={14} />
      {arg.timeText && <b>{arg.timeText}</b>}
      <span className="ev-title">{arg.event.title}</span>
    </span>
  );
}

export function CalendarPage() {
  const { tasks, openForm, update, today } = useTasks();
  const events = useMemo(() => [...HOLIDAY_EVENTS, ...toEvents(tasks)], [tasks]);

  const onDateClick = (a: DateClickArg) => {
    const key = dateKey(a.date);
    openForm({ initial: { title: '', kind: 'quest', due_at: a.allDay ? allDayIso(key) : a.date.toISOString(), all_day: a.allDay } });
  };

  /** 하단 범례를 누르면 그 카테고리로 오늘 날짜 등록 창을 연다 (약속은 기본 시각) */
  const newOfCategory = (c: Category) => {
    const appt = APPOINTMENT_CATEGORIES.includes(c as never);
    const time = appt ? DEFAULT_TIME[c] : undefined;
    openForm({
      initial: {
        title: '',
        kind: appt ? 'appointment' : 'quest',
        category: c,
        due_at: time ? new Date(`${today}T${time}`).toISOString() : allDayIso(today),
        all_day: !time,
      },
    });
  };

  const onEventClick = (a: EventClickArg) => {
    const t = tasks.find((x) => x.id === a.event.id);
    if (t) openForm({ task: t });
  };

  const onDrop = async (a: EventDropArg) => {
    const t = tasks.find((x) => x.id === a.event.id);
    if (!t || !a.event.start) return a.revert();
    try {
      if (a.event.allDay) {
        await update(t.id, { ...moveTaskPatch(t, dateKey(a.event.start)), ...(a.oldEvent.allDay ? {} : { all_day: true }) });
      } else {
        const delta = a.event.start.getTime() - (a.oldEvent.start?.getTime() ?? a.event.start.getTime());
        const shift = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + delta).toISOString() : null);
        await update(t.id, a.oldEvent.allDay ? { due_at: a.event.start.toISOString(), start_at: null, all_day: false } : { due_at: shift(t.due_at), start_at: shift(t.start_at), all_day: false });
      }
    } catch {
      a.revert();
    }
  };

  return (
    <div className="stack">
      <section className="px-box calendar-box">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={koLocale}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'addQuest dayGridMonth,timeGridWeek' }}
          customButtons={{
            addQuest: {
              text: '+ 등록',
              hint: '새 퀘스트나 약속 등록',
              click: () => openForm({ initial: { title: '', kind: 'quest', due_at: allDayIso(dateKey(new Date())), all_day: true } }),
            },
          }}
          buttonText={{ month: '월간', week: '주간', today: '오늘' }}
          height="auto"
          firstDay={1}
          dayMaxEvents={4}
          nowIndicator
          editable
          eventDurationEditable={false}
          slotMinTime="07:00:00"
          slotMaxTime="23:00:00"
          events={events}
          eventContent={renderEvent}
          dateClick={onDateClick}
          eventClick={onEventClick}
          eventDrop={onDrop}
        />
      </section>
      <section className="px-box tight">
        <div className="chip-set">
          {[...QUEST_CATEGORIES, ...APPOINTMENT_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              className="chip legend-chip"
              title={`${CATEGORIES[c].label} 등록`}
              onClick={() => newOfCategory(c)}
              style={{ borderColor: CATEGORIES[c].color, borderStyle: APPOINTMENT_CATEGORIES.includes(c as never) ? 'dashed' : 'solid' }}
            >
              <PixelIcon name={c} size={14} />
              {CATEGORIES[c].label}
            </button>
          ))}
          <span className="chip" style={{ borderColor: '#ff8a8a', cursor: 'default' }}>공휴일</span>
        </div>
        <div className="tiny muted" style={{ marginTop: 6 }}>카테고리를 누르면 그 카테고리로 바로 등록해요. 날짜를 누르면 그날로 등록하고, 일정을 끌어 옮기면 기한이 바뀌어요.</div>
      </section>
    </div>
  );
}
