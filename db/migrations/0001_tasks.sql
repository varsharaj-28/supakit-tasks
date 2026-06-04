-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/fdmahmzuyvtbwukjjsjf/sql/new

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- Open policies (anyone can read/write). Tighten if you add auth.
create policy "tasks_select_all" on public.tasks for select using (true);
create policy "tasks_insert_all" on public.tasks for insert with check (true);
create policy "tasks_update_all" on public.tasks for update using (true) with check (true);
create policy "tasks_delete_all" on public.tasks for delete using (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();
