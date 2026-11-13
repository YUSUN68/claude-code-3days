-- 퀘스트 중요도: 1=낮음, 2=보통(기본), 3=높음. XP는 앱에서 카테고리 기본값 × 중요도 배율로 계산해 저장
alter table public.sched_tasks
  add column if not exists priority smallint not null default 2 check (priority between 1 and 3);
