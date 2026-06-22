// Výpočet bilancí a optimalizace vyrovnání dluhů
// "Já" = aktuálně přihlášený uživatel (v cloudu se na "Já" mapuje podle účtu)
import { QUIPS } from './quips';

export function initial(name) {
  return name === 'Já' ? 'Já' : (name ? name[0].toUpperCase() : '?');
}

// Čistá bilance každého člena (zaplatil minus podíl, upraveno o provedené platby)
export function netFor(group, expensesForGroup, paymentsForGroup) {
  const ex = expensesForGroup || [];
  const pay = paymentsForGroup || [];
  if (!group) return {};
  const net = {};
  group.members.forEach((m) => (net[m] = 0));
  ex.forEach((e) => {
    net[e.payer] = (net[e.payer] || 0) + e.amount;
    const share = e.amount / e.parts.length;
    e.parts.forEach((p) => (net[p] = (net[p] || 0) - share));
  });
  // Provedená platba: kdo zaplatil (from) si svůj dluh snižuje, příjemce (to) dostal
  pay.forEach((p) => {
    net[p.from] = (net[p.from] || 0) + p.amt;
    net[p.to] = (net[p.to] || 0) - p.amt;
  });
  Object.keys(net).forEach((k) => (net[k] = Math.round(net[k])));
  return net;
}

// Optimalizované vyrovnání – minimalizuje počet transakcí (hladový algoritmus)
export function transfersFor(group, expensesForGroup, paymentsForGroup) {
  const net = netFor(group, expensesForGroup, paymentsForGroup);
  const cred = [];
  const deb = [];
  Object.keys(net).forEach((n) => {
    if (net[n] > 0) cred.push({ n, a: net[n] });
    else if (net[n] < 0) deb.push({ n, a: -net[n] });
  });
  cred.sort((x, y) => y.a - x.a);
  deb.sort((x, y) => y.a - x.a);
  const t = [];
  let i = 0;
  let j = 0;
  while (i < deb.length && j < cred.length) {
    const m = Math.min(deb[i].a, cred[j].a);
    if (m > 0) {
      t.push({
        id: group.id + '|' + deb[i].n + '|' + cred[j].n,
        groupId: group.id,
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
  return t;
}

// Všechny transakce napříč skupinami, kde já dlužím
export function myAllTransfers(groups, expenses, payments) {
  const all = [];
  groups.forEach((g) => transfersFor(g, expenses[g.id], (payments || {})[g.id]).forEach((t) => {
    if (t.from === 'Já') all.push(t);
  }));
  return all;
}

// Všechny transakce, kde dostanu zaplaceno
export function myOwedTransfers(groups, expenses, payments) {
  const all = [];
  groups.forEach((g) => transfersFor(g, expenses[g.id], (payments || {})[g.id]).forEach((t) => {
    if (t.to === 'Já') all.push(t);
  }));
  return all;
}

export function totalOwe(groups, expenses, payments) {
  return myAllTransfers(groups, expenses, payments).reduce((s, t) => s + t.amt, 0);
}

export function totalOwed(groups, expenses, payments) {
  return myOwedTransfers(groups, expenses, payments).reduce((s, t) => s + t.amt, 0);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Hláška maskota v bublině.
// Úvodní obrazovka má pevné "Čau lidi!", všude jinde se losuje náhodně z poolu.
let _lastBubble = null;
export function bubbleFor(state, screen) {
  if (screen === 'onboarding') return 'Čau lidi!';
  let q = pick(QUIPS);
  for (let i = 0; i < 6 && q === _lastBubble; i++) q = pick(QUIPS); // ať se neopakuje hned po sobě
  _lastBubble = q;
  return q;
}

export { pick };
