-- ============================================================
-- Členové přes ID (group_members.id) místo jména.
-- Výdaje a platby nově odkazují na člena přes stabilní UUID; jméno je jen popisek,
-- který jde měnit bez přepisování historie. Spusť v Supabase → SQL Editor → Run.
-- Idempotentní (lze spustit opakovaně).
-- ============================================================

-- 1) Nové sloupce s odkazy na člena
alter table public.expenses add column if not exists payer_id uuid;
alter table public.expenses add column if not exists part_ids uuid[];
alter table public.payments add column if not exists from_id uuid;
alter table public.payments add column if not exists to_id  uuid;

-- 2) Doplnění (backfill) z dosavadních jmen (jména jsou v rámci skupiny unikátní)
update public.expenses e
  set payer_id = m.id
  from public.group_members m
  where m.group_id = e.group_id and m.name = e.payer and e.payer_id is null;

update public.expenses e
  set part_ids = sub.ids
  from (
    select e2.id as expense_id,
           array_agg(m.id order by ord) as ids
    from public.expenses e2
    cross join lateral unnest(e2.parts) with ordinality as p(name, ord)
    join public.group_members m on m.group_id = e2.group_id and m.name = p.name
    group by e2.id
  ) sub
  where sub.expense_id = e.id and e.part_ids is null;

update public.payments pay
  set from_id = m.id
  from public.group_members m
  where m.group_id = pay.group_id and m.name = pay.from_name and pay.from_id is null;

update public.payments pay
  set to_id = m.id
  from public.group_members m
  where m.group_id = pay.group_id and m.name = pay.to_name and pay.to_id is null;

-- 3) Zjednodušení změny jména: ID je stabilní, takže se historie NEPŘEPISUJE.
--    Stačí přejmenovat člena (a profil); výdaje/platby zůstanou napojené přes id.
create or replace function public.set_my_name(new_name text)
returns void language plpgsql security definer set search_path = public as $$
declare newn text := trim(new_name);
begin
  if newn = '' then raise exception 'Prázdné jméno'; end if;
  update public.profiles set display_name = newn where id = auth.uid();
  update public.group_members set name = newn where user_id = auth.uid();
end;
$$;
