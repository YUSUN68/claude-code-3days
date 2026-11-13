import { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';

export function QuestClear() {
  const { celebration } = useTasks();
  const [shown, setShown] = useState<typeof celebration>(null);

  useEffect(() => {
    if (!celebration) return;
    setShown(celebration);
    const id = setTimeout(() => setShown(null), 1700);
    return () => clearTimeout(id);
  }, [celebration]);

  if (!shown) return null;
  return (
    <div className="toast-layer" aria-live="polite">
      <div className={`quest-clear${shown.level ? ' level' : ''}`} key={shown.key}>
        {shown.level ? `LEVEL UP! LV.${shown.level}` : 'QUEST CLEAR!'}
        <small>+{shown.xp} XP</small>
      </div>
    </div>
  );
}
