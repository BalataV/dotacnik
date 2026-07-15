# Analýza aplikace Dotačníček + návrhy na zlepšení

Stav k 2026-06-22. Hodnoceno podle best practices mobilních appek (UX, spolehlivost,
bezpečnost, výkon, připravenost do obchodů). Seřazeno podle priority.

Legenda: **P0** = vyřešit před vydáním · **P1** = brzy poté · **P2** = až bude čas.

---

## Co je dobře (ať to nezapadne)
- Výpočet dluhů je matematicky správný – v [logic.js](src/logic.js) se dělí přesně a
  zaokrouhluje se až výsledná bilance, takže dluhy „sedí" (žádné mizící koruny).
- Optimalizace vyrovnání (minimum převodů) je hezká nadstavba nad Splitwise základ.
- Konzistentní vizuální styl (neo-brutalismus), vtipný maskot, čeština všude.
- Bezpečnost dat na backendu: RLS politiky omezují přístup jen na členy skupiny.
- Deep linky + landing page + GDPR mazání účtu už hotové.

---

## P0 – před vydáním do obchodů

1. **Doplnit privacy policy** – v [docs/privacy.html](docs/privacy.html) a
   [Privacy.js](src/screens/Privacy.js) chybí adresa správce. Obchody to vyžadují.
2. **Zapnout „Confirm email"** v Supabase – jinak jdou zakládat účty na cizí e-maily.
3. **Store assety** – ikona (máš), screenshoty, popis, kategorie, věkové omezení,
   vyplnit **Data Safety** (Google) / **App Privacy** (Apple) dotazník.
4. **Indikátor načítání** – stav `busy` se nikde nezobrazuje jako spinner. Při
   pomalé síti to vypadá, že se appka „seká". Přidat globální overlay se spinnerem,
   když `state.busy` (řeší vnímaný výkon = jeden z nejdůležitějších UX faktorů).
5. **Právní riziko maskota** – parodie žijící osoby (viz [AGENTS.md](AGENTS.md)).
   Nechat posoudit advokátem, ať appku nestáhnou za impersonaci.

## P1 – brzy po vydání

6. **Pull-to-refresh** – na Přehledu a v detailu skupiny chybí stažení prstem dolů
   pro načtení. Teď se obnovuje jen při přepnutí na Přehled. Uživatelé to čekají.
7. **Realtime sync** – členové nevidí cizí změny živě, jen po ručním obnovení.
   Supabase Realtime subscription na `expenses`/`payments` by appku „oživila".
8. **Klávesnice překrývá pole** – formuláře (AddExpense, přihlášení) nemají
   `KeyboardAvoidingView`. Na malých telefonech klávesnice schová tlačítko.
9. **Bezpečné okraje** – používá se `SafeAreaView` z `react-native` (na Androidu
   nepokrývá výřezy/gesto lištu dobře). Přejít na `react-native-safe-area-context`.
10. **Nerovné dělení** – jde dělit jen rovným dílem. Reálně někdo platí za víc jídel.
    Přidat „rozdělit podle podílů / přesných částek" (klíčová Splitwise funkce).
11. **Přístupnost (a11y)** – tlačítka a ikony nemají `accessibilityLabel`/`role`.
    Čtečka obrazovky je nepřečte. Doplnit – zlepší to i hodnocení v obchodech.

## P2 – až bude čas

12. **Formátování částek** – velká čísla bez oddělovače („12345 Kč"). Použít
    `Number(x).toLocaleString('cs-CZ')` → „12 345 Kč".
13. **expo-image místo Image** – účtenky se načítají přes RN `Image` bez cache.
    `expo-image` dá cache, placeholder a plynulejší načítání fotek.
14. **Optimalizace načítání** – `fetchEverything` dělá dotaz na výdaje a platby pro
    každou skupinu zvlášť (N+1) a volá se po každé změně celé. Při více skupinách
    zbytečně pomalé – využívat cílený `reloadGroup` (už existuje) místo plného refetche.
15. **Unit testy pro `logic.js`** – `netFor`/`transfersFor` jsou čisté funkce, ideální
    na testy (rychlá pojistka proti rozbití výpočtu peněz). Stačí Jest.
16. **Offline chování** – bez sítě akce spadnou na toast. Aspoň cachovat poslední
    načtená data (read-only), ať appka po otevření hned něco ukáže.
17. **Datový model jmen** – výdaje ukládají členy jako text (jméno). Proto změna jména
    musí přepisovat historii (řeší to nová serverová funkce). Dlouhodobě čistší by bylo
    odkazovat členy přes stabilní ID, ne jméno. Velký refaktor – ne teď.
18. **TypeScript** – přechod z JS na TS by odhalil část chyb už při psaní (hodně
    stavů je řízeno textovými klíči). Velká, ale hodnotná investice do budoucna.
19. **Haptická odezva** – `expo-haptics` při zápisu výdaje / zacvakání platby umocní
    ten „hmatatelný" neo-brutalistický pocit.

---

## Rychlé výhry (malá práce, velký efekt)
- #4 spinner při `busy`, #6 pull-to-refresh, #12 formát částek, #8 klávesnice.
Tyhle čtyři zvednou pocit z appky nejvíc za nejmíň úsilí. Klidně je rovnou udělám.

## ✅ Hotovo 2026-06-22
P1: pull-to-refresh, realtime sync, KeyboardAvoidingView (AddExpense/Auth/CreateGroup),
react-native-safe-area-context, nerovné dělení (poměrově/podle cen), a11y (role/label).
P2: formát částek, expo-image (cache účtenek), N+1 → 2 dotazy + throttle, Jest testy
(`npm test`), offline cache (per-uid), expo-haptics. Spinner při načítání. Měny CZK/EUR/USD.
Odebrán přepínač „Zvuk Čau lidi".

## ✅ TypeScript (hotovo 2026-06-22)
Plná migrace celé `src/` na TS (strict). Doménové typy v `src/types.ts`, `npx tsc --noEmit`
prochází čistě (0 chyb), 18 Jest testů zelených, Metro bundle OK.

## ✅ Členové přes ID (hotovo 2026-06-22)
DB odkazuje na členy přes `group_members.id` (`payer_id`, `part_ids`, `from_id`, `to_id`).
Klient čte podle ID a překládá na aktuální jméno (`src/members.ts`), takže **přejmenování
už nepřepisuje historii** (`set_my_name` jen změní jméno člena). Migrace `migration_member_ids.sql`.
Otestováno: `tsc` 0 chyb, 28 Jest testů (vč. 10 nových pro překlad id↔jméno a scénář přejmenování),
Metro bundle OK. In-memory logika zůstala jménem-orientovaná → nulové riziko pro výpočty.
