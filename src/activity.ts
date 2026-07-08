// Historie aktivit – sloučí výdaje a platby do jedné časové osy.
// Odvozeno z dat (created_at), bez samostatné DB tabulky.
import type { Expense, Payment } from './types';

export interface FeedItem {
  id: string;
  kind: 'expense' | 'payment';
  actor: string;          // u výdaje plátce, u platby odesílatel
  counterparty?: string;  // u platby příjemce
  desc?: string;          // popis výdaje
  category?: string;
  amount: number;
  currency: string;
  when: number;           // timestamp (ms) pro řazení; 0 když chybí
}

function ts(s?: string): number {
  if (!s) return 0;
  const t = Date.parse(s);
  return isNaN(t) ? 0 : t;
}

// Sloučená časová osa výdajů + plateb, nejnovější nahoře.
export function activityFeed(expenses: Expense[] | undefined, payments: Payment[] | undefined): FeedItem[] {
  const items: FeedItem[] = [];
  (expenses || []).forEach((e) => {
    items.push({
      id: 'e' + e.id, kind: 'expense', actor: e.payer, desc: e.desc, category: e.category,
      amount: e.amount, currency: e.currency || 'CZK', when: ts(e.createdAt),
    });
  });
  (payments || []).forEach((p) => {
    items.push({
      id: 'p' + p.id, kind: 'payment', actor: p.from, counterparty: p.to,
      amount: p.amt, currency: p.currency || 'CZK', when: ts(p.createdAt),
    });
  });
  return items.sort((a, b) => b.when - a.when);
}

// Lidský popis „před chvílí / před 3 h / 12. 6.".
export function whenLabel(when: number): string {
  if (!when) return '';
  const diff = Date.now() - when;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'právě teď';
  if (min < 60) return 'před ' + min + ' min';
  const h = Math.floor(min / 60);
  if (h < 24) return 'před ' + h + ' h';
  const d = Math.floor(h / 24);
  if (d < 7) return 'před ' + d + ' dny';
  const date = new Date(when);
  return date.getDate() + '. ' + (date.getMonth() + 1) + '.';
}
