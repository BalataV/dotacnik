// Výpočet bilancí a optimalizace vyrovnání dluhů
// "Já" = aktuálně přihlášený uživatel (v cloudu se na "Já" mapuje podle účtu)
import { QUIPS_OWE, QUIPS_OWED, QUIPS_EVEN } from './quips';
import type { Group, Expense, Payment, Transfer, MoneyMap, ScreenName, AppState } from './types';

type ExpenseList = Expense[] | undefined;
type PaymentList = Payment[] | undefined;

export function initial(name: string): string {
  return name === 'Já' ? 'Já' : (name ? name[0].toUpperCase() : '?');
}

// Kolik z výdaje připadá na daného účastníka.
// shares (částka na osobu) má přednost; když chybí, dělí se rovným dílem.
export function shareOf(e: Expense, name: string): number {
  const parts = e.parts || [];
  if (e.shares && e.shares.length === parts.length) {
    const i = parts.indexOf(name);
    return i >= 0 ? Number(e.shares[i]) || 0 : 0;
  }
  return parts.length ? e.amount / parts.length : 0;
}

// Které měny se ve skupině reálně vyskytují (aspoň CZK).
export function currenciesIn(expensesForGroup: ExpenseList, paymentsForGroup: PaymentList): string[] {
  const s = new Set<string>();
  (expensesForGroup || []).forEach((e) => s.add(e.currency || 'CZK'));
  (paymentsForGroup || []).forEach((p) => s.add(p.currency || 'CZK'));
  if (!s.size) s.add('CZK');
  return Array.from(s);
}

// Čistá bilance členů PRO JEDNU MĚNU (zaplatil minus podíl, upraveno o platby).
export function netFor(group: Group | null | undefined, expensesForGroup: ExpenseList, paymentsForGroup: PaymentList, currency = 'CZK'): Record<string, number> {
  const ex = (expensesForGroup || []).filter((e) => (e.currency || 'CZK') === currency);
  const pay = (paymentsForGroup || []).filter((p) => (p.currency || 'CZK') === currency);
  if (!group) return {};
  const net: Record<string, number> = {};
  group.members.forEach((m) => (net[m] = 0));
  ex.forEach((e) => {
    net[e.payer] = (net[e.payer] || 0) + e.amount;
    (e.parts || []).forEach((p) => (net[p] = (net[p] || 0) - shareOf(e, p)));
  });
  // Provedená platba: kdo zaplatil (from) si svůj dluh snižuje, příjemce (to) dostal
  pay.forEach((p) => {
    net[p.from] = (net[p.from] || 0) + p.amt;
    net[p.to] = (net[p.to] || 0) - p.amt;
  });
  Object.keys(net).forEach((k) => (net[k] = Math.round(net[k])));
  return net;
}

// Net přihlášeného ("Já") po měnách – pro souhrn u skupiny. { CUR: částka }
export function myNet(group: Group, expensesForGroup: ExpenseList, paymentsForGroup: PaymentList): MoneyMap {
  const map: MoneyMap = {};
  currenciesIn(expensesForGroup, paymentsForGroup).forEach((cur) => {
    const n = netFor(group, expensesForGroup, paymentsForGroup, cur)['Já'] || 0;
    if (n) map[cur] = n;
  });
  return map;
}

// Optimalizované vyrovnání – pro každou měnu zvlášť. Každý převod nese svoji currency.
export function transfersFor(group: Group, expensesForGroup: ExpenseList, paymentsForGroup: PaymentList): Transfer[] {
  const out: Transfer[] = [];
  currenciesIn(expensesForGroup, paymentsForGroup).forEach((cur) => {
    const net = netFor(group, expensesForGroup, paymentsForGroup, cur);
    const cred: { n: string; a: number }[] = [];
    const deb: { n: string; a: number }[] = [];
    Object.keys(net).forEach((n) => {
      if (net[n] > 0) cred.push({ n, a: net[n] });
      else if (net[n] < 0) deb.push({ n, a: -net[n] });
    });
    cred.sort((x, y) => y.a - x.a);
    deb.sort((x, y) => y.a - x.a);
    let i = 0;
    let j = 0;
    while (i < deb.length && j < cred.length) {
      const m = Math.min(deb[i].a, cred[j].a);
      if (m > 0) {
        out.push({
          id: group.id + '|' + cur + '|' + deb[i].n + '|' + cred[j].n,
          groupId: group.id,
          currency: cur as Transfer['currency'],
          from: deb[i].n,
          to: cred[j].n,
          amt: Math.round(m),
        });
      }
      deb[i].a -= m;
      cred[j].a -= m;
      if (deb[i].a <= 0.5) i++;
      if (cred[j].a <= 0.5) j++;
    }
  });
  return out;
}

// Všechny transakce napříč skupinami, kde já dlužím
export function myAllTransfers(groups: Group[], expenses: Record<string, Expense[]>, payments: Record<string, Payment[]>): Transfer[] {
  const all: Transfer[] = [];
  groups.forEach((g) => transfersFor(g, expenses[g.id], (payments || {})[g.id]).forEach((t) => {
    if (t.from === 'Já') all.push(t);
  }));
  return all;
}

// Všechny transakce, kde dostanu zaplaceno
export function myOwedTransfers(groups: Group[], expenses: Record<string, Expense[]>, payments: Record<string, Payment[]>): Transfer[] {
  const all: Transfer[] = [];
  groups.forEach((g) => transfersFor(g, expenses[g.id], (payments || {})[g.id]).forEach((t) => {
    if (t.to === 'Já') all.push(t);
  }));
  return all;
}

// Souhrn po měnách: { CZK: 1200, EUR: 30 }
function sumByCurrency(transfers: Transfer[]): MoneyMap {
  const map: MoneyMap = {};
  transfers.forEach((t) => { map[t.currency || 'CZK'] = (map[t.currency || 'CZK'] || 0) + t.amt; });
  return map;
}

export function totalOwe(groups: Group[], expenses: Record<string, Expense[]>, payments: Record<string, Payment[]>): MoneyMap {
  return sumByCurrency(myAllTransfers(groups, expenses, payments));
}

export function totalOwed(groups: Group[], expenses: Record<string, Expense[]>, payments: Record<string, Payment[]>): MoneyMap {
  return sumByCurrency(myOwedTransfers(groups, expenses, payments));
}

// Má uživatel vůbec nějaký dluh/pohledávku? (mapa měn → bool)
export function hasAny(map: MoneyMap): boolean {
  return Object.keys(map || {}).some((k) => Math.round(map[k]) !== 0);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Hláška maskota v bublině. Úvodní obrazovka má pevné "Čau lidi!".
// Jinde se losuje ze sady podle bilance: dlužím / mám dostat / vyrovnaný.
let _lastBubble: string | null = null;
export function bubbleFor(state: Partial<AppState>, screen: ScreenName): string {
  if (screen === 'onboarding') return 'Čau lidi!';
  const groups = state.groups || [];
  const expenses = state.expenses || {};
  const payments = state.payments || {};
  let pool = QUIPS_EVEN;
  if (hasAny(totalOwe(groups, expenses, payments))) pool = QUIPS_OWE;        // dlužím
  else if (hasAny(totalOwed(groups, expenses, payments))) pool = QUIPS_OWED; // mám dostat
  let q = pick(pool);
  for (let i = 0; i < 6 && q.text === _lastBubble; i++) q = pick(pool); // ať se neopakuje hned po sobě
  _lastBubble = q.text;
  return q.text;
}

export { pick };
