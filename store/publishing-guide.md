# Návod: vydání Dotačníčku na Google Play (krok za krokem)

Pro úplného začátečníka. Postupuj odshora dolů. Většinu uděláš jednou.

---

## FÁZE 0 – Co musíš mít hotové předem
1. **Účet Google Play Developer** – jednorázový poplatek **25 USD**.
   Registrace: https://play.google.com/console/signup
2. **Spuštěné SQL migrace v Supabase** (jinak appka nebude fungovat):
   v Supabase → SQL editor spusť postupně všechny soubory ze složky `supabase/`,
   které jsi ještě nespustil – nově hlavně:
   - `migration_categories.sql`
   - `migration_push.sql`
3. **Nainstalovaný EAS CLI** a přihlášení:
   ```bash
   npm install -g eas-cli
   eas login
   ```

---

## FÁZE 1 – Vyrob instalační soubor (.aab) přes EAS

Z adresáře `BabisovnikApp`:

1. **(Doporučeno) Nejdřív testovací APK** a vyzkoušej na telefonu:
   ```bash
   eas build --platform android --profile preview
   ```
   EAS vrátí odkaz → stáhni APK → nainstaluj v telefonu → projdi appku
   (přihlášení, výdaj, kategorie, notifikace, tmavý režim, sdílení).

2. **Produkční build pro Play** (App Bundle .aab):
   ```bash
   eas build --platform android --profile production
   ```
   - Při prvním buildu se EAS zeptá na **podpisový klíč (keystore)** –
     nech ho vygenerovat a spravovat EAS (vyber „Generate new keystore").
     **Tento klíč NIKDY neztrať** – bez něj nejde vydat aktualizace.
   - Po dokončení stáhni `.aab` z odkazu, který EAS dá.

---

## FÁZE 2 – Založ aplikaci v Play Console
1. Otevři https://play.google.com/console → **Create app**.
2. Vyplň: název **Dotačníček**, jazyk **čeština**, typ **App**, zdarma **Free**.
3. Odsouhlas prohlášení (Developer Program Policies, US export laws).

---

## FÁZE 3 – Vyplň povinný obsah (levé menu „App content")
Projdi všechny položky se zeleným zaškrtnutím:

1. **Privacy policy** → vlož URL:
   `https://dotacnicek.cz/privacy.html`
2. **App access** → appka **vyžaduje přihlášení**, takže musíš dát recenzentům
   **testovací účet**: vyber „All or some functionality is restricted" a zadej
   testovací e-mail + heslo (založ si v appce jeden účet jen pro Google).
   ⚠️ Bez toho appku zamítnou (nedostanou se dál než na login).
3. **Ads** → appka nemá reklamy → „No".
4. **Content rating** → vyplň dotazník (finance/nástroj, žádné násilí) →
   appka dostane nízký rating (3+/PEGI 3).
5. **Target audience** → cílová skupina **18+** (appka není pro děti; parodie).
6. **Data safety** → vyplň přesně podle `store/data-safety.md`.
7. **Government apps**, **Financial features** → pokud se zeptá na finanční
   funkce: appka **NEzpracovává platby ani převody peněz** (jen eviduje útraty),
   takže to NENÍ „finanční služba" – vyber, že nejde o platby/půjčky.

---

## FÁZE 4 – Store listing (levé menu „Main store listing")
1. **App name:** Dotačníček
2. **Short / Full description:** zkopíruj ze `store/listing-cs.md`
   (volitelně přidej angličtinu z `store/listing-en.md` přes „Manage translations").
3. **App icon:** 512×512 PNG (z `assets/icon.png`).
4. **Feature graphic:** 1024×500 (export z `store/feature-graphic.svg`).
5. **Phone screenshots:** min. 2 (viz `store/screenshots-guide.md`).
6. **App category:** Finance · **Contact email:** podpora@dotacnicek.cz

---

## FÁZE 5 – Nahraj build a otestuj (doporučené pořadí)
Než půjdeš do produkce, využij **uzavřené testování** (rychlejší schválení, míň rizika):

1. Levé menu → **Testing → Closed testing** → Create track.
2. **Create release** → nahraj `.aab` z Fáze 1.
3. **Release notes:** zkopíruj ze `store/release-notes.md`.
4. Přidej testery (e-maily) → ulož → **Review release** → **Start rollout**.
5. Otestuj přes opt-in odkaz na telefonu.

Až bude vše OK:
6. Levé menu → **Production** → **Create release** → nahraj stejný `.aab`
   (nebo „promote" z testovacího tracku) → Review → **Start rollout to Production**.

---

## FÁZE 6 – Schválení a publikace
- První kontrola Googlem trvá obvykle **pár dní** (někdy i déle).
- Případné výtky přijdou e-mailem → oprav a nahraj nový build
  (`eas build … --profile production` znovu; verze se zvýší automaticky).
- Po schválení je appka na Google Play. 🎉

---

## Aktualizace appky v budoucnu
1. Udělej změny v kódu.
2. `eas build --platform android --profile production` (verze se zvýší sama – `autoIncrement`).
3. V Play Console → Production → Create release → nahraj nový `.aab` → rollout.
4. Drobné JS změny umí i `eas update` (OTA) bez nového buildu – ale nové
   nativní balíčky (jako teď notifikace/sdílení) vždy vyžadují nový build.

---

## Poznámky / rizika
- **Právní:** appka je parodie. Maskot/hlášky nejmenují reálnou osobu, ale
  riziko (ochrana osobnosti) trvá – před vydáním zvaž konzultaci s advokátem.
- **iOS** je samostatný proces (App Store Connect, Apple Developer 99 USD/rok) –
  návod doplníme, až budeš chtít.
