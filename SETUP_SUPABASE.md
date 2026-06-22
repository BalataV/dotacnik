# Nastavení Supabme – krok za krokem 🪜

Tohle je návod, jak rozjet cloud (sdílená data, přihlášení, fotky). Zvládneš ho i bez znalosti programování. Až to dokončíš, dej mi vědět a já napojím obrazovky aplikace na databázi.

> 💡 Dokud klíče nevyplníš (krok 3), aplikace dál funguje v **lokálním režimu** (data jen v telefonu) – nic se nerozbije.

---

## Krok 1 – Založ účet a projekt
1. Jdi na **https://supabase.com** → **Start your project** → přihlas se (klidně Googlem).
2. **New project**:
   - **Name:** `babisovnik`
   - **Database Password:** vymysli silné heslo a **ulož si ho** (budeš ho potřebovat jen výjimečně).
   - **Region:** `Central EU (Frankfurt)` (nejblíž ČR).
3. Klikni **Create new project** a počkej ~2 minuty, než se rozjede.

## Krok 2 – Vytvoř tabulky (databázi)
1. V levém menu projektu: **SQL Editor** → **New query**.
2. Otevři soubor `supabase/schema.sql` (je v projektu), **zkopíruj celý jeho obsah** do editoru.
3. Klikni **Run** (vpravo dole). Mělo by napsat „Success".

## Krok 3 – Zkopíruj klíče do aplikace
1. V Supabase: **Project Settings** (ozubené kolo) → **API**.
2. Najdeš dvě hodnoty:
   - **Project URL** (např. `https://abcd1234.supabase.co`)
   - **anon public** klíč (dlouhý text začínající `eyJ...`)
3. Otevři v projektu soubor **`app.json`** a vyplň je do sekce `extra`:
   ```json
   "extra": {
     "supabaseUrl": "https://abcd1234.supabase.co",
     "supabaseAnonKey": "eyJhbGciOi...celý-klíč..."
   }
   ```
   > anon klíč je **veřejný a bezpečný** dát do appky – data chrání pravidla RLS, která jsi nastavil v kroku 2.

## Krok 4 – Úložiště fotek
1. V Supabase: **Storage** → **New bucket**.
2. Název: `receipts`, zaškrtni **Public bucket** → **Save**.
   (Pravidla pro nahrávání už nastavil `schema.sql`.)

## Krok 5 – Přihlášení e-mailem (nejrychlejší na otestování)
1. V Supabase: **Authentication** → **Providers** → **Email** je zapnutý.
2. Pro snadné testování: **Authentication → Sign In / Up → Email** a *dočasně* vypni „Confirm email"
   (jinak musíš každou registraci potvrzovat z e-mailu). Před vydáním appky zase zapni.

## Krok 6 – Přihlášení Googlem (může počkat)
Tohle je o krok složitější, klidně až později:
1. **Google Cloud Console** (https://console.cloud.google.com) → nový projekt → **APIs & Services → Credentials**.
2. **Create Credentials → OAuth client ID → Web application**.
3. Do **Authorized redirect URIs** přidej adresu z Supabase:
   `https://<tvoje-ref>.supabase.co/auth/v1/callback`
   (přesnou najdeš v Supabase → Authentication → Providers → Google.)
4. Zkopíruj **Client ID** a **Client secret** do Supabase → Authentication → Providers → **Google** → zapni a vlož → **Save**.
5. V Supabase → Authentication → **URL Configuration → Redirect URLs** přidej:
   `babisovnik://auth/callback`

---

## Hotovo?
Až máš kroky 1–4 (a ideálně 5), **napiš mi „Supabase je hotový"** a já:
- napojím obrazovky (registrace, skupiny, výdaje, fotky) na databázi,
- zařídím živou synchronizaci mezi telefony,
- doplním sdílení skupiny odkazem + tlačítko „Sdílet".

Pak už uvidí všichni členové stejná data i fotky účtenek. 🎉
