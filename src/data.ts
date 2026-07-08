// Výchozí ukázková data – přesně podle Claude Design (Babišovník.dc.html)
import type { Group, Expense } from './types';

// Barva avataru podle jména člena
export const MEMBER_COLORS: Record<string, string> = {
  'Já': '#1D5FD8',
  'Ota': '#FF5A36',
  'Pepa': '#1FA06A',
  'Jana': '#C026D3',
  'Marian': '#F59E0B',
  'Faltýnek': '#0EA5E9',
};

// Náhradní paleta pro nově přidané členy
const FALLBACK_COLORS = ['#1D5FD8', '#FF5A36', '#1FA06A', '#C026D3', '#F59E0B', '#0EA5E9', '#8B5CF6', '#EC4899'];

export function colorForMember(name: string, index = 0): string {
  return MEMBER_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// Prázdný start – nový uživatel zatím nemá žádné skupiny ani výdaje
export const INITIAL_GROUPS: Group[] = [];

export const INITIAL_EXPENSES: Record<string, Expense[]> = {};
