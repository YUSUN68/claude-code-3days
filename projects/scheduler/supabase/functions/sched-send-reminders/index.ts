// 1분마다 pg_cron이 호출: 시간이 된 알림을 웹 푸시로 보낸다
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

interface Due {
  reminder_id: string;
  task_id: string;
  user_id: string;
  title: string;
  kind: string;
  location: string | null;
  offset_minutes: number | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function whenText(m: number | null) {
  if (m === 0) return '지금 시작이에요';
  if (m == null) return '알림 시간이에요';
  return m >= 60 ? `${m / 60}시간 후 시작` : `${m}분 후 시작`;
}

Deno.serve(async (req) => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: cfg, error: cfgErr } = await sb.rpc('sched_push_config');
  if (cfgErr || !cfg?.cron_secret) return json({ error: 'not configured' }, 500);
  if (req.headers.get('x-cron-secret') !== cfg.cron_secret) return json({ error: 'forbidden' }, 403);

  webpush.setVapidDetails(cfg.vapid_subject, cfg.vapid_public, cfg.vapid_private);

  const { data: due, error } = await sb.rpc('sched_claim_due_reminders');
  if (error) return json({ error: error.message }, 500);
  const list = (due ?? []) as Due[];
  if (!list.length) return json({ sent: 0 });

  const userIds = [...new Set(list.map((d) => d.user_id))];
  const { data: subs } = await sb.from('sched_push_subscriptions').select('id, user_id, endpoint, p256dh, auth').in('user_id', userIds);

  let sent = 0;
  let failed = 0;
  for (const d of list) {
    const payload = JSON.stringify({
      title: d.kind === 'appointment' ? `약속: ${d.title}` : `퀘스트: ${d.title}`,
      body: [whenText(d.offset_minutes), d.location && `@${d.location}`].filter(Boolean).join(' · '),
      tag: `sched-${d.task_id}`,
      url: `/?task=${d.task_id}`,
    });
    for (const s of (subs ?? []).filter((x) => x.user_id === d.user_id)) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 600 });
        sent++;
      } catch (e) {
        failed++;
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await sb.from('sched_push_subscriptions').delete().eq('id', s.id);
      }
    }
  }
  return json({ reminders: list.length, sent, failed });
});
