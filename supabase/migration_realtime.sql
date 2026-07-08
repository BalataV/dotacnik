-- ============================================================
-- Realtime: živé promítnutí změn výdajů a plateb ostatním členům skupiny.
-- Spusť v Supabase → SQL Editor → New query → Run. (Idempotentní – lze spustit opakovaně.)
-- RLS dál platí i pro realtime: každý dostane jen změny řádků, které smí vidět.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'expenses'
  ) then
    alter publication supabase_realtime add table public.expenses;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'payments'
  ) then
    alter publication supabase_realtime add table public.payments;
  end if;
end $$;
