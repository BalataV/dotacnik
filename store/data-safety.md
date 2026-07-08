# Google Play – formulář „Zabezpečení dat" (Data safety)

Vyplníš v Play Console → App content → Data safety. Níže přesné odpovědi
podle toho, co appka skutečně dělá (Supabase backend, Expo push).

## Souhrnné odpovědi
- **Sbírá appka data?** ANO
- **Sdílí appka data se třetími stranami?** NE
  (Supabase a Expo jsou zpracovatelé/poskytovatelé služby, ne „sdílení" ve smyslu Play. Pokud Play vyžaduje uvést poskytovatele služeb, nejde o „third-party sharing".)
- **Je přenos dat šifrovaný?** ANO (HTTPS/TLS)
- **Může uživatel požádat o smazání dat?** ANO – přímo v aplikaci: Profil → „Smazat účet a všechna data" (smaže účet i obsah).
- **Účast v Play rodinné politice / děti:** NE (necíleno na děti)

## Sbíraná data – co zaškrtnout

### Osobní údaje (Personal info)
- **E-mailová adresa**
  - Sbíráno: ANO · Sdíleno: NE
  - Účel: Správa účtu (přihlášení), Funkčnost aplikace
  - Povinné (nelze odmítnout – slouží k přihlášení)
- **Jméno** (zobrazované jméno ve skupině)
  - Sbíráno: ANO · Sdíleno: NE
  - Účel: Funkčnost aplikace
  - Volitelné (uživatel si jméno volí/upravuje)

### Finanční údaje (Financial info)
- **Jiné finanční údaje** (Other financial info)
  - Sbíráno: ANO · Sdíleno: NE
  - Účel: Funkčnost aplikace
  - Pozn.: jde o uživatelem zadané částky a popisy útrat (ne platební údaje, ne čísla karet – appka NEzpracovává platby).

### Fotky a videa (Photos and videos)
- **Fotky** (nepovinné fotky účtenek)
  - Sbíráno: ANO · Sdíleno: NE
  - Účel: Funkčnost aplikace
  - Volitelné

### Identifikátory zařízení (Device or other IDs)
- **Device or other IDs** (push token pro notifikace)
  - Sbíráno: ANO · Sdíleno: NE
  - Účel: Funkčnost aplikace (zasílání notifikací)
  - Volitelné (jen když uživatel povolí notifikace)

## Co appka NEsbírá (nezaškrtávat)
- Přesnou polohu, kontakty, SMS, historii prohlížení, zdravotní data,
  platební údaje / čísla karet, reklamní identifikátory.
- Žádná reklama, žádný tracking pro reklamu.

## Bezpečnostní praktiky
- Data šifrována při přenosu: ANO
- Uživatel může požádat o smazání dat: ANO (in-app)
- Dodržení Play Families Policy: nerelevantní (necíleno na děti)
