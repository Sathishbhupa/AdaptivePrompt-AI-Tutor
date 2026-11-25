create table if not exists public.fact_checks (
  id uuid primary key default gen_random_uuid(),
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  overall_risk text not null check (overall_risk in ('low','medium','high')),
  confidence integer not null check (confidence between 0 and 100),
  claims jsonb not null default '[]'::jsonb,
  verification_needed jsonb not null default '[]'::jsonb,
  summary text not null,
  created_at timestamptz not null default now()
);
create index if not exists fact_checks_student_created_idx on public.fact_checks(student_id, created_at desc);
create index if not exists fact_checks_interaction_idx on public.fact_checks(interaction_id);
alter table public.fact_checks enable row level security;
drop policy if exists fact_checks_select_own on public.fact_checks;
create policy fact_checks_select_own on public.fact_checks for select to authenticated using ((select auth.uid()) = student_id);
