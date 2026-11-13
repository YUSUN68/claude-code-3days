import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { dayLabel } from '../lib/dates';
import { desktop } from '../lib/desktop';
import { todayAppointments, todayQuests } from '../lib/today';
import { timeLabel } from '../lib/dates';
import { CATEGORIES } from '../lib/categories';
import { useTasks } from '../hooks/useTasks';
import { PixelIcon } from './PixelIcon';
import { QuestCard } from './QuestCard';
import { QuickAdd } from './QuickAdd';
import { QuestFormHost } from './QuestForm';

/** 오늘의 업무 + 오늘의 약속 + 빠른 등록. 미니창(PiP)과 윈도우 위젯이 함께 쓴다 */
export function WidgetView({ mode }: { mode: 'pip' | 'desktop' }) {
  const { tasks, today, openForm, loading } = useTasks();
  const quests = todayQuests(tasks, today);
  const apps = todayAppointments(tasks, today);
  const left = quests.filter((t) => t.status === 'todo').length;

  return (
    <div className={`widget widget-${mode}`}>
      <div className="widget-head drag">
        <PixelIcon name="work" size={16} />
        <span>TODAY</span>
        <span className="muted">
          {dayLabel(today)} · 남은 {left}
        </span>
        {mode === 'desktop' && desktop && (
          <span className="no-drag row" style={{ gap: 2 }}>
            <button className="btn ghost small" title="대시보드 열기" aria-label="대시보드 열기" onClick={() => desktop!.openMain('/')}>
              ⌂
            </button>
            <button className="btn ghost small" title="위젯 숨기기" aria-label="위젯 숨기기" onClick={() => desktop!.closeWidget()}>
              ✕
            </button>
          </span>
        )}
      </div>

      <div className="px-box">
        <QuickAdd target="widget" compact />
      </div>

      <div className="px-box widget-list">
        <div className="list">
          {loading ? (
            <div className="empty">불러오는 중…</div>
          ) : quests.length ? (
            quests.map((t) => <QuestCard key={t.id} task={t} target="widget" />)
          ) : (
            <div className="empty">오늘의 퀘스트를 모두 끝냈어요!</div>
          )}
        </div>
      </div>

      {apps.length > 0 && (
        <div className="px-box">
          <div className="widget-head" style={{ marginBottom: 6 }}>
            <PixelIcon name="dinner" size={14} />
            <span>SOCIAL</span>
          </div>
          <div className="list">
            {apps.map((t) => (
              <div key={t.id} className="quest soft" style={{ borderColor: CATEGORIES[t.category].color }} onClick={() => openForm({ task: t }, 'widget')} role="button" tabIndex={0}>
                <PixelIcon name={t.category} size={16} />
                <div className="q-body">
                  <div className="q-title" style={{ fontSize: 13 }}>
                    {!t.all_day && t.due_at && <span style={{ color: 'var(--yellow)' }}>{timeLabel(t.due_at)} </span>}
                    {t.title}
                  </div>
                  {t.location && <div className="q-meta"><span className="loc">@{t.location}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type PipApi = { requestWindow(o: { width: number; height: number }): Promise<Window>; window: Window | null };

/** 브라우저용 '항상 위' 미니창 (Chrome/Edge 116+) */
export function usePipWidget() {
  const [win, setWin] = useState<Window | null>(null);
  const api = (window as unknown as { documentPictureInPicture?: PipApi }).documentPictureInPicture;

  const open = useCallback(async () => {
    if (!api) return false;
    if (api.window) {
      api.window.focus();
      return true;
    }
    let w: Window;
    try {
      w = await api.requestWindow({ width: 340, height: 540 });
    } catch {
      return false;
    }
    const base = w.document.createElement('base');
    base.href = `${location.origin}/`;
    w.document.head.append(base);
    for (const sheet of [...document.styleSheets]) {
      try {
        const style = w.document.createElement('style');
        style.textContent = [...sheet.cssRules].map((r) => r.cssText).join('\n');
        w.document.head.append(style);
      } catch {
        if (sheet.href) {
          const link = w.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          w.document.head.append(link);
        }
      }
    }
    w.document.title = '오늘의 퀘스트';
    w.document.body.className = 'pip-body';
    w.addEventListener('pagehide', () => setWin(null));
    setWin(w);
    return true;
  }, [api]);

  const portal = win
    ? createPortal(
        <>
          <WidgetView mode="pip" />
          <QuestFormHost target="widget" />
        </>,
        win.document.body,
      )
    : null;

  return { supported: !!api, open, portal, isOpen: !!win };
}
