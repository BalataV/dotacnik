// Měny a formátování částek (oddělovač tisíců = mezera, jako v češtině).
import type { CurrencyCode, MoneyMap } from './types';

export const CURRENCIES: { code: CurrencyCode; symbol: string }[] = [
  { code: 'CZK', symbol: 'Kč' },
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
];

const SYM: Record<string, string> = { CZK: 'Kč', EUR: '€', USD: '$' };
const SP = String.fromCharCode(32); // běžná ASCII mezera (ne pevná) – předvídatelné porovnání

export function curSymbol(code: string): string {
  return SYM[code] || code || 'Kč';
}

// 1234567 -> "1 234 567" (bez spoléhání na Intl, který Hermes na Androidu neumí vždy)
function group(n: number): string {
  const neg = n < 0;
  const s = String(Math.abs(Math.round(n)));
  const grouped = s.replace(/\B(?=(\d{3})+(?!\d))/g, SP);
  return (neg ? '-' : '') + grouped;
}

// Jedna částka i s měnou: fmtMoney(1234, 'EUR') -> "1 234 €"
export function fmtMoney(amt: number, code: string = 'CZK'): string {
  return group(Number(amt) || 0) + SP + curSymbol(code);
}

// Mapa { CZK: 1200, EUR: 30 } -> "1 200 Kč · 30 €" (jen nenulové). Prázdné -> "0 Kč".
export function fmtMoneyMap(map: MoneyMap): string {
  const parts = Object.keys(map || {})
    .filter((k) => Math.round(map[k]) !== 0)
    .map((k) => fmtMoney(map[k], k));
  return parts.length ? parts.join(SP + '·' + SP) : fmtMoney(0, 'CZK');
}
