// Centrální konfigurace veřejných adres (landing page + zásady ochrany údajů).
//
// >>> POKUD MÁŠ JINÉ GITHUB UŽIVATELSKÉ JMÉNO, ZMĚŇ JEN TENHLE JEDEN ŘÁDEK <<<
// Adresa GitHub Pages má tvar: https://<username>.github.io/<nazev-repozitare>
// (username se píše malými písmeny). Repozitář doporučuju pojmenovat "capidluh".
export const LANDING_BASE = 'https://balatav.github.io/capidluh';

// Odkaz, který se sdílí kamarádům. Landing page z parametru ?g=KÓD
// pozná pozvánku a nabídne "Otevřít v appce" (deep link capidluh://join/KÓD).
export function landingJoinUrl(code) {
  return LANDING_BASE + '/?g=' + code;
}

// Veřejně hostované zásady ochrany osobních údajů (potřeba pro obchody).
export const PRIVACY_URL = LANDING_BASE + '/privacy.html';
