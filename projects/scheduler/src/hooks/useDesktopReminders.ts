import { useEffect } from 'react';
import { desktop } from '../lib/desktop';
import { reminderText } from '../lib/reminderText';
import { supabase } from '../lib/supabase';

/**
 * 윈도우 프로그램에서는 웹 푸시 대신 직접 알림을 띄운다.
 * sent_at이 비어 있는 알림을 원자적으로 '발송 처리'한 쪽만 알림을 보여주므로
 * 서버(웹 푸시)와 겹쳐도 한 번만 울린다.
 */
export function useDesktopReminders(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !desktop) return;
    let stop = false;
    const tick = async () => {
      const now = new Date();
      const since = new Date(now.getTime() - 5 * 60_000).toISOString();
      const { data } = await supabase
        .from('sched_reminders')
        .update({ sent_at: now.toISOString() })
        .is('sent_at', null)
        .lte('remind_at', now.toISOString())
        .gte('remind_at', since)
        .select('id, offset_minutes, task:sched_tasks(id, title, status, kind, due_at, start_at, location)');
      if (stop || !data) return;
      for (const r of data as unknown as {
        offset_minutes: number | null;
        task: { id: string; title: string; status: string; kind: string; location: string | null } | null;
      }[]) {
        const t = r.task;
        if (!t || t.status === 'done') continue;
        const when = reminderText(r.offset_minutes);
        const n = new Notification(t.kind === 'appointment' ? `약속: ${t.title}` : `퀘스트: ${t.title}`, {
          body: [when, t.location && `@${t.location}`].filter(Boolean).join(' · '),
          icon: '/icon-192.png',
          tag: `sched-${t.id}`,
        });
        n.onclick = () => desktop!.openMain(`/?task=${t.id}`);
      }
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [enabled]);
}
