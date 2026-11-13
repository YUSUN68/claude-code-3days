import { AllQuests, AppointmentPanel, DeployPipeline, PeriodBoard, UrgentBoard } from '../components/Boards';
import { QuickAdd } from '../components/QuickAdd';
import { useTasks } from '../hooks/useTasks';

export function Dashboard() {
  const { error, loading } = useTasks();
  return (
    <div className="stack">
      <section className="px-box">
        <QuickAdd />
      </section>
      {error && <div className="px-box error">{error}</div>}
      {loading ? (
        <div className="px-box muted">퀘스트 목록을 불러오는 중…</div>
      ) : (
        <div className="grid-main">
          <div className="stack" style={{ gridColumn: '1 / -1' }}>
            <PeriodBoard />
          </div>
          <div className="stack">
            <DeployPipeline />
            <AllQuests />
          </div>
          <div className="stack">
            <UrgentBoard />
            <AppointmentPanel />
          </div>
        </div>
      )}
    </div>
  );
}
