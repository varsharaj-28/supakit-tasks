-- Run this in Supabase SQL editor AFTER 0001_tasks.sql.
-- Adds: per-user task ownership, task lifecycle, RBAC, notifications.

-- ============ 1. user_id + lifecycle on tasks ============
do $$ begin
  create type public.task_status as enum
    ('draft','todo','in_progress','review','completed','archived');
exception when duplicate_object then null; end $$;

alter table public.tasks
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists status public.task_status not null default 'todo';

create index if not exists tasks_user_id_idx on public.tasks(user_id);

-- Tighten RLS: each user sees only their own tasks
drop policy if exists "tasks_select_all" on public.tasks;
drop policy if exists "tasks_insert_all" on public.tasks;
drop policy if exists "tasks_update_all" on public.tasks;
drop policy if exists "tasks_delete_all" on public.tasks;

create policy "tasks_select_own" on public.tasks for select to authenticated using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (auth.uid() = user_id);

-- Revoke anon access (was open in 0001)
revoke select, insert, update, delete on public.tasks from anon;

-- Lifecycle transition validation
create or replace function public.validate_task_transition()
returns trigger language plpgsql as $$
declare valid boolean := false;
begin
  if tg_op = 'INSERT' then return new; end if;
  if old.status = new.status then return new; end if;
  valid := case old.status
    when 'draft'       then new.status in ('todo','archived')
    when 'todo'        then new.status in ('in_progress','archived')
    when 'in_progress' then new.status in ('review','todo','archived')
    when 'review'      then new.status in ('completed','in_progress','archived')
    when 'completed'   then new.status in ('archived','todo')
    when 'archived'    then new.status in ('todo')
    else false end;
  if not valid then raise exception 'Invalid status transition: % -> %', old.status, new.status; end if;
  new.completed := (new.status = 'completed');
  return new;
end $$;

drop trigger if exists tasks_validate_transition on public.tasks;
create trigger tasks_validate_transition before update on public.tasks
  for each row execute function public.validate_task_transition();

-- ============ 2. RBAC ============
do $$ begin
  create type public.app_role as enum ('admin','moderator','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "roles_select_own" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ============ 3. Notifications ============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;

alter table public.notifications enable row level security;

create policy "notifs_select_own" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notifs_update_own" on public.notifications for update to authenticated using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.notifications;

-- Auto-notify on task status change
create or replace function public.notify_task_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications(user_id, task_id, message)
    values (new.user_id, new.id, 'Task created: ' || new.title);
  elsif old.status is distinct from new.status then
    insert into public.notifications(user_id, task_id, message)
    values (new.user_id, new.id, 'Task "' || new.title || '" → ' || new.status);
  end if;
  return new;
end $$;

drop trigger if exists tasks_notify on public.tasks;
create trigger tasks_notify after insert or update on public.tasks
  for each row execute function public.notify_task_change();

-- ============ 4. Default role on signup ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles(user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
