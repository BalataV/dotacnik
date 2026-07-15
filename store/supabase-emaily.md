# 📨 Supabase e-maily — SMTP + české šablony (copy-paste kit)

Bez vlastního SMTP posílá Supabase e-maily z `noreply@mail.app.supabase.io`,
**anglicky** a s limitem jen **pár e-mailů za hodinu** — pro produkci nepoužitelné.
Máš schránku `podpora@dotacnicek.cz` u Zoneru, tak ji použijeme.

## 1) SMTP nastavení
Supabase → **Authentication → Emails → SMTP Settings** → Enable custom SMTP:

| Pole | Hodnota |
|---|---|
| Sender email | `podpora@dotacnicek.cz` |
| Sender name | `Dotačníček` |
| Host | `smtp.zoner.com` |
| Port | `465` (SSL) — kdyby nešel, zkus `587` |
| Username | `podpora@dotacnicek.cz` |
| Password | *(heslo schránky podpora@)* |

Ulož a pošli si testovací reset hesla na vlastní e-mail (v appce Login →
„Zapomenuté heslo"). Pak v **Authentication → Rate Limits** zvedni
„Rate limit for sending emails" třeba na **30/hod**.

## 2) Šablony (Authentication → Emails → Templates)
Po zapnutí SMTP jdou upravit. Vyplň **Subject** a **Message body** (přepni na
zdrojový HTML editor a vlož celé). Upravujeme 3 šablony, zbytek se nepoužívá
(magic link/OTP, invite, reauth nemáme v appce).

### a) Confirm sign up (potvrzení registrace)
**Subject:** `Potvrď svou registraci — Dotačníček 🦤`
```html
<div style="background:#FFD60A;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:3px solid #15233B;border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 12px;color:#15233B;font-size:24px;">Čau lidi! 👋</h1>
    <p style="color:#15233B;font-size:15px;line-height:1.6;margin:0 0 22px;">
      Vítej v Dotačníčku. Klikni na tlačítko a potvrď, že e-mail
      <strong>{{ .Email }}</strong> patří tobě — pak se můžeš přihlásit.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1D5FD8;color:#ffffff;font-weight:bold;font-size:16px;padding:14px 26px;border-radius:12px;text-decoration:none;">
      ✅ Potvrdit e-mail
    </a>
    <p style="color:#7A839A;font-size:12px;line-height:1.6;margin:22px 0 0;">
      Pokud sis účet nezakládal(a), tenhle e-mail klidně ignoruj. Sorry jako.
    </p>
  </div>
  <p style="text-align:center;color:#15233B;font-size:12px;margin:16px 0 0;">
    Dotačníček — kdo komu dluží, spočítám to za vás ·
    <a href="https://dotacnicek.cz" style="color:#15233B;">dotacnicek.cz</a>
  </p>
</div>
```

### b) Reset password (obnova hesla)
**Subject:** `Obnova hesla — Dotačníček`
```html
<div style="background:#FFD60A;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:3px solid #15233B;border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 12px;color:#15233B;font-size:24px;">Zapomenuté heslo? 🔑</h1>
    <p style="color:#15233B;font-size:15px;line-height:1.6;margin:0 0 22px;">
      Někdo (nejspíš ty) požádal o obnovu hesla k účtu <strong>{{ .Email }}</strong>.
      Klikni na tlačítko a nastav si nové.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1D5FD8;color:#ffffff;font-weight:bold;font-size:16px;padding:14px 26px;border-radius:12px;text-decoration:none;">
      🔑 Nastavit nové heslo
    </a>
    <p style="color:#7A839A;font-size:12px;line-height:1.6;margin:22px 0 0;">
      Pokud jsi o nic nežádal(a), nic se neděje — heslo zůstává beze změny.
    </p>
  </div>
  <p style="text-align:center;color:#15233B;font-size:12px;margin:16px 0 0;">
    Dotačníček · <a href="https://dotacnicek.cz" style="color:#15233B;">dotacnicek.cz</a>
  </p>
</div>
```

### c) Change email address (změna e-mailu)
**Subject:** `Potvrď novou e-mailovou adresu — Dotačníček`
```html
<div style="background:#FFD60A;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:3px solid #15233B;border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 12px;color:#15233B;font-size:24px;">Nová adresa? 📮</h1>
    <p style="color:#15233B;font-size:15px;line-height:1.6;margin:0 0 22px;">
      Potvrď změnu e-mailu z <strong>{{ .Email }}</strong> na
      <strong>{{ .NewEmail }}</strong> kliknutím na tlačítko.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1D5FD8;color:#ffffff;font-weight:bold;font-size:16px;padding:14px 26px;border-radius:12px;text-decoration:none;">
      ✅ Potvrdit změnu
    </a>
    <p style="color:#7A839A;font-size:12px;line-height:1.6;margin:22px 0 0;">
      Pokud jsi o změnu nežádal(a), tenhle e-mail ignoruj.
    </p>
  </div>
  <p style="text-align:center;color:#15233B;font-size:12px;margin:16px 0 0;">
    Dotačníček · <a href="https://dotacnicek.cz" style="color:#15233B;">dotacnicek.cz</a>
  </p>
</div>
```

## 3) Jak funguje tok potvrzení a obnovy (pro info)
- **Registrace:** appka ukáže „Zkontroluj e-mail pro potvrzení" → uživatel klikne
  na odkaz → otevře se webová appka (Site URL) a účet je potvrzený → v appce se
  přihlásí. Nepotvrzený login hlásí „Nejdřív potvrď e-mail".
- **Obnova hesla:** Login → „Zapomenuté heslo? Pošleme ti odkaz" (použije e-mail
  z pole) → odkaz vede na `https://dotacnicek.cz/app/?reset=1` → webová appka
  uživatele přihlásí a ukáže obrazovku **Nové heslo** → uloží → hotovo.
  Funguje i pro uživatele z telefonu (odkaz se otevře v prohlížeči).
