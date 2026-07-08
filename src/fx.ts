// Živé kurzy měn – načtení z veřejného API (bez klíče) + cache v AsyncStorage.
// Slouží k orientačnímu přepočtu smíšených měn do jedné (výchozí CZK).
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoneyMap } from './types';

export type Rates = Record<string, number>; // kurz vůči základní měně (CZK = 1)

const CACHE_KEY = '@babisovnik/fx-czk';
const MAX_AGE = 12 * 60 * 60 * 1000; // 12 h
const URL = 'https://open.er-api.com/v6/latest/CZK';

interface Cached { rates: Rates; at: number; }

// Načte kurzy: nejdřív z cache; když chybí nebo jsou staré, stáhne čerstvé.
// Vrací null, když se nepodaří získat vůbec nic (appka pak přepočet skryje).
export async function loadRates(): Promise<Rates | null> {
  let cached: Cached | null = null;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}

  const fresh = cached && Date.now() - cached.at < MAX_AGE;
  if (fresh && cached) return cached.rates;

  try {
    const res = await fetch(URL);
    const json = await res.json();
    if (json && json.result === 'success' && json.rates) {
      const rates: Rates = json.rates;
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ rates, at: Date.now() } as Cached)).catch(() => {});
      return rates;
    }
  } catch (e) {}

  // Síť selhala – aspoň vrátíme starou cache, je-li.
  return cached ? cached.rates : null;
}

// Přepočet částky z měny `from` do `to` (kurzy relativní ke stejné základní měně).
export function convert(amount: number, from: string, to: string, rates: Rates): number | null {
  if (from === to) return amount;
  const rf = rates[from];
  const rt = rates[to];
  if (!rf || !rt) return null;
  return amount * (rt / rf);
}

// Přepočet celé mapy { CZK: x, EUR: y } do jedné měny. null, když nějaká měna chybí.
export function convertMap(map: MoneyMap, to: string, rates: Rates | null): number | null {
  if (!rates) return null;
  let sum = 0;
  const keys = Object.keys(map || {});
  for (const k of keys) {
    const v = convert(map[k], k, to, rates);
    if (v == null) return null;
    sum += v;
  }
  return Math.round(sum);
}

// Má smysl ukazovat přibližný přepočet? (víc měn, nebo jediná měna ≠ cílová)
export function shouldApprox(map: MoneyMap, to: string): boolean {
  const keys = Object.keys(map || {});
  if (keys.length > 1) return true;
  return keys.length === 1 && keys[0] !== to;
}
