# Čapí Dluh – kontext aplikace

Splitwise-style appka na dělení útrat ve skupinách, s vtipným maskotem (parodie politika-podnikatele).
Dříve „Babišovník", přejmenováno na **„Čapí Dluh"** kvůli právnímu riziku (viz níže).

## Stack & spuštění
- **Expo SDK 54** (React Native 0.81, React 19.1), JS (ne TypeScript). NE SDK 56 – Expo Go ho neumí.
- Při psaní kódu vycházej z docs pro SDK 54: https://docs.expo.dev/versions/v54.0.0/
- Spuštění na telefonu: `npm start` → QR v Expo Go. Web náhled: `npm run web` (port 8088).
- Display font **Baloo 2** (NE Fredoka – ta nemá české Č/ř/ě/ů), body font **Nunito**.

## Struktura
- `App.js` – načte fonty, obalí `AppProvider` + `Root`.
- `src/Root.js` – hlavička s maskotem + bublinou, přepínání obrazovek (state machine přes `state.screen`), spodní navigace, overlay (mince, toast).
- `src/store.js` – globální stav (React Context). Dva režimy: **CLOUD_MODE** (Supabase) vs lokální (AsyncStorage). Async akce mají cloud větev i lokální fallback. `stateRef` pro async čtení.
- `src/logic.js` – výpočet bilancí (`netFor`), optimalizace vyrovnání (`transfersFor`, hladový algoritmus), `bubbleFor` (náhodná hláška).
- `src/quips.js` – pool ~50 hlášek maskota (jména zkomolená: Bareš, Pimpula, Agrofarm).
- `src/data.js` – prázdná výchozí data + barvy členů.
- `src/theme.js` – barvy (témata zluta/modra) + názvy fontů.
- `src/components/ui.js` – `Pushable` (tlačítko s tvrdým stínem), `Avatar`, `Label`, `useColors`. **Gotcha:** `Pushable offset={0}` nekreslí stín (jinak prosvítá pod průhledným tlačítkem).
- `src/components/Mascot.js` – maskot (karikatura), `Overlays.js` (mince/toast), `Field.js` (input).
- `src/screens/` – AuthScreens (Onboarding/Login/Register), Overview, CreateGroup, ShareGroup, GroupDetail, AddExpense, ExpenseDetail, Settle, Profile.
- `src/supabase.js` – klient (klíče z `app.json` → extra). `src/api/{auth,groups,expenses,storage}.js` – datová vrstva.

## Datový model (Supabase)
- `profiles`, `groups`, `group_members`, `expenses` (payer, parts[] – jména; photo = URL), `payments` (vyrovnání).
- Schéma: `supabase/schema.sql`. GDPR mazání účtu: `supabase/migration_gdpr.sql` (RPC `delete_my_account`).
- **Identita:** v DB se ukládají reálná jména; v appce se člen s `user_id == moje uid` mapuje na „Já" (denorm/norm ve store). Logika v `logic.js` je „Já"-based.
- Platby snižují dluh ve `netFor` → zaplacený dluh zmizí (Splitwise styl). Foto účtenky: bucket `receipts` (public).
- RLS: přístup jen členům skupiny (funkce `is_group_member`). Připojení přes kód: RPC `join_group_by_code`.

## Klíčové konvence
- Neo-brutalistické UI: silné okraje 3px (`c.ink`), tvrdý posunutý stín, kulaté rohy, font Baloo 2.
- Texty/komentáře česky. Uživatel je začátečník – vysvětlovat jednoduše, návody krok za krokem.
- Úvodní bublina „Čau lidi!" se NEMĚNÍ. Ostatní obrazovky losují hlášku z `quips.js`.

## Stav (k 2026-06)
- Hotovo a ověřeno proti živé DB: registrace/login e-mailem, auto-login, skupiny, výdaje, výpočty, platby, mazání účtu, náhodné hlášky, prázdný start.
- Backend Supabase projekt `fbhwsrclexkhpbfiwprw`, klíče v `app.json`.
- **Google OAuth:** kód hotový, ale v Expo Go nespolehlivý (deep-link redirect → padá na localhost). Funguje až v sestavené appce se scheme `capidluh`. Supabase Redirect URLs: `capidluh://**`, `exp://**`.
- **GDPR:** `PRIVACY.md` (šablona) + hostovaná verze `docs/privacy.html`. V Profilu odkaz (`PRIVACY_URL` z `src/config.js`) + „Smazat účet". Před vydáním: Confirm email zapnout, Data Safety/Privacy labels formuláře, doplnit adresu do privacy.
- **Landing page:** `docs/` (GitHub Pages) – `index.html` (úvod + pozvánka přes `?g=KÓD` → deep link `capidluh://join/KÓD`), `privacy.html`. URL je v `src/config.js` (`LANDING_BASE`). Sdílecí odkaz z appky míří sem. Návod k nasazení + EAS buildu: `NASAZENI.md`.
- **Build:** `eas.json` hotový (profil `preview` = Android APK, `production` = app-bundle). `app.json` má `android.package`/`ios.bundleIdentifier` = `com.balata.capidluh`. `eas build:configure` doplní `projectId`.

## Právní (důležité)
- Appka paroduje žijící veřejnou osobu (maskot + hlášky). Přejmenování na „Čapí Dluh" sneslo příjmení z názvu, ale maskot + poznatelné hlášky stále nesou riziko (ochrana osobnosti §81+ obč. zák., stažení z obchodů za impersonaci). Před veřejným vydáním nechat schválit advokátem.

## Zbývá
Nasadit landing page na GitHub Pages + spustit EAS build (viz `NASAZENI.md`, čeká na uživatele). Instant realtime sync, dokončit Google v buildu, vydání do obchodů. Úprava výdaje (změna částky/plátce) – plánováno, zatím neuděláno.
