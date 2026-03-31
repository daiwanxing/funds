-- user_watchlist_items: stores per-user fund watchlist entries
create table if not exists public.user_watchlist_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fund_code text not null,
  num numeric not null default 0,
  cost numeric not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fund_code)
);

-- Enable RLS for defense-in-depth
alter table public.user_watchlist_items enable row level security;

-- Allow users to read their own watchlist items
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_watchlist_items'
      and policyname = 'Users can read own watchlist'
  ) then
    create policy "Users can read own watchlist"
      on public.user_watchlist_items for select
      using (auth.uid() = user_id);
  end if;
end
$$;

-- Auto-update updated_at on modification
drop trigger if exists set_user_watchlist_items_updated_at on public.user_watchlist_items;

create trigger set_user_watchlist_items_updated_at
  before update on public.user_watchlist_items
  for each row
  execute function public.handle_updated_at();
