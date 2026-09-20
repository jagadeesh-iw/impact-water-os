create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'Employee' check (role in ('Admin','Founder','Manager','Employee')),
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  start_date date,
  due_date date,
  status text not null default 'Planning' check (status in ('Planning','Active','On Hold','Completed','Cancelled')),
  priority text not null default 'Medium' check (priority in ('Urgent','High','Medium','Low')),
  category text not null default 'Other',
  goals text,
  notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  project_id uuid references public.projects(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  status text not null default 'To Do' check (status in ('To Do','In Progress','Waiting','Blocked','Done','Cancelled')),
  priority text not null default 'Medium' check (priority in ('Urgent','High','Medium','Low')),
  due_date date,
  start_date date,
  assignee_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, body text not null, created_at timestamptz default now()
);

create table if not exists public.task_activity (
  id uuid primary key default gen_random_uuid(), task_id uuid references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, event_type text not null, message text not null, created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), title text not null, body text not null,
  pinned boolean not null default false, tags text[] default '{}', created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_due on public.tasks(due_date);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_notes_updated on public.notes(updated_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists projects_touch on public.projects; create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
drop trigger if exists tasks_touch on public.tasks; create trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();
drop trigger if exists notes_touch on public.notes; create trigger notes_touch before update on public.notes for each row execute function public.touch_updated_at();

create or replace function public.log_task_activity() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' then insert into public.task_activity(task_id,project_id,user_id,event_type,message) values(new.id,new.project_id,auth.uid(),'task.created','Task created');
  elsif tg_op='UPDATE' and old.status is distinct from new.status then insert into public.task_activity(task_id,project_id,user_id,event_type,message) values(new.id,new.project_id,auth.uid(),'task.status_changed','Task status changed from '||old.status||' to '||new.status);
  elsif tg_op='UPDATE' then insert into public.task_activity(task_id,project_id,user_id,event_type,message) values(new.id,new.project_id,auth.uid(),'task.updated','Task updated');
  elsif tg_op='DELETE' then insert into public.task_activity(task_id,project_id,user_id,event_type,message) values(old.id,old.project_id,auth.uid(),'task.deleted','Task deleted'); end if;
  return coalesce(new,old);
end; $$;

drop trigger if exists tasks_activity on public.tasks; create trigger tasks_activity after insert or update or delete on public.tasks for each row execute function public.log_task_activity();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security; alter table public.projects enable row level security; alter table public.tasks enable row level security; alter table public.task_comments enable row level security; alter table public.task_activity enable row level security; alter table public.notes enable row level security;

-- V1 is single-workspace: authenticated users can access workspace records. Add role/workspace policies before inviting additional employees.
create policy "authenticated profiles" on public.profiles for all to authenticated using (true) with check (true);
create policy "authenticated projects" on public.projects for all to authenticated using (true) with check (true);
create policy "authenticated tasks" on public.tasks for all to authenticated using (true) with check (true);
create policy "authenticated task comments" on public.task_comments for all to authenticated using (true) with check (true);
create policy "authenticated task activity" on public.task_activity for all to authenticated using (true) with check (true);
create policy "authenticated notes" on public.notes for all to authenticated using (true) with check (true);
