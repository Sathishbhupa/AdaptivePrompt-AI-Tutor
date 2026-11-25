-- Chat mode uses separate sessions/history and the authenticated student's id.
alter table public.chat_sessions add column if not exists student_id uuid references auth.users(id) on delete cascade;
alter table public.chat_messages add column if not exists student_id uuid references auth.users(id) on delete cascade;

create index if not exists chat_sessions_student_updated_idx on public.chat_sessions(student_id, updated_at desc);
create index if not exists chat_messages_student_created_idx on public.chat_messages(student_id, created_at);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists chat_sessions_student_select on public.chat_sessions;
drop policy if exists chat_sessions_student_insert on public.chat_sessions;
drop policy if exists chat_sessions_student_update on public.chat_sessions;
drop policy if exists chat_sessions_student_delete on public.chat_sessions;
create policy chat_sessions_student_select on public.chat_sessions for select to authenticated using ((select auth.uid()) = student_id);
create policy chat_sessions_student_insert on public.chat_sessions for insert to authenticated with check ((select auth.uid()) = student_id);
create policy chat_sessions_student_update on public.chat_sessions for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
create policy chat_sessions_student_delete on public.chat_sessions for delete to authenticated using ((select auth.uid()) = student_id);

drop policy if exists chat_messages_student_select on public.chat_messages;
drop policy if exists chat_messages_student_insert on public.chat_messages;
drop policy if exists chat_messages_student_update on public.chat_messages;
drop policy if exists chat_messages_student_delete on public.chat_messages;
create policy chat_messages_student_select on public.chat_messages for select to authenticated using ((select auth.uid()) = student_id);
create policy chat_messages_student_insert on public.chat_messages for insert to authenticated with check ((select auth.uid()) = student_id);
create policy chat_messages_student_update on public.chat_messages for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
create policy chat_messages_student_delete on public.chat_messages for delete to authenticated using ((select auth.uid()) = student_id);
