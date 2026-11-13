import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../lib/categories';
import { dayLabel } from '../lib/dates';
import { desktop } from '../lib/desktop';
import { enablePush, pushState, type PushState } from '../lib/push';
import { supabase } from '../lib/supabase';
import { taskRange, todayQuests, upcomingEvents } from '../lib/today';
import { levelInfo, totalXp } from '../lib/xp';
import { useTasks } from '../hooks/useTasks';
import { Modal } from './Modal';
import { PasswordForm } from './PasswordForm';
import { PixelIcon } from './PixelIcon';

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL as string | undefined;

export function Hud({ pip }: { pip: { supported: boolean; open(): Promise<boolean>; isOpen: boolean } }) {
  const { tasks, today } = useTasks();
  const onCalendar = useLocation().pathname.startsWith('/calendar');
  const xp = totalXp(tasks);
  const lv = levelInfo(xp);
  const left = todayQuests(tasks, today).filter((t) => t.status === 'todo').length;
  const events = upcomingEvents(tasks, today, 7);
  const [menu, setMenu] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwDone, setPwDone] = useState(false);
  const [push, setPush] = useState<PushState>('unsupported');
  const [note, setNote] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ widgetOnTop: boolean; openAtLogin: boolean } | null>(null);

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    pushState().then(setPush);
    desktop?.getSettings().then(setSettings);
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  // 웹에서만: 윈도우 설치 파일이 있는지와 크기 확인
  // 배포판은 VITE_DOWNLOAD_URL(GitHub Releases)로 바로 받고, 로컬 개발 서버는 release 폴더에서 받는다
  const [installer, setInstaller] = useState<{ ok: boolean; mb: number } | null>(null);
  useEffect(() => {
    if (desktop || !menu || installer || DOWNLOAD_URL) return;
    fetch('/download/windows', { method: 'HEAD', cache: 'no-store' })
      .then((r) => setInstaller({ ok: r.ok, mb: Math.round(Number(r.headers.get('Content-Length') ?? 0) / 1024 / 1024) }))
      .catch(() => setInstaller({ ok: false, mb: 0 }));
  }, [menu, installer]);

  const onWidget = async () => {
    if (desktop) return desktop.toggleWidget();
    if (!pip.supported) {
      setNote('미니창은 Chrome 또는 Edge 최신 버전에서 열 수 있어요');
      return;
    }
    if (!(await pip.open())) setNote('이 브라우저에서는 미니창을 열 수 없어요. Chrome이나 Edge에서 열어 보세요.');
  };

  const onPush = async () => {
    const s = await enablePush();
    setPush(s);
    setNote(s === 'on' ? '알림을 켰어요. 탭을 닫아도 알림이 와요.' : s === 'denied' ? '브라우저에서 알림이 차단돼 있어요. 주소창 왼쪽 자물쇠에서 허용해 주세요.' : null);
  };

  const toggleSetting = async (key: 'widgetOnTop' | 'openAtLogin') => {
    if (!desktop || !settings) return;
    const v = !settings[key];
    await desktop.setSetting(key, v);
    setSettings({ ...settings, [key]: v });
  };

  return (
    <header className="px-box">
      <div className="hud">
        <div className="logo">
          <PixelIcon name="work" size={24} />
          QUEST
        </div>
        <div className="stat">
          <span className="lv">LV.{lv.level}</span>
          <span className="xpbar" role="progressbar" aria-valuenow={lv.current} aria-valuemax={lv.next} aria-label="경험치">
            <span style={{ width: `${(lv.current / lv.next) * 100}%` }} />
          </span>
          <span className="tiny muted">
            {lv.current}/{lv.next} XP
          </span>
        </div>
        <div className="stat">
          <span className="hearts" aria-hidden="true">♥</span>
          오늘 남은 퀘스트 <b style={{ color: 'var(--yellow)' }}>{left}</b>
        </div>
        <nav className="view-switch" aria-label="화면 전환" data-active={onCalendar ? 1 : 0}>
          <span className="switch-thumb" aria-hidden="true" />
          <NavLink to="/" end>
            <PixelIcon name="dashboard" size={16} />
            대시보드
          </NavLink>
          <NavLink to="/calendar">
            <PixelIcon name="calendar" size={16} />
            캘린더
          </NavLink>
        </nav>
        <button
          className="btn"
          onClick={onWidget}
          disabled={!desktop && pip.isOpen}
          title={!desktop && pip.isOpen ? '미니창을 닫으면 다시 띄울 수 있어요' : undefined}
        >
          <PixelIcon name="etc" size={16} />
          {desktop ? '위젯 켜기/끄기' : pip.isOpen ? '위젯 열림' : '위젯 띄우기'}
        </button>
        {!desktop && push === 'off' && (
          <button className="btn" onClick={onPush}>
            알림 켜기
          </button>
        )}
        <div className="menu-wrap">
          <button className="btn icon-btn" aria-expanded={menu} aria-haspopup="menu" aria-label="내 정보" title="내 정보" onClick={() => setMenu((v) => !v)}>
            <PixelIcon name="user" size={20} />
          </button>
          {menu && (
            <div className="menu px-box tight" onClick={() => setMenu(false)}>
              {email && (
                <div className="menu-account" onClick={(e) => e.stopPropagation()} title={email}>
                  <span className="tiny muted">로그인 계정</span>
                  <span className="menu-email">{email}</span>
                </div>
              )}
              {desktop && settings && (
                <>
                  <button className="btn" onClick={() => toggleSetting('widgetOnTop')}>
                    {settings.widgetOnTop ? '☑' : '☐'} 위젯 항상 위
                  </button>
                  <button className="btn" onClick={() => toggleSetting('openAtLogin')}>
                    {settings.openAtLogin ? '☑' : '☐'} 윈도우 시작 시 실행
                  </button>
                </>
              )}
              {!desktop &&
                (DOWNLOAD_URL ? (
                  <a className="btn" href={DOWNLOAD_URL}>
                    <PixelIcon name="dashboard" size={14} />
                    윈도우 프로그램 다운로드
                  </a>
                ) : installer?.ok ? (
                  <a className="btn" href="/download/windows" download>
                    <PixelIcon name="dashboard" size={14} />
                    윈도우 프로그램 다운로드 <span className="tiny muted">({installer.mb}MB)</span>
                  </a>
                ) : installer ? (
                  <span className="menu-note" onClick={(e) => e.stopPropagation()}>
                    윈도우 설치 파일이 아직 없어요
                  </span>
                ) : null)}
              <button className="btn" onClick={() => { setPwDone(false); setPwOpen(true); }}>
                비밀번호 변경
              </button>
              <button className="btn" onClick={() => supabase.auth.signOut()}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
      {(events.length > 0 || note) && (
        <div className="banner-strip">
          {events.map((t) => {
            const r = taskRange(t)!;
            return (
              <span key={t.id} className="banner" style={{ borderColor: CATEGORIES[t.category].color }}>
                <PixelIcon name={t.category} size={14} />
                {r[0] <= today ? '진행 중' : dayLabel(r[0])} · {t.title}
              </span>
            );
          })}
          {note && (
            <span className="banner" role="status">
              {note}
            </span>
          )}
        </div>
      )}
      {pwOpen && (
        <Modal title="비밀번호 변경" onClose={() => setPwOpen(false)}>
          {pwDone ? (
            <div className="form-grid">
              <div className="ok-text">비밀번호를 바꿨어요</div>
              <button className="btn primary" onClick={() => setPwOpen(false)}>닫기</button>
            </div>
          ) : (
            <PasswordForm onDone={() => setPwDone(true)} />
          )}
        </Modal>
      )}
    </header>
  );
}
