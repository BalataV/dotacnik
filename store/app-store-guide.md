# 🍎 Návod: vydání Dotačníčku na Apple App Store (krok za krokem)

Pro úplného začátečníka, z Windows (build běží v cloudu EAS, Mac nepotřebuješ).
Postupuj odshora dolů.

> **Srovnání s Googlem:** Google Play = 25 USD jednorázově. Apple = **99 USD ročně**
> (Apple Developer Program). Bez toho na App Store nelze publikovat — žádná výjimka.
> Zdarma alternativa pro iPhone uživatele zůstává webová verze:
> https://balatav.github.io/dotacnicek/app/

---

## ⚠️ Než začneš: právní riziko je u Applu VYŠŠÍ
Apple recenzuje přísněji než Google (App Review Guideline 1.1 — hanlivý/zesměšňující
obsah cílený na reálnou osobu). Parodický maskot může projít (satira je obhajitelná),
ale zamítnutí je reálně možné. Disclaimer už máme v popisu appky — pomáhá.
Před vydáním zvaž konzultaci s advokátem (stejné doporučení jako u Googlu).

---

## FÁZE 0 – Apple Developer účet (musíš udělat osobně)
1. Potřebuješ **Apple ID se zapnutým dvoufaktorovým ověřením**.
2. Jdi na https://developer.apple.com/programs/enroll/ a zaregistruj se jako
   **Individual** (fyzická osoba).
3. Zaplať **99 USD/rok**. Schválení trvá obvykle **24–48 hodin** (přijde e-mail).
4. Po schválení se přihlas na https://appstoreconnect.apple.com — uvidíš prázdný přehled.

---

## FÁZE 1 – Build pro iOS přes EAS (z Windows, cloud)
Z adresáře `BabisovnikApp`:

```bash
eas build --platform ios --profile production
```

- EAS se zeptá na **přihlášení k Apple účtu** → přihlas se svým Apple ID.
- Na otázky ohledně **certifikátů, provisioning profilu a push klíče (APNs)**
  odpovídej **Yes / Generate** — EAS vše vytvoří a spravuje za tebe.
  (Push klíč je nutný, aby fungovaly notifikace.)
- Bundle ID `com.balata.dotacnicek` EAS zaregistruje automaticky.
- Build trvá ~15–30 min. Výsledek je `.ipa` (nemusíš stahovat — nahraje se přímo, viz Fáze 2).

**Poznámky ke kódu (už hotové, jen pro info):**
- `supportsTablet: false` — appka je iPhone-only (na iPadu poběží v kompatibilním
  režimu). Ušetří to iPad screenshoty a iPad review. Jde později zapnout.
- `usesNonExemptEncryption: false` — appka používá jen HTTPS, přeskočí se
  otázka na export šifrování při každém nahrání.
- **Google login je na iOS skrytý** — Apple by jinak vyžadoval i „Sign in with Apple"
  (guideline 4.8). E-mail přihlášení funguje normálně. Kdybys chtěl Google na iOS
  později, musí se přidat balíček `expo-apple-authentication` + zapnout Apple
  provider v Supabase → řekni si, doplníme.

---

## FÁZE 2 – Založení appky v App Store Connect
1. https://appstoreconnect.apple.com → **My Apps** → **+** → **New App**.
2. Vyplň:
   | Pole | Hodnota |
   |---|---|
   | Platforms | **iOS** |
   | Name | **Dotačníček** |
   | Primary Language | **Czech** |
   | Bundle ID | **com.balata.dotacnicek** (vyber ze seznamu — vytvořil ho EAS build) |
   | SKU | `dotacnicek` |
   | User Access | Full Access |

3. Nahraj build do App Store Connect:
```bash
eas submit --platform ios --latest
```
   (vezme poslední hotový build z Fáze 1 a nahraje ho; opět se přihlásíš k Apple)

---

## FÁZE 3 – TestFlight (otestuj na svém iPhonu)
1. V App Store Connect → **TestFlight** → build se objeví po ~10–30 min zpracování.
2. Do **Internal Testing** přidej sám sebe (svůj Apple ID e-mail).
3. Na iPhone si nainstaluj appku **TestFlight** z App Store → přijde ti pozvánka
   → nainstaluj Dotačníček a projdi: registrace, skupina, výdaj, notifikace,
   biometrický zámek (Face ID hláška), tmavý režim.

---

## FÁZE 4 – Vyplnění záznamu (App Store listing)
V App Store Connect → tvá appka → **App Store** (levé menu) → verze 1.0:

### Texty
| Pole | Co vložit |
|---|---|
| Promotional Text (volitelné) | `Kdo komu dluží? Spočítám to za vás. Sorry jako.` |
| Description | zkopíruj **úplný popis** ze `store/listing-cs.md` (stejný jako pro Google) |
| Keywords | `dluhy,útraty,skupina,splitwise,výdaje,parta,vyrovnání,účty,dovolená,spolubydlící` |
| Support URL | `https://balatav.github.io/dotacnicek/` |
| Marketing URL (volitelné) | `https://balatav.github.io/dotacnicek/` |

### Screenshoty
- **iPhone 6,9"**: nahraj 5 souborů ze `store/screenshots-ios/` (1290×2796) —
  Apple je použije i pro menší displeje.
- iPad sekce se nezobrazí (máme `supportsTablet: false`). ✓

### App Privacy (obdoba Data safety u Googlu)
**Privacy Policy URL:** `https://balatav.github.io/dotacnicek/privacy.html`

Klikni **Get Started** u App Privacy a deklaruj (mapování z `store/data-safety.md`):

| Apple kategorie | Co | Účel | Linked to user? | Tracking? |
|---|---|---|---|---|
| Contact Info → Email Address | e-mail účtu | App Functionality | **Ano** | Ne |
| Contact Info → Name | jméno ve skupině | App Functionality | **Ano** | Ne |
| Financial Info → Other Financial Info | částky útrat | App Functionality | **Ano** | Ne |
| User Content → Photos or Videos | fotky účtenek | App Functionality | **Ano** | Ne |
| User Content → Other User Content | názvy skupin, popisy výdajů | App Functionality | **Ano** | Ne |
| Identifiers → Device ID | push token | App Functionality | **Ano** | Ne |
| Diagnostics → Crash Data | pády aplikace | App Functionality | Ne | Ne |

- „Do you or your third-party partners use data for tracking?" → **No** (žádné reklamy/tracking).

### Age Rating (dotazník)
- Násilí, sex, drogy, hazard, léky, hrůza → **None** všude
- **Mature/Suggestive Themes** → None
- **Profanity or Crude Humor** → **Infrequent/Mild** (satirické hlášky)
- Neomezený web přístup → No, Hazard/soutěže → No
- Výsledek bude **12+** — to je v pořádku.

### App Review Information (KLÍČOVÉ — jinak zamítnou)
- **Sign-in required** → zaškrtni a vyplň **testovací účet**:
  e-mail + heslo účtu, který sis založil pro Google Play recenzenty (stejný funguje).
- **Notes** — vlož (anglicky, ať tomu recenzent rozumí):
  ```
  Dotacnicek is a Czech expense-splitting app for groups (like Splitwise).
  The mascot is a fictional satirical caricature; the app contains mild
  political satire/parody clearly presented as humor. It does not reference
  any real person by name, does not make factual claims, and includes a
  disclaimer in the app description. All content is user-generated expense
  tracking within private groups.
  Test account: [e-mail] / [heslo]
  Sign in via "Přihlásit se" (Log in) → enter email and password → "Vstoupit".
  ```
- Contact: tvoje jméno, telefon, e-mail.

### Ostatní
- **Pricing** → Free, všechny země (nebo jen Česko/Slovensko, jak chceš).
- **App Store Version Release** → doporučuji **Manually release this version**
  (po schválení vydáš sám tlačítkem).

---

## FÁZE 5 – Odeslání na review
1. Nahoře **Add for Review** → **Submit to App Review**.
2. Review trvá obvykle **1–3 dny**. Výsledek přijde e-mailem.
3. Když schválí → klikni **Release** (při manuálním vydání). 🎉
4. Když zamítnou → přečti důvod (přijde v Resolution Center), oprav, nahraj
   nový build (`eas build` + `eas submit`) nebo jen uprav metadata a pošli znovu.
   Zamítnutí je normální součást procesu, ne konec světa.

---

## Aktualizace appky v budoucnu
1. Změny v kódu → `eas build --platform ios --profile production` → `eas submit --platform ios --latest`.
2. V App Store Connect vytvoř novou verzi (např. 1.0.1), přiřaď build, Submit.
3. Drobné JS změny jdou i přes **OTA**: `eas update --branch production` —
   funguje pro iOS i Android současně, bez review. (Nové nativní balíčky vždy = nový build.)

---

## Souhrn: co musíš udělat TY (nejde automatizovat)
1. ⏳ Zaplatit a založit Apple Developer účet (99 USD/rok, ~1–2 dny schvalování)
2. ▶️ Spustit `eas build --platform ios --profile production` (+ přihlášení k Apple)
3. ▶️ Spustit `eas submit --platform ios --latest`
4. 🖱️ Založit appku v App Store Connect + vyplnit listing (texty/screenshoty máš hotové)
5. 📱 Otestovat přes TestFlight
6. 🚀 Submit to App Review → po schválení Release
