-- user_profiles: stores supplementary profile data for auth.users
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_login_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS even though BFF uses service role, for defense-in-depth
alter table public.user_profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Allow service role full access (via rls bypass) — no explicit policy needed
-- Auto-update updated_at on modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();
