-- Auth + database fixes. Safe to run more than once. Run AFTER the five earlier migrations.

-- 1) Signup must never fail because the profile insert failed
--    ("Database error saving new user"). Also lock the function down.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Learner')
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 2) Users who signed up before the trigger existed have no profile row,
--    which breaks the dashboard and the practice counters.
insert into public.profiles (id, name)
select u.id, coalesce(u.raw_user_meta_data ->> 'display_name', u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', 'Learner')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Explicit grants. Newer Supabase projects no longer expose new tables to the
--    API roles automatically, which shows up as "permission denied for table ...".
grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.profiles to authenticated;
grant select on public.interactions, public.fact_checks, public.evaluation_runs, public.evaluation_results to authenticated;
grant select, insert, update, delete on public.chat_sessions, public.chat_messages to authenticated;
grant select, insert, update on public.practice_attempts to authenticated;
grant all on public.profiles, public.interactions, public.chat_sessions, public.chat_messages,
             public.practice_attempts, public.fact_checks, public.evaluation_runs, public.evaluation_results
  to service_role;
