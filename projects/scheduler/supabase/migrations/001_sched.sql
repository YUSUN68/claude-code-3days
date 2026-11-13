-- 퀘스트 스케줄러 스키마 (기존 테이블과 겹치지 않도록 sched_ 접두어 사용)

create table public.sched_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null default 'quest' check (kind in ('quest', 'appointment')),
  title text not null check (char_length(title) between 1 and 200),
  description text,
  category text not null default 'etc',
  location text,
  start_at timestamptz,
  due_at timestamptz,
  all_day boolean not null default false,
  status text not null default 'todo' check (status in ('todo', 'done')),
  deploy_stage smallint check (deploy_stage between 0 and 4),
  xp integer not null default 0 check (xp >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sched_tasks_category_chk check (
    (kind = 'quest' and category in ('meeting','trip','work','deploy','vacation','training','event','etc'))
    or (kind = 'appointment' and category in ('lunch','dinner','personal'))
  ),
  constraint sched_tasks_range_chk check (start_at is null or due_at is null or start_at <= due_at)
);
create index sched_tasks_user_due_idx on public.sched_tasks (user_id, due_at);

create table public.sched_task_images (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.sched_tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index sched_task_images_task_idx on public.sched_task_images (task_id);
create index sched_task_images_user_idx on public.sched_task_images (user_id);

create table public.sched_reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.sched_tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  offset_minutes integer check (offset_minutes in (10, 30, 60, 120)),
  remind_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index sched_reminders_task_idx on public.sched_reminders (task_id);
create index sched_reminders_user_idx on public.sched_reminders (user_id);
create index sched_reminders_due_idx on public.sched_reminders (remind_at) where sent_at is null;

create table public.sched_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index sched_push_subscriptions_user_idx on public.sched_push_subscriptions (user_id);

-- updated_at 자동 갱신
create or replace function public.sched_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger sched_tasks_updated_at before update on public.sched_tasks
  for each row execute function public.sched_set_updated_at();

-- '몇 분 전' 알림은 일정 시작(없으면 기한) 기준으로 remind_at 계산
create or replace function public.sched_reminder_compute()
returns trigger language plpgsql set search_path = '' as $$
declare base timestamptz;
begin
  if new.offset_minutes is not null then
    select coalesce(t.start_at, t.due_at) into base from public.sched_tasks t where t.id = new.task_id;
    new.remind_at := case when base is null then null else base - make_interval(mins => new.offset_minutes) end;
  end if;
  return new;
end;
$$;
create trigger sched_reminders_compute before insert or update on public.sched_reminders
  for each row execute function public.sched_reminder_compute();

create or replace function public.sched_task_time_changed()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.due_at is distinct from old.due_at or new.start_at is distinct from old.start_at then
    update public.sched_reminders
       set sent_at = null
     where task_id = new.id and offset_minutes is not null;
  end if;
  return new;
end;
$$;
create trigger sched_tasks_time_changed after update of due_at, start_at on public.sched_tasks
  for each row execute function public.sched_task_time_changed();

-- RLS
alter table public.sched_tasks enable row level security;
alter table public.sched_task_images enable row level security;
alter table public.sched_reminders enable row level security;
alter table public.sched_push_subscriptions enable row level security;

create policy "sched_tasks own rows" on public.sched_tasks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "sched_task_images own rows" on public.sched_task_images for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.sched_tasks t where t.id = task_id and t.user_id = (select auth.uid())));

create policy "sched_reminders own rows" on public.sched_reminders for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.sched_tasks t where t.id = task_id and t.user_id = (select auth.uid())));

create policy "sched_push_subscriptions own rows" on public.sched_push_subscriptions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 이미지 저장소 (비공개, 사용자 폴더 단위 접근)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sched-images', 'sched-images', false, 10485760, array['image/png','image/jpeg','image/gif','image/webp'])
on conflict (id) do nothing;

create policy "sched-images read own" on storage.objects for select to authenticated
  using (bucket_id = 'sched-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sched-images insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'sched-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sched-images delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'sched-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 메인 창과 위젯/다른 기기 동기화
alter publication supabase_realtime add table public.sched_tasks;
