# Dotačník 📱💸

Mobilní aplikace na dělení společných útrat (styl Splitwise) s vtipným maskotem (parodie politika-podnikatele).
Postaveno v **React Native + Expo** – jeden kód běží na **Androidu i iPhonu**.

Aplikace je věrným přepisem designu z `../Babišovník.dc.html` (Claude Design).

## Co appka umí

- Úvodní obrazovka + registrace / přihlášení (Google nebo e-mail)
- Přehled skupin se souhrnem „Dlužíš / Dostaneš"
- Vytvoření skupiny a přidávání členů
- Sdílení skupiny odkazem
- Detail skupiny: kdo komu dluží + seznam výdajů
- Přidání výdaje (kdo platil, mezi koho rozdělit)
- **Optimalizované vyrovnání dluhů** (minimální počet plateb)
- Vypořádání s tlačítkem „Zacvakat" + animace padajících mincí
- Profil se statistikami, přepínání tématu (žlutá / modrá), přepínače
- **Offline režim** – data se ukládají do zařízení (AsyncStorage)

## Jak appku spustit

V terminálu (nebo přímo ve VS Code přes Terminal → New Terminal):

```bash
cd BabisovnikApp
npm install        # jen poprvé
npm start          # spustí Expo
```

Pak máš tři možnosti, jak appku vidět:

| Kde chci appku vidět | Co udělat |
|----------------------|-----------|
| **Na svém telefonu** (nejjednodušší) | Nainstaluj appku **Expo Go** (Google Play / App Store), spusť `npm start` a naskenuj QR kód z terminálu. |
| **V prohlížeči na PC** | `npm run web` |
| **Android emulátor** | `npm run android` (potřebuje Android Studio) |
| **iOS simulátor** | `npm run ios` (potřebuje Mac s Xcode) |

## Struktura projektu

```
BabisovnikApp/
├─ App.js                  # vstupní bod – načtení fontů
├─ src/
│  ├─ theme.js             # barvy témat + fonty
│  ├─ data.js              # výchozí ukázková data
│  ├─ logic.js             # výpočet dluhů a vyrovnání
│  ├─ store.js             # globální stav + ukládání (offline)
│  ├─ Root.js              # hlavička, navigace, přepínání obrazovek
│  ├─ components/          # znovupoužitelné prvky (tlačítka, avatar, maskot…)
│  └─ screens/             # jednotlivé obrazovky
```

## Sestavení instalačního souboru (APK / pro App Store)

Až budeš chtít appku nasdílet nebo nahrát do obchodů, použij Expo build službu:

```bash
npm install -g eas-cli
eas build -p android      # vytvoří .apk / .aab
eas build -p ios          # vyžaduje Apple Developer účet ($99/rok)
```
