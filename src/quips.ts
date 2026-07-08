// Hlášky maskota. Vybírají se podle toho, jestli uživatel dluží / má dostat / je vyrovnaný.
// Hláška s `alt: true` patří druhé postavě (karikatura ministryně financí) – v hlavičce
// se u ní pak ukáže druhá karikatura. Obecné hlášky (níže) se objevují ve všech stavech.

export interface Quip {
  text: string;
  alt?: boolean; // true = druhá karikatura (ministryně financí)
}

// Obecné hlášky – parodie (jména zkomolená), objevují se v každém stavu.
const GENERAL: Quip[] = [
  { text: 'Sorry jako.' },
  { text: 'Je to kampaň! Účelovka!' },
  { text: 'Nikdy neodstoupím! Nikdy!' },
  { text: 'Sněmovna je žvanírna.' },
  { text: 'Řídit stát jako firmu.' },
  { text: 'To je celé kampaň!' },
  { text: 'Jsme premianti!' },
  { text: 'Já jsem to nečet.' },
  { text: 'Bude líp.' },
  { text: 'Makáme!' },
  { text: 'Já jsem s StB nikdy nespolupracoval!' },
  { text: 'Soud jsem vyhrál!' },
  { text: 'Ten svazek byl zfalšovaný!' },
  { text: 'Já jsem byl vlastně oběť!' },
  { text: 'Můj táta byl diplomat!' },
  { text: 'Pro mě je to uzavřená věc.' },
  { text: 'Půjdu do Štrasburku a tam vyhraju!' },
  { text: 'Lidi zajímají ceny potravin, ne nějaký Bareš!' },
  { text: 'To je spiknutí slovenských soudů!' },
  { text: 'Já jsem jenom hájil zájmy Československa.' },
  { text: 'Mě nezajímá, co píšou v Bratislavě.' },
  { text: 'Všichni historici jsou placení moji nepřátelé.' },
  { text: 'To je pravěk, 40 let stará historie!' },
  { text: 'Není to moje, já nevím, komu to patří.' },
  { text: 'Byl to nejlepší projekt, jaký jsem vymyslel!' },
  { text: 'Já jsem nikdy nelhal. Nikdy!' },
  { text: 'Agrofarm není můj.' },
  { text: 'Já nemám žádný střet zájmů.' },
  { text: 'To vymyslel Mára!' },
  { text: 'Vy lžete! Od rána do večera lžete!' },
  { text: 'Já na nikoho složky nevedu.' },
  { text: 'Já jsem se obětoval pro tuhle zemi!' },
  { text: 'Mohl jsem být v Karibiku na jachtě!' },
  { text: 'Vláda národní katastrofy! Nemehla!' },
  { text: 'Udělejte mi teze, má děti? Jazyky?' },
  { text: 'My jsme the best in Covid.' },
  { text: 'Já jsem zachránil tisíce mrtvých!' },
  { text: 'Já to neřídím, já jsem jenom premiér.' },
  { text: 'Na co jsou nám matematici?' },
  { text: 'Pimpula je odborník, já nejsem epidemiolog.' },
  { text: 'Nesmíme to dělat plošně, to je nesmysl.' },
  { text: 'My chceme znovu ty motýle.' },
  { text: 'Postavíme v Praze Apple Store!' },
  { text: 'V Kalifornii mě přivítal sám Tim Cook.' },
  { text: 'Já platím daně! Miliardy!' },
  { text: 'Kdo vám to řekl? Jméno!' },
  { text: 'A nezapomeň na DPH, pahýlku!' },
  { text: 'Tady se to prožralo, motýle.' },
  { text: 'Zapiš to, ať je klid.' },
  { text: 'Co bych za to dal.' },
  { text: 'Ty pacholku, zaplať ten dluh!' },
];

// Uživatel DLUŽÍ
const OWE_SPECIFIC: Quip[] = [
  { text: 'Schodek nevadí, to jsou všechno investice.' },
  { text: 'Za všechno může Koloušek.' },
  { text: 'To je polistopadový kartel.' },
  { text: 'Vy tady normálně lžete.' },
  { text: 'Je to účelovka a kampaň.' },
  { text: 'Nebuď jak Koloušek a zaplať.' },
  { text: 'Je to asociální paskvil!', alt: true },
  { text: 'Kde na to proboha vezmete?', alt: true },
  { text: 'Fialova drahota ničí naše občany.', alt: true },
  { text: 'To je naprostý amaterismus a diletantismus.', alt: true },
  { text: 'Tohle je rozpočtová sebevražda.', alt: true },
  { text: 'Nemáte žádný plán, jenom plošně škrtáte.', alt: true },
  { text: 'Váš konsolidační balíček je jen daňové peklo.', alt: true },
  { text: 'Vy prostě jenom neumíte vybírat daně.', alt: true },
  { text: 'Zadlužíte naše děti a vnuky!', alt: true },
];

// Uživatel má naopak DOSTAT
const OWED_SPECIFIC: Quip[] = [
  { text: 'Dali jsme lidem peníze, přidali jsme důchodcům.' },
  { text: 'Kde jsou ty prachy?' },
  { text: 'Já už mám vyděláno, já ty peníze nepotřebuju.' },
  { text: 'Všichni tady kradli.' },
  { text: 'Vždyť já těm lidem pomáhám, já pro ně dýchám.' },
  { text: 'Sorry jako.' },
  { text: 'Zacvakej to a bude líp.' },
  { text: 'Nestyďte se, řekněte jméno.' },
  { text: 'Peníze se musí napumpovat do ekonomiky.', alt: true },
  { text: 'My jsme ty peníze lidem dali.', alt: true },
  { text: 'Naše vláda nikdy nedopustila, aby lidé padli na dno.', alt: true },
  { text: 'Za nás se lidé měli podstatně líp.', alt: true },
  { text: 'Já jsem státní kasu předávala ve výborné kondici.', alt: true },
  { text: 'Máme to spočítané do posledního haléře.', alt: true },
];

// Uživatel je VYROVNANÝ
const EVEN_SPECIFIC: Quip[] = [
  { text: 'Rozpočet je skvělý, my tam ty peníze máme.' },
  { text: 'Já to řídím jako firmu.' },
  { text: 'Makáme.' },
  { text: 'Já jsem mikromanažer, já to musím řídit.' },
  { text: 'Já tu zemi zachránil.' },
  { text: 'Best in covid.' },
  { text: 'We will see.' },
  { text: 'Musíte lidem okamžitě pomoct.', alt: true },
  { text: 'Já se anglicky učím poctivě a velmi intenzivně.', alt: true },
  { text: 'My na to máme zpracované podrobné analýzy.', alt: true },
  { text: 'Já to absolutně odmítám, je to vytržené z kontextu.', alt: true },
];

export const QUIPS_OWE: Quip[] = [...OWE_SPECIFIC, ...GENERAL];
export const QUIPS_OWED: Quip[] = [...OWED_SPECIFIC, ...GENERAL];
export const QUIPS_EVEN: Quip[] = [...EVEN_SPECIFIC, ...GENERAL];

// Easter egg – hlášky po pěti rychlých šťouchnutích do maskota.
export const QUIPS_EGG: string[] = [
  'Přestaň do mě šťouchat, já makám!',
  'To lechtá. Sorry jako.',
  'Audit? Jaký audit? Nic nevím.',
  'Šťouchej si do opozice!',
  'Hele, já jsem jen obyčejnej maskot.',
];

// Texty, u kterých se má ukázat druhá karikatura (ministryně financí).
const ALT_TEXTS = new Set<string>(
  [...OWE_SPECIFIC, ...OWED_SPECIFIC, ...EVEN_SPECIFIC].filter((q) => q.alt).map((q) => q.text),
);

export function isAltQuip(text: string): boolean {
  return ALT_TEXTS.has(text);
}
