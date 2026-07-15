# 📋 Play Console – copy-paste kit (Dotačníček)

Jdi v Play Console odshora dolů. U každého pole je označeno **▶ VLOŽ:** co přesně
zkopírovat. Citlivé kroky (přihlášení, právní souhlas, publikace) klikáš ty.

Máš hotový **placený Developer účet** ✅. Než začneš, připrav si i zbytek:

## 0) Co si připravit PŘED vyplňováním
- [ ] **`.aab` soubor** – stáhni z https://expo.dev → projekt **balatav/BabisovnikApp**
      → **Builds** → poslední *production* build → **Download**. Ulož do počítače.
- [ ] **SQL migrace v Supabase** (jinak appka po instalaci nebude fungovat a recenzent ji zamítne):
      Supabase → SQL editor → spusť `supabase/migration_categories.sql` a `supabase/migration_push.sql`.
- [ ] **Ikona 512×512** – hotová: `store/play-icon-512.png`.
- [ ] **Feature graphic 1024×500** – vyexportuj z `store/feature-graphic.svg` do PNG
      (otevři v prohlížeči a vyfoť na 1024×500, nebo Inkscape → Export).
- [ ] **Aspoň 2 screenshoty telefonu** – nafoť z webové verze nebo z appky v telefonu
      (Přehled, Detail skupiny, Audit NKÚ… viz `store/screenshots-guide.md`).
- [ ] **Testovací účet** pro recenzenty – v appce si založ jeden účet přes e-mail
      (Registrovat přes e-mail). E-mail + heslo si poznamenej, budeš je vkládat níže.

---

# FÁZE A – Založení aplikace
Play Console → **Create app**

| Pole | ▶ VLOŽ / vyber |
|---|---|
| App name | `Dotačníček` |
| Default language | **Czech – čeština (Česko)** |
| App or game | **App** |
| Free or paid | **Free** |
| Declarations | zaškrtni obě (Developer Program Policies + US export laws) |

→ **Create app**

---

# FÁZE B – „Set up your app" (levé menu → App content)

## B1. Privacy policy
▶ VLOŽ:
```
https://dotacnicek.cz/privacy.html
```

## B2. App access
Vyber **„All or some functionality is restricted"** → **Add new instructions**:

| Pole | ▶ VLOŽ |
|---|---|
| Name | `Přihlášení e-mailem` |
| Username / e-mail | *(tvůj testovací e-mail z kroku 0)* |
| Password | *(heslo k testovacímu účtu)* |
| Instructions | `Na úvodní obrazovce zvolte „Přihlásit se", zadejte e-mail a heslo výše a stiskněte Vstoupit.` |

⚠️ Bez funkčního testovacího účtu appku **zamítnou** (nedostanou se za přihlášení).

## B3. Ads
▶ **No**, aplikace neobsahuje reklamy.

## B4. Content rating
1. E-mail: `vojtech.balata@gmail.com` *(sem chodí certifikát hodnocení IARC — nech svůj
   vývojářský/účtový gmail, není to veřejný kontakt; ten je až ve Store listingu níž)*
2. Kategorie aplikace: **Utility, Productivity, Communication, or Other**
3. Dotazník – odpovídej pravdivě; pro tuhle appku:
   - Násilí, sex, drogy, hazard, strach: **Ne** u všeho
   - **Hrubý/urážlivý humor nebo mírně vulgární jazyk**: appka má satirické
     hlášky a mírné popíchnutí („pahýlku", „pacholku") → pokud se zeptá na
     *crude humor / mild language*, odpověz **Ano** (dostaneš rating ~Teen, to je OK).
   - Uživatelský obsah / sdílení: appka umožňuje sdílet obsah ve skupině → pokud
     se ptá „users can interact / share content", odpověz **Ano**.

> Content rating je tvoje čestné prohlášení – zkontroluj, že odpovědi sedí.

## B5. Target audience and content
- Cílová věková skupina: **18 a více** (appka je parodie, není pro děti)
- „Appeals to children?" → **No**

## B6. Data safety
**Přehledové otázky:**
- Does your app collect or share user data? → **Yes**
- Is all data encrypted in transit? → **Yes**
- Do you provide a way for users to request deletion? → **Yes**

**Datové typy – zaškrtni tyto a u každého nastav** (Collected: **Ano**, Shared: **Ne**):

| Datový typ (v Play) | Účel | Povinné? |
|---|---|---|
| Personal info → **Email address** | App functionality, Account management | Required |
| Personal info → **Name** | App functionality | Optional |
| Financial info → **Other financial info** *(částky útrat)* | App functionality | Optional |
| Photos and videos → **Photos** *(účtenky)* | App functionality | Optional |
| Device or other IDs → **Device or other IDs** *(push token)* | App functionality | Optional |

**NEZAŠKRTÁVEJ:** poloha, kontakty, SMS, zdraví, platební údaje/čísla karet,
historie prohlížení, reklamní ID. (Detaily v `store/data-safety.md`.)

## B7. Government apps → **No**
## B8. Financial features → **„My app doesn't provide any financial features"**
*(appka jen eviduje útraty, nezpracovává platby ani převody)*
## B9. Health → **No**

---

# FÁZE C – Store listing (levé menu → Main store listing)

## App name
▶ VLOŽ:
```
Dotačníček
```

## Short description (max 80 znaků)
▶ VLOŽ:
```
Rozdělování útrat ve skupině. Kdo komu dluží? Spočítám to za vás. Sorry jako.
```

## Full description (max 4000 znaků)
▶ VLOŽ:
```
Dotačníček je appka na rozdělování společných útrat – s partou, spolubydlícími, na chatě i na dovolené. Kdo zaplatil pivo, kdo benzín a kdo zase nic? Appka to spočítá za vás. S nadhledem, vtipem a maskotem, který to „nečet, ale podepsal".

🧾 ZAPIŠ VÝDAJ ZA PÁR VTEŘIN
Přidej, co se utratilo, kdo platil a koho se to týká. Můžeš připojit i fotku účtenky.

➗ SPRAVEDLIVÉ DĚLENÍ
Rovným dílem, poměrově (kdo víc jedl, víc platí) nebo podle přesných cen. Appka pohlídá, ať to sedí na korunu.

💸 KDO KOMU DLUŽÍ
Appka chytře zminimalizuje počet plateb – místo deseti převodů zaplatíš jeden. „Zacvakni" dluh jedním ťuknutím.

🗂️ KATEGORIE A STATISTIKY
Roztřiď výdaje (jídlo, doprava, zábava…) a mrkni na „Audit NKÚ" – parodickou kontrolní zprávu skupiny s žebříčkem Sponzorů večera.

🌍 VÍCE MĚN
CZK, EUR i USD pohromadě, s orientačním přepočtem podle živého kurzu.

👥 SDÍLENÍ SE SKUPINOU
Pozvi kamarády odkazem nebo kódem. Vše se synchronizuje v reálném čase. Pošli i parodickou „dotační smlouvu" dlužníkovi.

🌙 SVĚTLÝ I TMAVÝ REŽIM
Plus volitelná velikost písma, ať to přečte i strejda bez brýlí.

🔔 NOTIFIKACE
Přidá někdo výdaj nebo splatí dluh? Appka dá vědět.

Dotačníček je nezávislá satirická aplikace. Maskot i hlášky jsou karikatura, humor a nadsázka. Aplikace není spojena s žádnou politickou stranou, osobou ani institucí, není jimi provozována ani schválena a nevyjadřuje žádná skutková tvrzení o nikom.

Stahuj, rozděluj, makej. My tam ty peníze máme.
```

## Grafika
| Položka | Soubor / rozměr |
|---|---|
| App icon | `store/play-icon-512.png` (512×512) |
| Feature graphic | export z `store/feature-graphic.svg` → PNG **1024×500** |
| Phone screenshots | min. 2 (viz krok 0 / `store/screenshots-guide.md`) |

## Kategorizace a kontakt
- App category: **Finance**
- Contact email: `podpora@dotacnicek.cz`

→ **Save**

---

# FÁZE D – Nahrání buildu (doporučeně nejdřív test)

Levé menu → **Testing → Closed testing** → **Create new release**
*(uzavřený test schválí Google rychleji a bezpečně; do produkce pak jen „promote")*

1. **App integrity / signing** → nech **Google-managed signing** (nabídne se samo).
2. **App bundles** → nahraj stažený **`.aab`**.
3. **Release name** ▶ VLOŽ: `1.0.0`
4. **Release notes** ▶ VLOŽ:
```
<cs-CZ>
První vydání! 🎉
• Rozdělování útrat ve skupině (rovným dílem, poměrově i podle cen)
• Chytré vyrovnání – kdo komu dluží na jeden ťuk
• Kategorie, statistiky a parodický „Audit NKÚ"
• Více měn s živým kurzem
• Světlý i tmavý režim, notifikace, sdílení
Makáme. Sorry jako.
</cs-CZ>
```
5. Přidej sebe jako testera (svůj e-mail) → **Save** → **Review release** → **Start rollout to Closed testing**.
6. Otevři opt-in odkaz na telefonu, nainstaluj z Play a **vyzkoušej** (login, výdaj, notifikace…).

Až bude test OK:
→ Levé menu → **Production** → **Create new release** → **Promote** z testu
(nebo nahraj stejný `.aab`) → Review → **Start rollout to Production**.

---

# FÁZE E – Po odeslání
- První kontrola Googlem trvá obvykle **pár dní**.
- Výtky přijdou e-mailem → oprav → nový build (`eas build … --profile production`) → nahraj.
- Po schválení je Dotačníček na Google Play. 🎉

---

## ⚠️ Právní připomínka
Appka je parodie. Texty ve store popisu i disclaimer jsou psané opatrně, ale
riziko (ochrana osobnosti) trvá. Před velkou publicitou zvaž konzultaci s advokátem.
