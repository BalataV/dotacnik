-- ============================================================
-- Měny u výdajů + nerovné dělení (poměrově / podle cen).
-- Spusť v Supabase → SQL Editor → New query → Run. Bezpečné: jen přidává sloupce.
-- ============================================================

-- Měna výdaje (CZK / EUR / USD). Starší výdaje zůstanou CZK.
alter table public.expenses add column if not exists currency text not null default 'CZK';

-- Částka na osobu, paralelně k poli parts. NULL = rovným dílem (dopočítá appka).
-- U "poměrově" a "podle cen" se sem uloží konkrétní částka každého účastníka.
alter table public.expenses add column if not exists shares numeric[];

-- Typ dělení: equal (rovným dílem) | ratio (poměrově) | exact (podle cen)
alter table public.expenses add column if not exists split_type text not null default 'equal';

-- Měna platby (vyrovnání) – ať sedí k měně dluhu.
alter table public.payments add column if not exists currency text not null default 'CZK';
