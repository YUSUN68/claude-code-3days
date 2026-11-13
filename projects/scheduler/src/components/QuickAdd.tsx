import { useState, type FormEvent } from 'react';
import { useTasks } from '../hooks/useTasks';
import { parseQuickAdd } from '../lib/quickAdd';

export function QuickAdd({ target = 'main', compact = false }: { target?: 'main' | 'widget'; compact?: boolean }) {
  const { create, openForm } = useTasks();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = parseQuickAdd(text);
    if (!r) {
      setMsg({ ok: false, text: '퀘스트 이름을 입력하세요' });
      return;
    }
    if (r.mode === 'form') {
      openForm({ initial: { title: r.title, kind: 'quest' } }, target);
      setText('');
      setMsg(null);
      return;
    }
    setBusy(true);
    try {
      await create({ title: r.title, kind: 'quest', category: 'etc' });
      setText('');
      setMsg({ ok: true, text: `"${r.title}" 등록 (기타)` });
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg({ ok: false, text: '등록하지 못했어요. 다시 시도해 주세요.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="quick-add">
        <span className="prompt" aria-hidden="true">▶</span>
        <input
          className="input grow"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMsg(null);
          }}
          placeholder={compact ? '-빠른 등록 / 제목 입력' : '-회의록 정리   ← "-"로 시작하면 바로 등록'}
          aria-label="빠른 등록"
          disabled={busy}
        />
        <button className="btn primary" type="submit" disabled={busy}>
          {compact ? '+' : '등록'}
        </button>
      </div>
      {msg ? (
        <div className={msg.ok ? 'ok-text' : 'error'} style={{ marginTop: 6 }} role="status">
          {msg.text}
        </div>
      ) : (
        !compact && <div className="hint">"-"를 붙이면 기타 카테고리로 즉시 등록되고, 없으면 상세 입력 창이 열려요.</div>
      )}
    </form>
  );
}
