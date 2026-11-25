create table if not exists public.evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  question_count integer not null check (question_count > 0),
  strategy_count integer not null check (strategy_count > 0),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.evaluation_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.evaluation_runs(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  difficulty text not null,
  subject text not null,
  topic text not null,
  strategy text not null,
  provider text not null,
  evaluation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists evaluation_runs_student_created_idx on public.evaluation_runs(student_id, created_at desc);
create index if not exists evaluation_results_run_idx on public.evaluation_results(run_id);
create index if not exists evaluation_results_student_idx on public.evaluation_results(student_id, created_at desc);

alter table public.evaluation_runs enable row level security;
alter table public.evaluation_results enable row level security;

drop policy if exists evaluation_runs_select_own on public.evaluation_runs;
create policy evaluation_runs_select_own on public.evaluation_runs for select to authenticated using ((select auth.uid()) = student_id);
drop policy if exists evaluation_results_select_own on public.evaluation_results;
create policy evaluation_results_select_own on public.evaluation_results for select to authenticated using ((select auth.uid()) = student_id);

alter table public.evaluation_runs replica identity full;
alter table public.evaluation_results replica identity full;
