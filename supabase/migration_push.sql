-- Push notifikace. Spusť v Supabase SQL editoru.
-- Tabulka push tokenů (jeden na uživatele = poslední zařízení).
create table if not exists public.push_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id)
);

alter table public.push_tokens enable row level security;

-- Každý spravuje jen svůj token.
drop policy if exists "own push token" on public.push_tokens;
create policy "own push token" on public.push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vrátí push tokeny OSTATNÍCH členů dané skupiny (kromě volajícího).
-- SECURITY DEFINER + kontrola členství: tokeny vidí jen člen skupiny.
create or replace function public.group_push_tokens(p_group_id uuid)
returns table(token text)
language sql
security definer
set search_path = public
as $$
  select pt.token
  from push_tokens pt
  join group_members gm on gm.user_id = pt.user_id
  where gm.group_id = p_group_id
    and pt.user_id <> auth.uid()
    and exists (
      select 1 from group_members me
      where me.group_id = p_group_id and me.user_id = auth.uid()
    );
$$;

grant execute on function public.group_push_tokens(uuid) to authenticated;
