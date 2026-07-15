# Nasazení Dotačníčku — krok za krokem

Dva návody: **B)** zveřejnit landing page na GitHub Pages (zdarma) a **C)** sestavit
testovací Android APK přes EAS. Dělej to v tomhle pořadí.

> ⚠️ Než začneš: V souboru `src/config.js` je adresa
> `https://balatav.github.io/dotacnicek`. Předpokládám, že tvoje GitHub uživatelské
> jméno je **balatav**. Pokud je jiné, **změň `LANDING_BASE` v `src/config.js`** —
> jinak budou sdílecí odkazy směřovat na špatnou adresu.

---

## B) Landing page na GitHub Pages

Landing page už je hotová ve složce `docs/` (3 soubory: `index.html`, `privacy.html`,
`.nojekyll`). Stačí ji dostat na GitHub a zapnout Pages.

### 1. Založ repozitář na GitHubu
1. Přihlas se na <https://github.com> (účet je zdarma).
2. Vpravo nahoře **+** → **New repository**.
3. **Repository name:** `dotacnicek` (malými písmeny — bude součástí adresy).
4. Nastav na **Public** (Pages na zdarma účtu fungují jen u veřejných repo).
5. **NEzaškrtávej** „Add a README" ani nic dalšího → **Create repository**.

### 2. Nahraj projekt na GitHub
V terminálu ve složce `BabisovnikApp` spusť (uprav `balatav`, pokud máš jiné jméno):

```bash
git add -A
git commit -m "Landing page + EAS konfigurace"
git remote add origin https://github.com/balatav/dotacnicek.git
git branch -M master
git push -u origin master
```

GitHub si vyžádá přihlášení (otevře okno prohlížeče, nebo zadáš jméno + token).

### 3. Zapni GitHub Pages
1. Na GitHubu otevři repozitář → **Settings** (nahoře) → vlevo **Pages**.
2. **Source:** „Deploy from a branch".
3. **Branch:** `master`, složka **`/docs`** → **Save**.
4. Počkej ~1 minutu. Nahoře se objeví adresa:
   **`https://balatav.github.io/dotacnicek/`**

### 4. Ověř, že to funguje
- Úvodní stránka: <https://balatav.github.io/dotacnicek/>
- Zásady ochrany údajů: <https://balatav.github.io/dotacnicek/privacy.html>
- Pozvánka (test): <https://balatav.github.io/dotacnicek/?g=TEST123> →
  musí ukázat kartu „Někdo tě zve do skupiny" s kódem TEST123.

Hotovo — sdílecí odkaz z appky (`…/?g=KÓD`) teď vede na reálnou stránku a tlačítko
**Privacy** v Profilu míří na hostované zásady.

> 📌 Až budeš mít hotový APK (krok C), vrať se do `docs/index.html` a nahoře do
> proměnné `DOWNLOAD_URL` vlož odkaz na stažení — tlačítka „Stáhnout appku" pak
> budou fungovat. Pak znovu `git add -A && git commit -m "odkaz na stažení" && git push`.

---

## C) Testovací Android APK přes EAS

Sestavení proběhne v cloudu Expo (zdarma má měsíční limit, na testování stačí).
Výsledkem je `.apk`, který si nainstaluješ přímo do Android telefonu.

### 1. Účet Expo (zdarma)
Založ si účet na <https://expo.dev> (stačí e-mail).

### 2. Nainstaluj EAS CLI a přihlas se
```bash
npm install -g eas-cli
eas login
```

### 3. Propoj projekt s Expo
```bash
eas build:configure
```
- Vybere se platforma → dej **Android** (nebo „All").
- Tohle ti do `app.json` automaticky doplní `extra.eas.projectId` a `owner`.
  `eas.json` už máš připravený (profil **preview** = APK).

### 4. Spusť build
```bash
eas build -p android --profile preview
```
- Při prvním buildu se zeptá na **Android keystore** → nech ho **vygenerovat
  automaticky** (Generate new keystore → Yes). Expo si ho uloží za tebe.
- Build běží v cloudu ~10–20 minut. V terminálu (a na expo.dev) uvidíš odkaz.

### 5. Nainstaluj do telefonu
1. Po dokončení dostaneš **odkaz na `.apk`** (a QR kód).
2. Otevři ten odkaz **v telefonu**, stáhni soubor.
3. Při instalaci Android nejspíš řekne „z neznámého zdroje" → povol to pro
   prohlížeč/soubory a dej **Instalovat**.
4. Appka „Dotačníček" se objeví v telefonu jako normální aplikace.

### 6. Otestuj deep linky naživo
- Pošli si sám sobě sdílecí odkaz z appky (přes Sdílet pozvánku).
- Klepni na něj v telefonu → landing page → **Otevřít v appce** → měla by se
  otevřít appka a připojit do skupiny. (Tohle v Expo Go nefunguje, jen v APK —
  proto je build důležitý i kvůli Googlu.)

---

## Co ještě před veřejným vydáním do obchodů (poznámka)
- Doplnit do `docs/privacy.html` chybějící údaje (adresa) a nechat schválit právníkem.
- V Supabase zapnout **Confirm email**.
- Vyplnit **Data Safety / Privacy** dotazníky v Google Play / App Store.
- Zvážit právní riziko maskota (viz `AGENTS.md` → Právní).
