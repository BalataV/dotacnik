// Kategorie výdajů – ikona (emoji), popisek a barva. Klíč se ukládá do DB.
export interface Category { key: string; label: string; icon: string; color: string; }

export const CATEGORIES: Category[] = [
  { key: 'jidlo', label: 'Jídlo a pití', icon: '🍔', color: '#FF8A3D' },
  { key: 'nakup', label: 'Nákupy', icon: '🛒', color: '#1D5FD8' },
  { key: 'doprava', label: 'Doprava', icon: '🚗', color: '#1FA06A' },
  { key: 'bydleni', label: 'Bydlení', icon: '🏠', color: '#8B5CF6' },
  { key: 'zabava', label: 'Zábava', icon: '🎉', color: '#E23B2E' },
  { key: 'ubytovani', label: 'Ubytování', icon: '🏨', color: '#0EA5A0' },
  { key: 'ostatni', label: 'Ostatní', icon: '🧾', color: '#7A839A' },
];

export const DEFAULT_CATEGORY = 'ostatni';

const BY_KEY: Record<string, Category> = CATEGORIES.reduce((m, c) => { m[c.key] = c; return m; }, {} as Record<string, Category>);

// Vrátí kategorii podle klíče; pro neznámý/prázdný klíč „Ostatní".
export function categoryOf(key: string | null | undefined): Category {
  return BY_KEY[key || ''] || BY_KEY[DEFAULT_CATEGORY];
}
