-- Project Health v0.12 Cloud Identity
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  primary_goal text not null default 'General health',
  consent_version text not null default '0.12',
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  app_version text not null default '0.12',
  device_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tester_id text,
  category text not null,
  message text not null,
  app_version text not null default '0.12',
  diagnostics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_state_user_id_idx on public.user_state(user_id);
create index if not exists beta_feedback_user_id_idx on public.beta_feedback(user_id);
create index if not exists beta_feedback_created_at_idx on public.beta_feedback(created_at desc);

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;
alter table public.beta_feedback enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_state to authenticated;
grant select, insert, update, delete on public.beta_feedback to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id)
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users delete own profile" on public.profiles;
create policy "Users delete own profile"
on public.profiles for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users read own state" on public.user_state;
create policy "Users read own state"
on public.user_state for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users insert own state" on public.user_state;
create policy "Users insert own state"
on public.user_state for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users update own state" on public.user_state;
create policy "Users update own state"
on public.user_state for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users delete own state" on public.user_state;
create policy "Users delete own state"
on public.user_state for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users read own feedback" on public.beta_feedback;
create policy "Users read own feedback"
on public.beta_feedback for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users insert own feedback" on public.beta_feedback;
create policy "Users insert own feedback"
on public.beta_feedback for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users delete own feedback" on public.beta_feedback;
create policy "Users delete own feedback"
on public.beta_feedback for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- Automatically create the public profile and initial cloud-state row.
create or replace function public.handle_new_project_health_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, primary_goal)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.raw_user_meta_data ->> 'primary_goal', 'General health')
  )
  on conflict (id) do nothing;

  insert into public.user_state (user_id, state, app_version)
  values (new.id, '{}'::jsonb, '0.12')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_project_health_user_created on auth.users;
create trigger on_project_health_user_created
after insert on auth.users
for each row execute procedure public.handle_new_project_health_user();
