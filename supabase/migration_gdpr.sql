-- ============================================================
-- GDPR: smazání účtu (právo na výmaz). Spusť v Supabase → SQL Editor → Run.
-- ============================================================

-- Aby šlo smazat uživatele i s vazbami, uvolníme cizí klíče (po smazání se nastaví NULL)
alter table public.expenses      drop constraint if exists expenses_created_by_fkey;
alter table public.expenses      add  constraint expenses_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.payments      drop constraint if exists payments_created_by_fkey;
alter table public.payments      add  constraint payments_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.groups        drop constraint if exists groups_created_by_fkey;
alter table public.groups        add  constraint groups_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.group_members drop constraint if exists group_members_user_id_fkey;
alter table public.group_members add  constraint group_members_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

-- Funkce, kterou appka zavolá při "Smazat účet"
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Neautorizováno'; end if;
  delete from public.groups where created_by = uid;      -- cascade smaže členy/výdaje/platby těchto skupin
  delete from public.group_members where user_id = uid;  -- členství v cizích skupinách
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;                 -- smaže i přihlašovací účet
end; $$;
