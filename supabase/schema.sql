-- Worldroot — run in Supabase Dashboard → SQL Editor
-- Shares profiles table with other games (username login lookup)

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists public.worldroot_saves (
  user_id uuid primary key references auth.users on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.worldroot_leaderboard (
  user_id uuid primary key references auth.users on delete cascade,
  username text not null,
  total_level integer not null default 0,
  character_count integer not null default 0,
  updated_at timestamptz default now()
);

create index if not exists worldroot_leaderboard_total_level_idx
  on public.worldroot_leaderboard (total_level desc);

alter table public.profiles enable row level security;
alter table public.worldroot_saves enable row level security;
alter table public.worldroot_leaderboard enable row level security;

drop policy if exists "profiles_select_login" on public.profiles;
create policy "profiles_select_login"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "worldroot_saves_select_own" on public.worldroot_saves;
create policy "worldroot_saves_select_own"
  on public.worldroot_saves for select
  using (auth.uid() = user_id);

drop policy if exists "worldroot_saves_insert_own" on public.worldroot_saves;
create policy "worldroot_saves_insert_own"
  on public.worldroot_saves for insert
  with check (auth.uid() = user_id);

drop policy if exists "worldroot_saves_update_own" on public.worldroot_saves;
create policy "worldroot_saves_update_own"
  on public.worldroot_saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "leaderboard_select_all" on public.worldroot_leaderboard;
create policy "leaderboard_select_all"
  on public.worldroot_leaderboard for select
  using (true);

drop policy if exists "leaderboard_insert_own" on public.worldroot_leaderboard;
create policy "leaderboard_insert_own"
  on public.worldroot_leaderboard for insert
  with check (auth.uid() = user_id);

drop policy if exists "leaderboard_update_own" on public.worldroot_leaderboard;
create policy "leaderboard_update_own"
  on public.worldroot_leaderboard for update
  using (auth.uid() = user_id);

create or replace function public.handle_new_worldroot_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.worldroot_saves (user_id, save_data)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_worldroot on auth.users;
create trigger on_auth_user_created_worldroot
  after insert on auth.users
  for each row execute function public.handle_new_worldroot_user();
