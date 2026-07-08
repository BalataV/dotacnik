// Statistiky skupiny – sdílený výpočet pro Statistiky / Žebříček / Audit NKÚ.
// Vše po měnách (MoneyMap), aby seděly skupiny s víc měnami.
import type { Group, Expense, MoneyMap } from './types';
import { shareOf } from './logic';

type ExpenseList = Expense[] | undefined;

function addTo(map: MoneyMap, cur: string, amt: number) {
  map[cur] = (map[cur] || 0) + amt;
}

// Součet všech položek mapy (pro řazení napříč měnami – hrubé, ale pro
// zábavný žebříček dostačující; většina skupin stejně jede v jedné měně).
export function mapSum(map: MoneyMap): number {
  return Object.keys(map || {}).reduce((s, k) => s + (map[k] || 0), 0);
}

// Celkem utraceno ve skupině (po měnách).
export function groupTotal(expenses: ExpenseList): MoneyMap {
  const m: MoneyMap = {};
  (expenses || []).forEach((e) => addTo(m, e.currency || 'CZK', e.amount));
  Object.keys(m).forEach((k) => (m[k] = Math.round(m[k])));
  return m;
}

// Kolik každý člen ZAPLATIL (po měnách).
export function paidByMember(group: Group, expenses: ExpenseList): Record<string, MoneyMap> {
  const out: Record<string, MoneyMap> = {};
  group.members.forEach((m) => (out[m] = {}));
  (expenses || []).forEach((e) => {
    if (!out[e.payer]) out[e.payer] = {};
    addTo(out[e.payer], e.currency || 'CZK', e.amount);
  });
  Object.values(out).forEach((mm) => Object.keys(mm).forEach((k) => (mm[k] = Math.round(mm[k]))));
  return out;
}

// Kolik každý člen PROUTRÁCEL (jeho podíl na výdajích, po měnách).
export function shareByMember(group: Group, expenses: ExpenseList): Record<string, MoneyMap> {
  const out: Record<string, MoneyMap> = {};
  group.members.forEach((m) => (out[m] = {}));
  (expenses || []).forEach((e) => {
    (e.parts || []).forEach((p) => {
      if (!out[p]) out[p] = {};
      addTo(out[p], e.currency || 'CZK', shareOf(e, p));
    });
  });
  Object.values(out).forEach((mm) => Object.keys(mm).forEach((k) => (mm[k] = Math.round(mm[k]))));
  return out;
}

export interface RankRow { name: string; paid: MoneyMap; score: number; }

// Žebříček členů podle zaplaceno (sestupně).
export function leaderboard(group: Group, expenses: ExpenseList): RankRow[] {
  const paid = paidByMember(group, expenses);
  return group.members
    .map((name) => ({ name, paid: paid[name] || {}, score: mapSum(paid[name] || {}) }))
    .sort((a, b) => b.score - a.score);
}

// Největší jednotlivý výdaj.
export function biggestExpense(expenses: ExpenseList): Expense | null {
  let best: Expense | null = null;
  (expenses || []).forEach((e) => { if (!best || e.amount > best.amount) best = e; });
  return best;
}

// Počet výdajů.
export function expenseCount(expenses: ExpenseList): number {
  return (expenses || []).length;
}

export interface CategorySlice { key: string; total: MoneyMap; score: number; }

// Rozpad útrat podle kategorií (sestupně podle objemu).
export function totalByCategory(expenses: ExpenseList): CategorySlice[] {
  const map: Record<string, MoneyMap> = {};
  (expenses || []).forEach((e) => {
    const k = e.category || 'ostatni';
    if (!map[k]) map[k] = {};
    addTo(map[k], e.currency || 'CZK', e.amount);
  });
  return Object.keys(map)
    .map((key) => {
      Object.keys(map[key]).forEach((cur) => (map[key][cur] = Math.round(map[key][cur])));
      return { key, total: map[key], score: mapSum(map[key]) };
    })
    .sort((a, b) => b.score - a.score);
}
