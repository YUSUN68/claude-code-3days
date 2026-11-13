import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function PasswordForm({ onDone, submitLabel = '비밀번호 변경' }: { onDone(): void; submitLabel?: string }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError('비밀번호는 8자 이상이어야 해요');
    if (pw !== pw2) return setError('두 비밀번호가 서로 달라요');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setError(error.message.includes('different') ? '이전과 다른 비밀번호를 입력하세요' : '변경하지 못했어요. 링크가 만료됐다면 재설정 메일을 다시 요청하세요.');
      return;
    }
    onDone();
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field">
        새 비밀번호 (8자 이상)
        <input className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setError(null); }} />
      </label>
      <label className="field">
        새 비밀번호 확인
        <input className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => { setPw2(e.target.value); setError(null); }} />
      </label>
      {error && <div className="error" role="alert">{error}</div>}
      <button className="btn primary" type="submit" disabled={busy}>
        {busy ? '변경 중…' : submitLabel}
      </button>
    </form>
  );
}
