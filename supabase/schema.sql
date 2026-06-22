-- ============================================================
-- Babišovník – databázové schéma pro Supabase
-- Vlož celý tento soubor do Supabase: SQL Editor → New query → Run
-- ============================================================

-- ---------- TABULKY ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'CZK',
  share_code text unique not null,
  created_by uuid references auth.users(id),
  archived boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  color text,
  user_id uuid references auth.users(id),
  role text not null default 'member',
  created_at timestamptz default now(),
  unique (group_id, name)
);
create unique index if not exists group_members_group_user_uniq
  on public.group_members(group_id, user_id) where user_id is not null;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  description text not null,
  amount numeric not null,
  payer text not null,
  parts text[] not null default '{}',
  photo text,                       -- veřejná URL fotky účtenky
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_name text not null,
  to_name text not null,
  amount numeric not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ---------- POMOCNÉ FUNKCE ----------

-- Jsem členem skupiny? (SECURITY DEFINER obejde RLS → žádná rekurze)
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- Připojení do skupiny pomocí sdíleného kódu (volá appka)
create or replace function public.join_group_by_code(code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare gid uuid; dname text;
begin
  select id into gid from public.groups where share_code = code and archived = false;
  if gid is null then raise exception 'Skupina nenalezena'; end if;
  select display_name into dname from public.profiles where id = auth.uid();
  if not exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid()) then
    insert into public.group_members(group_id, name, user_id, role)
    values (gid, coalesce(dname, 'Nový člen'), auth.uid(), 'member');
  end if;
  return gid;
end;
$$;

-- ---------- ZABEZPEČENÍ (Row Level Security) ----------

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;
alter table public.payments enable row level security;

-- PROFILY: čtení jmen je veřejné, upravit smím jen svůj
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- SKUPINY
create policy "groups_select_member" on public.groups for select
  using (public.is_group_member(id) or created_by = auth.uid());
create policy "groups_insert_own" on public.groups for insert with check (created_by = auth.uid());
create policy "groups_update_member" on public.groups for update using (public.is_group_member(id));

-- ČLENOVÉ
create policy "members_select" on public.group_members for select
  using (public.is_group_member(group_id) or user_id = auth.uid());
create policy "members_insert" on public.group_members for insert with check (
  exists (select 1 from public.groups g where g.id = group_id and g.created_by = auth.uid())
  or user_id = auth.uid()
);
create policy "members_delete" on public.group_members for delete using (public.is_group_member(group_id));

-- VÝDAJE
create policy "expenses_select" on public.expenses for select using (public.is_group_member(group_id));
create policy "expenses_insert" on public.expenses for insert with check (public.is_group_member(group_id));
create policy "expenses_update" on public.expenses for update using (public.is_group_member(group_id));
create policy "expenses_delete" on public.expenses for delete using (public.is_group_member(group_id));

-- PLATBY
create policy "payments_select" on public.payments for select using (public.is_group_member(group_id));
create policy "payments_insert" on public.payments for insert with check (public.is_group_member(group_id));
create policy "payments_delete" on public.payments for delete using (public.is_group_member(group_id));

-- ---------- ÚLOŽIŠTĚ FOTEK ----------
-- Bucket "receipts" vytvoř ručně v Supabase: Storage → New bucket → název "receipts" → zaškrtni PUBLIC.
-- Poté povol pouze NAHRÁVÁNÍ přihlášeným uživatelům.
-- (Čtení NEpotřebuje politiku – veřejný bucket servíruje fotky přes veřejnou URL.)
create policy "receipts_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts');
