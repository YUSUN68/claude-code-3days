-- 알림에 '정시'(0분 전) 추가
alter table public.sched_reminders drop constraint if exists sched_reminders_offset_minutes_check;
alter table public.sched_reminders
  add constraint sched_reminders_offset_minutes_check check (offset_minutes in (0, 10, 30, 60, 120));
