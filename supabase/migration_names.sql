-- ============================================================
-- Jména členů: náhled skupiny, připojení s výběrem jména, změna jména.
-- Spusť celé v Supabase → SQL Editor → New query → Run.
-- ============================================================

-- 1) NÁHLED SKUPINY PODLE KÓDU (bez připojení)
-- Vrátí jméno skupiny a její členy, ať si připojující vybere, kdo je.
-- claimed = true → roli už někdo obsadil; is_me = true → jsem to já.
create or replace function public.group_preview(code text)
returns table(group_id uuid, group_name text, member_name text, claimed boolean, is_me boolean)
language sql security definer set search_path = public as $$
  select g.id, g.name, m.name, (m.user_id is not null), (m.user_id = auth.uid())
  from public.groups g
  join public.group_members m on m.group_id = g.id
  where g.share_code = code and g.archived = false
  order by m.created_at;
$$;

-- 2) PŘIPOJENÍ S VÝBĚREM JMÉNA
--    - claim_name (volná role) → zaberu ji (nastavím si user_id)
--    - jinak vložím nového člena se jménem new_name
create or replace function public.join_group_choose(code text, claim_name text, new_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select id into gid from public.groups where share_code = code and archived = false;
  if gid is null then raise exception 'Skupina nenalezena'; end if;

  -- Už jsem členem? Vrať rovnou (nepřidávej duplicitu).
  if exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid()) then
    return gid;
  end if;

  if claim_name is not null and claim_name <> '' then
    update public.group_members
      set user_id = auth.uid()
      where group_id = gid and name = claim_name and user_id is null;
    if not found then raise exception 'Tohle jméno už někdo zabral'; end if;
  else
    insert into public.group_members(group_id, name, user_id, role)
      values (gid, coalesce(nullif(trim(new_name), ''), 'Nový člen'), auth.uid(), 'member');
  end if;
  return gid;
end;
$$;

-- 3) ZMĚNA MÉHO JMÉNA ve všech mých skupinách
--    Přepíše i jméno ve výdajích (payer/parts) a platbách (from/to), aby seděly historické záznamy.
create or replace function public.set_my_name(new_name text)
returns void language plpgsql security definer set search_path = public as $$
declare r record; oldn text; newn text := trim(new_name);
begin
  if newn = '' then raise exception 'Prázdné jméno'; end if;
  update public.profiles set display_name = newn where id = auth.uid();

  for r in select group_id, name from public.group_members where user_id = auth.uid() loop
    oldn := r.name;
    if oldn = newn then continue; end if;
    -- pozor: pokud už v té skupině někdo newn má, unikátní index to zastaví (vyhodí chybu)
    update public.group_members set name = newn where group_id = r.group_id and user_id = auth.uid();
    update public.expenses set payer = newn where group_id = r.group_id and payer = oldn;
    update public.expenses set parts = array_replace(parts, oldn, newn)
      where group_id = r.group_id and oldn = any(parts);
    update public.payments set from_name = newn where group_id = r.group_id and from_name = oldn;
    update public.payments set to_name   = newn where group_id = r.group_id and to_name   = oldn;
  end loop;
end;
$$;

-- Poznámka: funkce výše jsou SECURITY DEFINER (běží s právy vlastníka), takže
-- obejdou RLS a nepotřebují žádnou novou UPDATE politiku na group_members.
-- Volá je výhradně appka; běžný přístup členů dál hlídají politiky ze schema.sql.
