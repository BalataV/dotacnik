# 🍎 Vydání Dotačníčku na App Store — KOMPLETNÍ checklist

Krok za krokem, každé pole a každý checkbox. Z Windows (build běží v cloudu EAS,
Mac nepotřebuješ). Odškrtávej si `[ ]` → `[x]` jak postupuješ.

**Co budeš potřebovat:**
- [ ] Apple ID se zapnutým dvoufaktorovým ověřením (2FA)
- [ ] Platební kartu (99 USD/rok, ~2 300 Kč)
- [ ] Občanku po ruce (Apple občas chce ověřit totožnost)
- [ ] Ideálně iPhone na otestování (jde to i bez — viz Fáze 4)
- [ ] Testovací účet appky (e-mail + heslo, POTVRZENÝ) — stejný jako pro Google

> ⚠️ **Právní připomínka:** Apple recenzuje satiru přísněji než Google
> (guideline 1.1). Disclaimer v popisu + vysvětlení v Review Notes riziko
> snižují, ale zamítnutí je možné. Není to konec — řeší se odpovědí/úpravou.

---

## FÁZE 0 — Apple Developer účet (blokuje všechno ostatní, začni tady)

1. [ ] **Zapni 2FA na Apple ID** (pokud nemáš): appleid.apple.com → přihlas se
   → **Sign-In and Security** → **Two-Factor Authentication** → Turn On.
   Bez 2FA tě Apple do programu nepustí.
2. [ ] Jdi na **https://developer.apple.com/programs/enroll/** → **Start Your
   Enrollment** → přihlas se svým Apple ID.
3. [ ] Odsouhlas **Apple Developer Agreement** (checkbox + Submit).
4. [ ] **Entity Type:** vyber **Individual / Sole Proprietor** (fyzická osoba).
5. [ ] **Osobní údaje:** jméno a příjmení **přesně podle dokladu, latinkou**
   (Vojtěch → klidně s diakritikou, Apple ji bere), adresa, telefon.
   Tohle jméno se pak zobrazuje v App Store jako „vývojář" — u Individual
   účtu **nejde skrýt** (firma by chtěla IČO/DUNS, pro začátek netřeba).
6. [ ] **Purchase** — zaplať **99 USD** kartou (proběhne 3D Secure ověření).
7. [ ] **Co bude následovat po zaplacení:**
   - Hned: e-mail s potvrzením objednávky (Order Confirmation).
   - Do **24–48 h**: e-mail **„Welcome to the Apple Developer Program"** —
     tím je účet aktivní.
   - **Občas navíc:** Apple si vyžádá ověření totožnosti — e-mailem tě požádá
     o fotku dokladu (nahrává se přes web nebo přes appku Apple Developer),
     výjimečně zavolají. Normální proces, nelekni se.
8. [ ] **Kontrola:** developer.apple.com/account ukazuje „Membership: Apple
   Developer Program" a přihlášení na **appstoreconnect.apple.com** funguje
   (uvidíš prázdné My Apps).

---

## FÁZE 1 — iOS build přes EAS (z terminálu ve Windows)

Z adresáře `BabisovnikApp` spusť:

```bash
eas build --platform ios --profile production
```

Co přesně uvidíš a co odpovědět:

- [ ] `Do you want to log in to your Apple account?` → **Y**
- [ ] `Apple ID:` → tvůj Apple ID e-mail → heslo (jde přímo Applu, ne Expu)
- [ ] **2FA kód** — přijde na tvůj iPhone/Mac nebo SMS → opiš 6 číslic do terminálu
- [ ] Výběr **Team** — máš jen jeden (tvoje jméno, Individual) → Enter
- [ ] `Generate a new Apple Distribution Certificate?` → **Y**
- [ ] `Generate a new Apple Provisioning Profile?` → **Y**
- [ ] Otázka na **Push Notifications key (APNs)** → **Y / Generate**
      (nutné, aby chodily notifikace!)
- [ ] Bundle ID **com.balata.dotacnicek** se zaregistruje automaticky.
- [ ] Build běží v cloudu **15–30 min** — sleduj odkaz, který ti vypíše
      (expo.dev/accounts/balatav/projects/BabisovnikApp/builds/…).
- [ ] **Kontrola:** build má zelený stav **Finished**.

---

## FÁZE 2 — Založení appky v App Store Connect

1. [ ] **appstoreconnect.apple.com** → **My Apps** → modré **⊕** → **New App**.
2. [ ] Vyplň přesně:

| Pole | Hodnota |
|---|---|
| Platforms | ☑ **iOS** (ostatní nech prázdné) |
| Name | `Dotačníček` |
| Primary Language | **Czech** |
| Bundle ID | **com.balata.dotacnicek** (vyber z rozbalovacího seznamu — vytvořil ho build ve Fázi 1; když tam není, obnov stránku) |
| SKU | `dotacnicek` |
| User Access | **Full Access** |

3. [ ] **Create** → otevře se stránka appky s verzí „1.0 Prepare for Submission".

---

## FÁZE 3 — Nahrání buildu do App Store Connect

```bash
eas submit --platform ios --latest
```

- [ ] Znovu přihlášení k Apple (stejně jako ve Fázi 1).
- [ ] EAS najde appku podle Bundle ID a nahraje poslední build.
- [ ] V ASC → tvá appka → záložka **TestFlight**: build se objeví jako
      **Processing** → po **10–60 min** bude „Ready to Submit".
- [ ] Otázka na šifrování (export compliance) **nepřijde** — je zodpovězená
      v kódu (`usesNonExemptEncryption: false`). ✓

---

## FÁZE 4 — TestFlight (otestování na iPhonu)

1. [ ] ASC → **TestFlight** → vlevo **Internal Testing** → **⊕** → název
   skupiny např. `Interni` → Create.
2. [ ] **Testers ⊕** → přidej **svůj Apple ID e-mail** (jako Account Holder
   už v seznamu jsi).
3. [ ] Na **iPhonu**: App Store → nainstaluj **TestFlight** → přihlas se
   stejným Apple ID → uvidíš Dotačníček → **Install**.
4. [ ] **Otestuj (checklist):**
   - [ ] registrace e-mailem → přijde potvrzovací e-mail → potvrzení funguje
   - [ ] přihlášení + odhlášení
   - [ ] „Zapomenuté heslo" → přijde e-mail → nastavení nového hesla
   - [ ] založení skupiny, pozvánka (sdílení odkazu)
   - [ ] výdaj s fotkou účtenky (povolení fotoaparátu/fotek — česká hláška)
   - [ ] vyrovnání dluhu, notifikace (povolit při prvním dotazu)
   - [ ] tmavý režim, velikost písma
   - [ ] smazání účtu (Profil)
5. **Nemáš iPhone?** Půjč si na půl hodiny od kohokoli — do TestFlightu se na
   něm přihlásíš svým Apple ID a otestuješ. Kdyby to fakt nešlo: můžeš odeslat
   i bez testu (kód je stejný jako ověřená Android verze), ale riskuješ, že
   drobnost objeví až recenzent → zamítnutí a kolo navíc.

---

## FÁZE 5 — Vyplnění záznamu (všechna pole)

### 5a) App Information (levé menu → General → App Information)
- [ ] Name: `Dotačníček` (předvyplněné)
- [ ] Subtitle: `Dělení útrat s partou`
- [ ] Category → Primary: **Finance** · Secondary (volitelné): **Lifestyle**
- [ ] Content Rights: **„…does not contain, show, or access third-party
  content"** (appka neobsahuje cizí obsah)
- [ ] **Age Rating** → Edit → dotazník, odpověz:

| Otázka | Odpověď |
|---|---|
| Cartoon or Fantasy Violence / Realistic Violence | None |
| Sexual Content, Nudity | None |
| Profanity or **Crude Humor** | **Infrequent/Mild** (satirické hlášky) |
| Alcohol, Tobacco, Drug Use | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Simulated Gambling | None |
| Medical/Treatment Information | None |
| Contests | None |
| Unrestricted Web Access | No |
| Gambling and Contests | No |

  → výsledek **12+** → Done. ✓

### 5b) Pricing and Availability (levé menu)
- [ ] Price Schedule → **Add Pricing** → vyber **CZK 0 (Free)** → potvrď
- [ ] Availability: **All Countries and Regions** (nebo si vyber jen
  Česko + Slovensko — jde kdykoli změnit)

### 5c) App Privacy (levé menu)
- [ ] Privacy Policy URL: `https://dotacnicek.cz/privacy.html`
- [ ] **Get Started** → „Do you collect data from this app?" → **Yes, we
  collect data** → zaškrtej PŘESNĚ tyhle typy (nic víc):

| Kategorie → typ | Purpose | Linked to user? | Tracking? |
|---|---|---|---|
| Contact Info → **Email Address** | App Functionality | **Yes** | No |
| Contact Info → **Name** | App Functionality | **Yes** | No |
| Financial Info → **Other Financial Info** | App Functionality | **Yes** | No |
| User Content → **Photos or Videos** | App Functionality | **Yes** | No |
| User Content → **Other User Content** | App Functionality | **Yes** | No |
| Identifiers → **Device ID** *(push token)* | App Functionality | **Yes** | No |
| Diagnostics → **Crash Data** | App Functionality | **No** | No |

- [ ] „Do you or your third-party partners use data for **tracking**?" → **No**
- [ ] **Publish** (pravý horní roh sekce App Privacy).

### 5d) Verze 1.0 (App Store tab → iOS App 1.0 Prepare for Submission)
- [ ] **App Previews and Screenshots** → záložka **iPhone 6.9″ Display** →
  přetáhni 5 souborů ze `store/screenshots-ios/` v pořadí 01→05 (1290×2796).
  Ostatní velikosti se doplní samy; iPad sekce není (supportsTablet: false). ✓
- [ ] Promotional Text: `Kdo komu dluží? Spočítám to za vás. Sorry jako.`
- [ ] Description: **celý popis** ze `store/listing-cs.md` (sekce „Úplný popis")
- [ ] Keywords: `dluhy,útraty,skupina,splitwise,výdaje,parta,vyrovnání,účty,dovolená,spolubydlící`
- [ ] Support URL: `https://dotacnicek.cz/`
- [ ] Marketing URL (volitelné): `https://dotacnicek.cz/`
- [ ] Version: `1.0.0` · Copyright: `2026 Vojtěch Balata`
- [ ] **Build** → **⊕ Add Build** → vyber build nahraný ve Fázi 3
- [ ] **App Review Information:**
  - [ ] ☑ **Sign-in required** → Username: *e-mail testovacího účtu* ·
    Password: *heslo* (účet MUSÍ být e-mailem potvrzený — přihlas se s ním
    jednou předem!)
  - [ ] Contact Information: tvoje jméno, telefon `+420…`,
    e-mail `podpora@dotacnicek.cz`
  - [ ] **Notes** — vlož beze změny:
    ```
    Dotacnicek is a Czech expense-splitting app for groups (like Splitwise).
    The mascot is a fictional satirical caricature; the app contains mild
    political satire/parody clearly presented as humor. It does not reference
    any real person by name, does not make factual claims, and includes a
    disclaimer in the app description. All content is user-generated expense
    tracking within private groups.
    Sign in via "Přihlásit se" (Log in) → enter the test account email and
    password above → tap "Vstoupit".
    ```
- [ ] **App Store Version Release** → ☑ **Manually release this version**
  (po schválení vydáš sám tlačítkem — máš kontrolu nad momentem vydání)
- [ ] **Save** (pravý horní roh). Žádné pole nesmí svítit červeně.

---

## FÁZE 6 — Odeslání na review a vydání

1. [ ] Nahoře **Add for Review** → zkontroluj souhrn → **Submit to App Review**.
2. [ ] Stav se změní: **Waiting for Review** (hodiny až ~1 den) →
   **In Review** (hodiny) → e-mail s výsledkem. Celkem obvykle **1–3 dny**.
3. [ ] **Approved** → stav „Pending Developer Release" → klikni
   **Release This Version** → do ~24 h je appka živá na App Store. 🎉
4. [ ] **Rejected?** → **Resolution Center** (v ASC) → přečti přesný důvod:
   - jen metadata (texty/screenshoty) → oprav a **resubmit bez nového buildu**
   - chyba v appce → oprava kódu → Fáze 1 + 3 znovu → resubmit
   - nesouhlas s posouzením → můžeš odpovědět/odvolat se v Resolution Center
   Zamítnutí je běžná součást procesu, většina appek si jím projde.

---

## Po vydání

- **Aktualizace:** ASC → ⊕ nová verze (např. 1.0.1) → `eas build` +
  `eas submit` → přiřaď build → Submit (review bývá u updatů rychlejší).
- **Drobné JS změny bez review:** `eas update --branch production` (OTA,
  funguje pro iOS i Android najednou). Nativní změny = vždy nový build.
- **Roční poplatek:** membership se obnovuje za 99 USD — Apple pošle e-mail
  měsíc předem. Bez obnovy appka z App Store **zmizí**.
- Odkaz na appku pak doplníme na web (dotacnicek.cz) a do landing tlačítek.
