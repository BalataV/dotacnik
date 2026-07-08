-- Kategorie výdajů. Spusť v Supabase SQL editoru.
-- Přidá sloupec category (klíč kategorie, výchozí 'ostatni').
alter table public.expenses
  add column if not exists category text not null default 'ostatni';
