alter table public.interactions add column if not exists xp_earned integer not null default 0;

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  question_index integer not null check (question_index between 0 and 1),
  answer text not null,
  is_correct boolean,
  feedback text,
  created_at timestamptz not null default now()
);

create index if not exists practice_attempts_student_created_idx on public.practice_attempts(student_id, created_at desc);
create index if not exists practice_attempts_interaction_idx on public.practice_attempts(interaction_id);

alter table public.practice_attempts enable row level security;
drop policy if exists practice_attempts_select_own on public.practice_attempts;
drop policy if exists practice_attempts_insert_own on public.practice_attempts;
drop policy if exists practice_attempts_update_own on public.practice_attempts;
create policy practice_attempts_select_own on public.practice_attempts for select to authenticated using ((select auth.uid()) = student_id);
create policy practice_attempts_insert_own on public.practice_attempts for insert to authenticated with check ((select auth.uid()) = student_id);
create policy practice_attempts_update_own on public.practice_attempts for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
