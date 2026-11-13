import { useMemo, useState } from 'react';
import { CATEGORIES } from '../lib/categories';
import { dayLabel } from '../lib/dates';
import { completedBetween, groupByCompletedDay, presetRange, REPORT_PRESETS, reportText, type ReportPreset } from '../lib/report';
import { useTasks } from '../hooks/useTasks';
import { Modal } from './Modal';

/** 기간을 골라 그 기간에 완료한 퀘스트를 한 번에 보는 창 */
export function ReportModal({ onClose }: { onClose(): void }) {
  const { tasks, today, openForm } = useTasks();
  const [preset, setPreset] = useState<ReportPreset>('thisWeek');
  const [range, setRange] = useState<[string, string]>(() => presetRange('thisWeek', today));
  const [copied, setCopied] = useState(false);
  const [from, to] = range;
  const valid = !!from && !!to && from <= to;

  const list = useMemo(() => (valid ? completedBetween(tasks, from, to) : []), [tasks, from, to, valid]);
  const xp = list.reduce((s, t) => s + (t.xp ?? 0), 0);
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of list) m.set(t.category, (m.get(t.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [list]);

  const pick = (p: Exclude<ReportPreset, 'custom'>) => {
    setPreset(p);
    setRange(presetRange(p, today));
  };
  const edit = (i: 0 | 1, v: string) => {
    setPreset('custom');
    setRange(i === 0 ? [v, to] : [from, v]);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportText(list, from, to));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한이 없으면 무시 */
    }
  };

  return (
    <Modal title="처리 내역" onClose={onClose}>
      <div className="report">
        <div className="chip-set">
          {REPORT_PRESETS.map((p) => (
            <button key={p.id} className="chip" aria-pressed={preset === p.id} onClick={() => pick(p.id)}>
              {p.label}
            </button>
          ))}
          <button className="chip" aria-pressed={preset === 'custom'} onClick={() => setPreset('custom')}>
            직접 지정
          </button>
        </div>
        <div className="report-range">
          <input className="input" type="date" aria-label="시작일" value={from} max={to || undefined} onChange={(e) => edit(0, e.target.value)} />
          <span className="muted">~</span>
          <input className="input" type="date" aria-label="종료일" value={to} min={from || undefined} onChange={(e) => edit(1, e.target.value)} />
        </div>
        {!valid && <div className="error">시작일이 종료일보다 늦어요</div>}

        <div className="report-stats">
          <div>
            <span className="tiny muted">완료</span>
            <b style={{ color: 'var(--green)' }}>{list.length}건</b>
          </div>
          <div>
            <span className="tiny muted">획득 XP</span>
            <b style={{ color: 'var(--yellow)' }}>+{xp}</b>
          </div>
        </div>
        {byCat.length > 0 && (
          <div className="report-cats">
            {byCat.map(([c, n]) => (
              <span key={c} style={{ color: CATEGORIES[c as keyof typeof CATEGORIES].color }}>
                {CATEGORIES[c as keyof typeof CATEGORIES].label} {n}
              </span>
            ))}
          </div>
        )}

        <div className="report-list">
          {list.length === 0 && <div className="empty">이 기간에 완료한 퀘스트가 없어요</div>}
          {groupByCompletedDay(list).map(([day, items]) => (
            <div key={day}>
              <div className="report-day">{dayLabel(day)}</div>
              {items.map((t) => (
                <button
                  key={t.id}
                  className="report-row"
                  onClick={() => {
                    onClose();
                    openForm({ task: t });
                  }}
                >
                  <span className="ok">✓</span>
                  <span className="title">
                    <span style={{ color: CATEGORIES[t.category].color }}>[{CATEGORIES[t.category].label}]</span> {t.title}
                  </span>
                  {t.xp > 0 && <span className="xp">+{t.xp} XP</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="report-foot">
          <button className="btn" onClick={copy} disabled={!list.length}>
            {copied ? '복사됨' : '텍스트로 복사'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
