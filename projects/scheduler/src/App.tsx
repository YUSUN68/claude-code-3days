import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Hud } from './components/Hud';
import { QuestClear } from './components/QuestClear';
import { QuestFormHost } from './components/QuestForm';
import { usePipWidget, WidgetView } from './components/Widget';
import { desktop, isDesktop } from './lib/desktop';
import type { Category, Kind } from './lib/types';
import { useDesktopReminders } from './hooks/useDesktopReminders';
import { useSession } from './hooks/useSession';
import { TasksProvider, useTasks } from './hooks/useTasks';
import { ForgotPassword, Login, ResetPassword } from './pages/Auth';
import { CalendarPage } from './pages/CalendarPage';
import { Dashboard } from './pages/Dashboard';

/** ?task=<id> 또는 ?new=1&title=..로 들어오면 등록/수정 창을 연다 (알림 클릭, 윈도우 위젯에서 사용) */
function DeepLinks() {
  const [params, setParams] = useSearchParams();
  const { tasks, loading, openForm } = useTasks();
  useEffect(() => {
    if (loading) return;
    const taskId = params.get('task');
    const isNew = params.get('new');
    if (!taskId && !isNew) return;
    if (taskId) {
      const t = tasks.find((x) => x.id === taskId);
      if (t) openForm({ task: t });
    } else {
      openForm({
        initial: {
          title: params.get('title') ?? '',
          kind: (params.get('kind') as Kind) ?? 'quest',
          ...(params.get('category') ? { category: params.get('category') as Category } : {}),
        },
      });
    }
    setParams({}, { replace: true });
  }, [params, loading, tasks, openForm, setParams]);
  return null;
}

/** 윈도우 프로그램: 메인 프로세스가 보낸 화면 이동 요청 처리 */
function DesktopNavigation() {
  const nav = useNavigate();
  useEffect(() => desktop?.onNavigate((p) => nav(p)), [nav]);
  return null;
}

function Layout() {
  const pip = usePipWidget();
  useDesktopReminders(isDesktop);
  return (
    <div className="app stack">
      <Hud pip={pip} />
      <Outlet />
      <QuestFormHost target="main" />
      <QuestClear />
      <DeepLinks />
      {pip.portal}
    </div>
  );
}

/** 윈도우 위젯 창: 상세 입력이 필요하면 메인 창에서 연다 */
function DesktopWidget() {
  const { form, closeForm } = useTasks();
  useEffect(() => {
    document.body.classList.add('desktop-widget-body');
    return () => document.body.classList.remove('desktop-widget-body');
  }, []);
  useEffect(() => {
    if (!form || !desktop) return;
    const d = form.draft;
    if (d.task) desktop.openMain(`/?task=${d.task.id}`);
    else {
      const q = new URLSearchParams({ new: '1', title: d.initial?.title ?? '', kind: d.initial?.kind ?? 'quest' });
      if (d.initial?.category) q.set('category', d.initial.category);
      desktop.openMain(`/?${q}`);
    }
    closeForm();
  }, [form, closeForm]);
  return (
    <>
      <WidgetView mode="desktop" />
      <QuestClear />
    </>
  );
}

function Protected({ userId }: { userId: string | undefined }) {
  const loc = useLocation();
  if (!userId) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return (
    <TasksProvider userId={userId}>
      <Outlet />
    </TasksProvider>
  );
}

function SignedOutWidget() {
  return (
    <div className="widget">
      <div className="widget-head drag">
        <span>TODAY</span>
      </div>
      <div className="px-box">
        <p className="tiny">메인 창에서 로그인하면 오늘의 퀘스트가 여기에 나와요.</p>
        <button className="btn no-drag" onClick={() => desktop?.openMain('/login')}>
          로그인 창 열기
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { session, ready } = useSession();
  if (!ready) return <div className="auth-wrap muted">LOADING…</div>;
  const uid = session?.user.id;
  return (
    <BrowserRouter>
      <DesktopNavigation />
      <Routes>
        <Route path="/login" element={uid ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword hasSession={!!uid} ready={ready} />} />
        <Route path="/widget" element={uid ? <TasksProvider userId={uid}><DesktopWidget /></TasksProvider> : <SignedOutWidget />} />
        <Route element={<Protected userId={uid} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
