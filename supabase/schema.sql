-- =========================================================
-- VibeCoder (Forge) - Platform Database Schema
-- Run this in Supabase SQL Editor
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  username text unique not null,
  subdomain text unique not null,
  app_credits integer default 1 not null check (app_credits >= 0),
  ai_credits integer default 50000 not null check (ai_credits >= 0),
  is_pro boolean default false not null,
  pro_until timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. CHAT SESSIONS
create table if not exists public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  app_slug text,
  status text default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tool_calls jsonb default '[]'::jsonb,
  todo_list jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

-- 4. APPS
create table if not exists public.apps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.chat_sessions(id) on delete set null,
  name text not null,
  slug text not null,
  status text default 'draft' not null check (status in ('draft', 'deploying', 'published', 'failed')),
  vercel_id text,
  vercel_url text,
  custom_domain text,
  domain_status text,
  files jsonb default '{}'::jsonb not null,
  db_schema_name text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. CREDIT TRANSACTIONS (Audit Trail)
create table if not exists public.credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('app_credit', 'ai_credit')),
  amount integer not null,
  reason text not null,
  balance_after integer not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- 6. PAYMENTS (Midtrans Transactions)
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id text unique not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  item_type text not null check (item_type in ('app_credit_bundle', 'ai_credit_topup', 'pro_subscription')),
  status text default 'pending' not null check (status in ('pending', 'settlement', 'expire', 'cancel', 'failed')),
  snap_token text,
  snap_redirect_url text,
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS Policies Setup
alter table public.profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.apps enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.payments enable row level security;

-- Basic user access policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own sessions" on public.chat_sessions for all using (auth.uid() = user_id);
create policy "Users can view own messages" on public.chat_messages for all 
  using (exists (select 1 from public.chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid()));
create policy "Users can view own apps" on public.apps for all using (auth.uid() = user_id);
create policy "Users can view own transactions" on public.credit_transactions for select using (auth.uid() = user_id);
create policy "Users can view own payments" on public.payments for select using (auth.uid() = user_id);
