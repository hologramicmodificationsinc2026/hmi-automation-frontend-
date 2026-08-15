-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workflows Table
create table if not exists public.workflows (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'Untitled Workflow',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Execution Logs Table
create table if not exists public.execution_logs (
  id uuid default uuid_generate_v4() primary key,
  workflow_id uuid references public.workflows(id) on delete cascade,
  status text not null check (status in ('pending', 'running', 'success', 'failed')),
  payload jsonb,
  execution_time_ms integer,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.workflows enable row level security;
alter table public.execution_logs enable row level security;

-- RLS Policies for Workflows
create policy "Users can manage their own workflows" 
  on public.workflows for all 
  using (auth.uid() = user_id);

-- RLS Policies for Logs
create policy "Users can view logs for their workflows" 
  on public.execution_logs for select 
  using (
    exists (
      select 1 from public.workflows 
      where workflows.id = execution_logs.workflow_id 
      and workflows.user_id = auth.uid()
    )
  );
