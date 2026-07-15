# Dotačníček – kontext aplikace

Splitwise-style appka na dělení útrat ve skupinách, s vtipným maskotem (parodie politika-podnikatele).
Dříve „Babišovník", přejmenováno na „Dotačník" kvůli právnímu riziku (viz níže) a pak
na **„Dotačníček"** (2026-07, doména dotacnik.cz byla zabraná).

## Stack & spuštění
- **Expo SDK 54** (React Native 0.81, React 19.1), **TypeScript** (strict). NE SDK 56 – Expo Go ho neumí.
- Typová kontrola: `npx tsc --noEmit` (musí projít čistě). Doménové typy v `src/types.ts` (AppState, Actions, Expense, Group, Payment, Transfer, …). `useApp()` vrací typovaný `{state, actions}`, takže obrazovky jsou kontrolované.
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
- `src/screens/` – AuthScreens (Onboarding/Login/Register), Overview, CreateGroup, ShareGroup, GroupDetail, AddExpense, ExpenseDetail, Settle, Profile, Privacy (in-app zásady).
- Spodní lišta: **Přehled · Rozpočet · Profil** (3 záložky, bez plovoucího +). „Rozpočet" = obrazovka Settle (souhrn dluhů napříč skupinami; dřív „Deficit"). Výdaj se přidává tlačítkem v GroupDetail.
- Systémové „zpět" (hw tlačítko i gesto) řeší `actions.goBack` přes `BackHandler` ve `store.js` (mapa screen→rodič; na overview/onboarding vrací false = zavře appku).
- `src/supabase.js` – klient (klíče z `app.json` → extra). `src/api/{auth,groups,expenses,storage}.js` – datová vrstva.

## Datový model (Supabase)
- `profiles`, `groups`, `group_members`, `expenses`, `payments` (vyrovnání).
- **Členové přes ID:** výdaje/platby odkazují na člena přes `group_members.id` (`expenses.payer_id`, `part_ids[]`; `payments.from_id`, `to_id`). Sloupce se jmény (`payer`, `parts[]`, `from_name`, `to_name`) zůstávají jen jako záloha. Klient čte podle ID a překládá na AKTUÁLNÍ jméno (`src/members.ts`: `dispMember`/`idForMember`), takže **přejmenování nepřepisuje historii** – `set_my_name` jen změní `group_members.name`. Migrace: `supabase/migration_member_ids.sql`. V rámci skupiny zůstává jméno unikátní (in-memory logika je jménem-orientovaná).
- Schéma: `supabase/schema.sql`. GDPR mazání účtu: `supabase/migration_gdpr.sql` (RPC `delete_my_account`).
- **Identita:** v DB se ukládají reálná jména; v appce se člen s `user_id == moje uid` mapuje na „Já" (denorm/norm ve store). Logika v `logic.js` je „Já"-based.
- Platby snižují dluh ve `netFor` → zaplacený dluh zmizí (Splitwise styl). Foto účtenky: bucket `receipts` (public).
- RLS: přístup jen členům skupiny (funkce `is_group_member`). Připojení přes kód: RPC `join_group_by_code`.

## Klíčové konvence
- Neo-brutalistické UI: silné okraje 3px (`c.ink`), tvrdý posunutý stín, kulaté rohy, font Baloo 2.
- Texty/komentáře česky. Uživatel je začátečník – vysvětlovat jednoduše, návody krok za krokem.
- Úvodní bublina „Čau lidi!" se NEMĚNÍ. Jinde se hláška losuje podle bilance uživatele (dlužím / mám dostat / vyrovnaný) – sady `QUIPS_OWE/OWED/EVEN` v `quips.ts`, výběr v `bubbleFor`. Klik na spodní navigaci na obrazovku, kde už jsem, hlášku NEMĚNÍ (`navigate` vrací `s` při stejné obrazovce).
- Maskot má dvě karikatury: výchozí (premiér) a `alt` (ministryně financí – blond mikádo, brýle, perly; jméno se v kódu nepoužívá). Hlášky s `alt:true` v `quips.ts` ji zobrazí; `isAltQuip(text)` + `<Mascot alt>` v hlavičce.

## Stav (k 2026-06)
- Hotovo a ověřeno proti živé DB: registrace/login e-mailem, auto-login, skupiny, výdaje, výpočty, platby, mazání účtu, náhodné hlášky, prázdný start.
- Backend Supabase projekt `fbhwsrclexkhpbfiwprw`, klíče v `app.json`.
- **Google OAuth:** kód hotový, ale v Expo Go nespolehlivý (deep-link redirect → padá na localhost). Funguje až v sestavené appce se scheme `dotacnicek`. Supabase Redirect URLs: `dotacnicek://**`, `exp://**`.
- **GDPR:** `PRIVACY.md` (šablona) + hostovaná verze `docs/privacy.html`. V Profilu odkaz (`PRIVACY_URL` z `src/config.js`) + „Smazat účet". Před vydáním: Confirm email zapnout, Data Safety/Privacy labels formuláře, doplnit adresu do privacy.
- **Landing page:** `docs/` (GitHub Pages) – `index.html` (úvod + pozvánka přes `?g=KÓD` → deep link `dotacnicek://join/KÓD`), `privacy.html`. URL je v `src/config.js` (`LANDING_BASE`). Sdílecí odkaz z appky míří sem. Návod k nasazení + EAS buildu: `NASAZENI.md`.
- **Build:** `eas.json` hotový (profil `preview` = Android APK, `production` = app-bundle). `app.json` má `android.package`/`ios.bundleIdentifier` = `com.balata.dotacnicek`. `eas build:configure` doplní `projectId`.

## Právní (důležité)
- Appka paroduje žijící veřejnou osobu (maskot + hlášky). Přejmenování na „Dotačníček" sneslo příjmení z názvu, ale maskot + poznatelné hlášky stále nesou riziko (ochrana osobnosti §81+ obč. zák., stažení z obchodů za impersonaci). Před veřejným vydáním nechat schválit advokátem.

## Zbývá
Dokončit Google v buildu, vydání do obchodů. Analýza: `ANALYZA.md`.
**Před cloud testem spusť v Supabase SQL editoru postupně: `migration_names.sql`, `migration_split_currency.sql`, `migration_realtime.sql`, `migration_member_ids.sql`, `migration_categories.sql`, `migration_push.sql`.**

## Rozšíření (2026-06, „velký balík")
- **Responzivní layout:** obsah + chrome v Root omezeny `MAX_W=600` (tablet vycentrovaný).
- **Velikost obsahu:** `src/textScale.ts` napíchne Text/TextInput a násobí fontSize podle `state.contentSize` (small/medium/large); strop pro systémové velké písmo. Volba v Profilu.
- **Tmavý režim:** téma `tmava` v `theme.ts` (tmavé pozadí/karty, světlé okraje=ink). Karty/text napříč appkou používají `c.card`/`c.ink`, takže se obrátí samy. Status bar přes `isDarkColor` v Root.
- **Kategorie:** `src/categories.ts` (číselník), `expenses.category` (migrace `migration_categories.sql`). Výběr v AddExpense, ikona v seznamu/detailu, rozpad v Auditu.
- **Statistiky / Audit NKÚ / žebříček:** `src/stats.ts` + obrazovka `Audit.tsx` (screen `audit`). Parodický kontrolní závěr, struktura výdajů, žebříček „Sponzor večera".
- **Historie aktivit:** `src/activity.ts` (odvozeno z času výdajů+plateb, BEZ DB) + `Activity.tsx` (screen `activity`).
- **Dotační smlouva:** `Smlouva.tsx` (screen `smlouva`), parodická listina dluhu + sdílení textu. Otevírá se z Deficitu (`openContract`).
- **Reakce maskota:** `Mascot.tsx` má `mood` (neutral/happy/sad); `state.mascotMood` + `flashMood` ve store (happy při platbě, sad při novém dluhu).
- **Živý kurz měn:** `src/fx.ts` (open.er-api.com, cache 12 h), `state.fxRates`, orientační „≈ Kč" v Přehledu a Auditu.
- **Push notifikace:** `src/notifications.ts` (registrace + odeslání přes Expo push API, peer-to-peer), `api/push.ts` + `migration_push.sql` (tabulka `push_tokens` + RPC `group_push_tokens`). Posílá se při novém výdaji a platbě. Plugin `expo-notifications` v `app.json`.
- **Sdílecí kartička:** `react-native-view-shot` + `expo-sharing` v GroupDetail (`captureRef` na kartu „kdo komu dluží" → sdílení obrázku).
- **Error boundary:** `components/ErrorBoundary.tsx` (obal v App.tsx) – pád ukáže maskota + „Zkusit znovu" místo bílé obrazovky. Sem případně napojit Sentry.
- **Easter egg:** 5 rychlých ťuknutí na maskota (hlavička i onboarding) → `pokeMascot` (store) → hláška z `QUIPS_EGG` + mince + happy mood.
- **A11y:** textové odkazy (zpět, smazat, smlouva…) mají `accessibilityRole="button"` + `suppressHighlighting`; Toggle je `switch` s `accessibilityState`; maskot je `image` s popiskem. Pozor: RN `Text` NEpodporuje `hitSlop` (jen Pressable).
- **Store materiály:** složka `store/` (listing CS/EN, data-safety, release notes, feature graphic SVG, ikona `app-icon.svg` + `icon-prompt.md`, návod na publikaci `publishing-guide.md`).

## Přejmenování + druhá vlna (2026-07)
- **Název:** „Dotačníček" (dřív Čapí Dluh/Babišovník/Dotačník). Scheme `dotacnicek`, package/bundle `com.balata.dotacnicek`. POZOR: slug `BabisovnikApp` a AsyncStorage klíče `@babisovnik/*` zůstávají (EAS projectId / lokální nastavení uživatelů).
- **Biometrický zámek:** `expo-local-authentication` (plugin v app.json, NOVÝ BUILD). `state.bioLock/bioAvailable/locked`, přepínač v Profilu (jen se zapnutou biometrikou na zařízení), zámek při startu a odchodu do pozadí, `LockScreen` v Root.
- **Vyhledávání ve výdajích:** GroupDetail, pole od 4+ výdajů, bez diakritiky (`foldText`), hledá popis/plátce/kategorii.
- **Oprava textScale:** škálování upravuje VSTUPNÍ props (style pole), ne výsledek renderu – jedině tak funguje na nativní platformě i webu. Ověřeno: 38→45px (large), 38→34px (small).
- **Hardening:** maxLength na všech vstupech, autoComplete/textContentType u e-mailu a hesel.
- **Web verze (iOS uživatelé):** `npx expo export --platform web --output-dir docs/app`, `experiments.baseUrl = "/dotacnicek/app"` v app.json → hostuje se na GitHub Pages vedle landingu (`https://balatav.github.io/dotacnicek/app/`).
- **App Store (iOS nativně):** návod `store/app-store-guide.md`, screenshoty `store/screenshots-ios/` (1290×2796). V app.json: `supportsTablet:false`, `usesNonExemptEncryption:false`. **Google login je na nativním iOS skrytý** (AuthScreens, guideline 4.8 — jinak by Apple vyžadoval Sign in with Apple; případné doplnění = expo-apple-authentication + Apple provider v Supabase). Store screenshoty (Android i iOS) se generují ze `shots.html` (scratchpad, headless Chrome; parametry `?s=1..5&w=&h=`).

## Výkon / UX / testy (2026-06)
- **Jest** (`jest-expo`, `babel.config.js`): `npm test`. Testy `__tests__/logic.test.js` + `money.test.js`. `babel-preset-expo` PŘIPNUTÝ na ~54 (vyšší verze rozbije build SDK 54!).
- **Realtime:** subscription na `expenses`/`payments` ve `store.js` (debounce 350 ms → reloadGroup/refreshAll). Vyžaduje `migration_realtime.sql`.
- **N+1 pryč:** `fetchExpensesForGroups`/`fetchPaymentsForGroups` (1 dotaz/tabulka). `refreshAll(force)` má throttle 4 s (Přehled). Pull-to-refresh volá `force`.
- **Offline cache:** per-uid v AsyncStorage (`@babisovnik/cache-<uid>`), hydratuje se při startu (instant data), maže se při odhlášení.
- **Haptika:** `src/haptics.js` (`tapSuccess` u uložení výdaje/platby). **Bezpečné okraje:** `react-native-safe-area-context` (App.js provider, Root `useSafeAreaInsets`). **expo-image** pro účtenky (cache). **KeyboardAvoidingView** v AddExpense/Auth/CreateGroup. **a11y** role/label na `Pushable` + spodní navigaci. Odebrán přepínač zvuku.

## Měny a dělení (2026-06)
- `src/money.js` – `CURRENCIES` (CZK/EUR/USD), `fmtMoney(amt,cur)`, `fmtMoneyMap(map)` (mezera jako oddělovač tisíců, bez Intl).
- Výdaj má `currency`, `shares` (částka na osobu, paralelně k `parts`; null = rovným dílem) a `splitType` (`equal|ratio|exact`).
- `logic.js`: bilance **po měnách** – `netFor(...,currency)`, `transfersFor` vrací převody s `currency`, `shareOf(e,name)`, `myNet`, `currenciesIn`. `totalOwe/totalOwed` vrací mapu `{CUR:částka}` (+ `hasAny`).
- AddExpense: výběr měny + režimu dělení; „podle cen" hlídá zbytek do součtu, „poměrově" počítá z vah. Schema: `migration_split_currency.sql`.

## Hotovo nově (2026-06)
Úprava výdaje (`startEdit` → AddExpense edit režim, `expensesApi.updateExpense`). Smazání skupiny (`deleteGroup` = archivace přes `archiveGroup`, tlačítko v GroupDetail s potvrzením). In-app zásady (Privacy screen místo prohlížeče). Back gesto (`goBack`/BackHandler). Landing page + EAS APK build (z mobilu ověřeno). Odebrán mikrofon permission (`microphonePermission:false` u image-pickeru).
**Jména členů:** Profil → „Tvoje jméno" (`setMyName` → RPC `set_my_name` přepíše i historii výdajů/plateb + auth metadata `full_name`). Připojení do skupiny přes výběr identity: `joinByCode` → RPC `group_preview` → obrazovka `ChooseIdentity` (vyber svoje jméno / přidej nové) → `finishJoin` → RPC `join_group_choose`. Vše ve `supabase/migration_names.sql`.
