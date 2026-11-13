import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PixelIcon } from '../components/PixelIcon';
import { PasswordForm } from '../components/PasswordForm';

/** 비밀번호 재설정 메일 링크가 돌아올 주소. 윈도우 프로그램은 웹 주소를 쓴다 */
const RESET_URL = (import.meta.env.VITE_WEB_URL as string | undefined) ?? location.origin;

function AuthShell({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="auth-wrap">
      <div className="auth px-box">
        <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
          <PixelIcon name="work" size={40} />
          <PixelIcon name="deploy" size={40} />
          <PixelIcon name="training" size={40} />
        </div>
        <div className="logo-big">QUEST<br />SCHEDULER</div>
        {sub && <div className="press">{sub}</div>}
        {children}
      </div>
    </div>
  );
}

function authError(msg: string) {
  if (/Invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 맞지 않아요';
  if (/Email not confirmed/i.test(msg)) return '메일함에서 가입 확인 링크를 먼저 눌러 주세요';
  if (/already registered/i.test(msg)) return '이미 가입된 이메일이에요. 로그인해 주세요.';
  if (/rate limit/i.test(msg)) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.';
  if (/Password should be/i.test(msg)) return '비밀번호는 8자 이상으로 정해 주세요';
  return '처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';
  const mismatch = signup && pw2.length > 0 && pw !== pw2;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (signup && !name.trim()) return setError('이름을 입력하세요');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('이메일 주소를 확인해 주세요');
    if (!pw) return setError('비밀번호를 입력하세요');
    if (signup && pw.length < 8) return setError('비밀번호는 8자 이상으로 정해 주세요');
    if (signup && pw !== pw2) return setError('비밀번호와 비밀번호 확인이 서로 달라요');
    setBusy(true);
    if (!signup) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setError(authError(error.message));
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: { emailRedirectTo: RESET_URL, data: { name: name.trim() } },
      });
      if (error) setError(authError(error.message));
      else if (!data.session) setInfo('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인하세요.');
    }
    setBusy(false);
  };

  const switchMode = () => {
    setMode(signup ? 'login' : 'signup');
    setPw2('');
    setError(null);
    setInfo(null);
  };

  return (
    <AuthShell sub={signup ? 'NEW PLAYER' : 'PRESS START'}>
      <form onSubmit={submit}>
        {signup && (
          <label className="field">
            이름
            <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="홍길동" />
          </label>
        )}
        <label className="field">
          이메일
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
        </label>
        <label className="field">
          비밀번호
          <input className="input" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={pw} onChange={(e) => setPw(e.target.value)} />
          {signup && <span className={pw.length > 0 && pw.length < 8 ? 'error' : 'tiny muted'}>8자 이상 입력하세요</span>}
        </label>
        {signup && (
          <label className="field">
            비밀번호 확인
            <input className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} aria-invalid={mismatch} />
            {mismatch && <span className="error">비밀번호가 서로 달라요</span>}
          </label>
        )}
        {error && <div className="error" role="alert">{error}</div>}
        {info && <div className="ok-text" role="status">{info}</div>}
        <button className="btn primary" type="submit" disabled={busy} style={{ justifyContent: 'center' }}>
          {busy ? '…' : signup ? '회원가입' : '로그인'}
        </button>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="link" onClick={switchMode}>
            {signup ? '이미 계정이 있어요' : '처음이세요? 회원가입'}
          </button>
          <Link className="link" to="/forgot">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('이메일 주소를 확인해 주세요');
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${RESET_URL}/reset-password` });
    setBusy(false);
    if (error && /rate limit/i.test(error.message)) return setError('요청이 너무 많아요. 잠시 후 다시 시도해 주세요.');
    setSent(true); // 가입 여부와 관계없이 같은 안내
  };

  return (
    <AuthShell sub="LOST PASSWORD">
      {sent ? (
        <div className="form-grid" style={{ marginTop: 18, textAlign: 'left' }}>
          <div className="ok-text">가입된 이메일이라면 재설정 링크를 보냈어요. 메일함(스팸함 포함)을 확인하세요.</div>
          <Link className="btn" to="/login">로그인으로 돌아가기</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label className="field">
            가입한 이메일
            <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="name@company.com" />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn primary" type="submit" disabled={busy} style={{ justifyContent: 'center' }}>
            재설정 메일 보내기
          </button>
          <Link className="link" to="/login">로그인으로 돌아가기</Link>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPassword({ hasSession, ready }: { hasSession: boolean; ready: boolean }) {
  const nav = useNavigate();
  const [done, setDone] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.hash.slice(1) || location.search);
    const desc = params.get('error_description');
    if (desc) setLinkError('링크가 만료됐거나 이미 사용됐어요. 재설정 메일을 다시 요청하세요.');
  }, []);

  return (
    <AuthShell sub="NEW PASSWORD">
      <div style={{ marginTop: 18, textAlign: 'left' }}>
        {done ? (
          <div className="form-grid">
            <div className="ok-text">비밀번호를 바꿨어요</div>
            <button className="btn primary" onClick={() => nav('/', { replace: true })}>대시보드로 가기</button>
          </div>
        ) : linkError || (ready && !hasSession) ? (
          <div className="form-grid">
            <div className="error">{linkError ?? '링크가 만료됐거나 올바르지 않아요. 재설정 메일을 다시 요청하세요.'}</div>
            <Link className="btn" to="/forgot">재설정 메일 다시 받기</Link>
          </div>
        ) : !ready ? (
          <div className="muted">링크 확인 중…</div>
        ) : (
          <PasswordForm onDone={() => setDone(true)} submitLabel="새 비밀번호 저장" />
        )}
      </div>
    </AuthShell>
  );
}
