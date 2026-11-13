-- 웹 푸시 알림: 설정 보관, 발송 대상 확보 함수, 1분 주기 예약 작업
-- VAPID 키와 cron 시크릿 값은 저장소에 두지 않고 배포할 때 sched_private.config에 직접 넣는다:
--   insert into sched_private.config (key, value) values
--     ('vapid_public', '...'), ('vapid_private', '...'), ('vapid_subject', 'https://<project>.supabase.co'), ('cron_secret', '...');

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create schema if not exists sched_private;
revoke all on schema sched_private from public, anon, authenticated;

create table if not exists sched_private.config (
  key text primary key,
  value text not null
);
revoke all on sched_private.config from public, anon, authenticated;

-- 서버 전용: 발송할 알림을 원자적으로 '발송 처리'하고 돌려준다 (5분 넘게 지난 알림은 건너뜀)
create or replace function public.sched_claim_due_reminders()
returns table (reminder_id uuid, task_id uuid, user_id uuid, title text, kind text, location text, offset_minutes integer)
language sql security definer set search_path = '' as $$
  with due as (
    update public.sched_reminders r
       set sent_at = now()
     where r.sent_at is null
       and r.remind_at <= now()
       and r.remind_at > now() - interval '5 minutes'
    returning r.id, r.task_id, r.user_id, r.offset_minutes
  )
  select d.id, d.task_id, d.user_id, t.title, t.kind, t.location, d.offset_minutes
    from due d
    join public.sched_tasks t on t.id = d.task_id
   where t.status = 'todo';
$$;
revoke execute on function public.sched_claim_due_reminders() from public, anon, authenticated;
grant execute on function public.sched_claim_due_reminders() to service_role;

create or replace function public.sched_push_config()
returns jsonb language sql security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from sched_private.config;
$$;
revoke execute on function public.sched_push_config() from public, anon, authenticated;
grant execute on function public.sched_push_config() to service_role;

-- 1분마다 Edge Function 호출
select cron.schedule(
  'sched-send-reminders',
  '* * * * *',
  $job$
  select net.http_post(
    url := 'https://wkdhpcyuuhnpoqdzhefp.supabase.co/functions/v1/sched-send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select value from sched_private.config where key = 'cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $job$
);
