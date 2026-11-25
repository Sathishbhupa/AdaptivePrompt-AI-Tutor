-- AdaptivePrompt Tutor foundation schema.
-- Apply this migration before the feature migrations.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  current_level text not null default 'basic',
  practice_correct_count integer not null default 0,
  practice_total_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists current_level text not null default 'basic';
alter table public.profiles add column if not exists practice_correct_count integer not null default 0;
alter table public.profiles add column if not exists practice_total_count integer not null default 0;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'General',
  topic text not null default 'General learning',
  question text not null,
  difficulty text not null default 'beginner',
  strategy_name text,
  structured_answer jsonb not null default '{}'::jsonb,
  raw_answer text,
  evaluation jsonb not null default '{}'::jsonb,
  provider text,
  analysis jsonb not null default '{}'::jsonb,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.interactions add column if not exists subject text not null default 'General';
alter table public.interactions add column if not exists topic text not null default 'General learning';
alter table public.interactions add column if not exists question text not null default '';
alter table public.interactions add column if not exists difficulty text not null default 'beginner';
alter table public.interactions add column if not exists strategy_name text;
alter table public.interactions add column if not exists structured_answer jsonb not null default '{}'::jsonb;
alter table public.interactions add column if not exists raw_answer text;
alter table public.interactions add column if not exists evaluation jsonb not null default '{}'::jsonb;
alter table public.interactions add column if not exists provider text;
alter table public.interactions add column if not exists analysis jsonb not null default '{}'::jsonb;
alter table public.interactions add column if not exists xp_earned integer not null default 0;
alter table public.interactions add column if not exists created_at timestamptz not null default now();

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists interactions_student_created_idx on public.interactions(student_id, created_at desc);
create index if not exists interactions_student_topic_idx on public.interactions(student_id, topic);
create index if not exists chat_sessions_student_updated_idx on public.chat_sessions(student_id, updated_at desc);
create index if not exists chat_messages_session_created_idx on public.chat_messages(session_id, created_at);
create index if not exists chat_messages_student_created_idx on public.chat_messages(student_id, created_at);

alter table public.profiles enable row level security;
alter table public.interactions enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists interactions_select_own on public.interactions;
create policy interactions_select_own on public.interactions for select to authenticated using ((select auth.uid()) = student_id);

drop policy if exists chat_sessions_select_own on public.chat_sessions;
create policy chat_sessions_select_own on public.chat_sessions for select to authenticated using ((select auth.uid()) = student_id);
drop policy if exists chat_sessions_insert_own on public.chat_sessions;
create policy chat_sessions_insert_own on public.chat_sessions for insert to authenticated with check ((select auth.uid()) = student_id);
drop policy if exists chat_sessions_update_own on public.chat_sessions;
create policy chat_sessions_update_own on public.chat_sessions for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
drop policy if exists chat_sessions_delete_own on public.chat_sessions;
create policy chat_sessions_delete_own on public.chat_sessions for delete to authenticated using ((select auth.uid()) = student_id);

drop policy if exists chat_messages_select_own on public.chat_messages;
create policy chat_messages_select_own on public.chat_messages for select to authenticated using ((select auth.uid()) = student_id);
drop policy if exists chat_messages_insert_own on public.chat_messages;
create policy chat_messages_insert_own on public.chat_messages for insert to authenticated with check ((select auth.uid()) = student_id);
drop policy if exists chat_messages_update_own on public.chat_messages;
create policy chat_messages_update_own on public.chat_messages for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
drop policy if exists chat_messages_delete_own on public.chat_messages;
create policy chat_messages_delete_own on public.chat_messages for delete to authenticated using ((select auth.uid()) = student_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', 'Learner'))
  on conflict (id) do update set name = coalesce(excluded.name, public.profiles.name), updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable realtime for chat tables without failing if they are already published.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_sessions') then
    execute 'alter publication supabase_realtime add table public.chat_sessions';
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages') then
    execute 'alter publication supabase_realtime add table public.chat_messages';
  end if;
exception when undefined_object then
  null;
end $$;
