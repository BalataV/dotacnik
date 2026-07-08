// Výdaje a platby – čtení/zápis do Supabase.
// Členové se odkazují přes ID (payer_id, part_ids, from_id, to_id). Jména (payer,
// parts, from_name, to_name) se zapisují jen jako popisek; klient čte podle ID a
// překládá je na AKTUÁLNÍ jméno, takže přejmenování nepřepisuje historii.
import { supabase } from '../supabase';
import type { CurrencyCode, SplitType } from '../types';

// "Raw" výdaj tak, jak přijde z DB (členové jako id). Store si ho přeloží na jména.
export interface RawExpense {
  id: string;
  desc: string;
  amount: number;
  payerId: string | null;
  partIds: string[];
  payerName: string;     // záložní jméno, kdyby řádek nebyl zmigrovaný na id
  partNames: string[];
  photo: string | null;
  currency: CurrencyCode;
  shares: number[] | null;
  splitType: SplitType;
  category: string;
  createdAt: string | null;
}

interface ExpenseInput {
  groupId: string;
  description: string;
  amount: number;
  payer: string;          // reálné jméno (popisek, NOT NULL v DB)
  parts: string[];        // reálná jména (popisek)
  payerId: string | null; // skutečný odkaz na člena
  partIds: (string | null)[];
  photo?: string | null;
  currency?: CurrencyCode;
  shares?: number[] | null;
  splitType?: SplitType;
  category?: string;
}
type ExpenseUpdate = Omit<ExpenseInput, 'groupId'>;

interface PaymentInput {
  groupId: string;
  fromName: string;
  toName: string;
  fromId: string | null;
  toId: string | null;
  amount: number;
  currency?: CurrencyCode;
}

const SELECT = 'id, description, amount, payer, parts, payer_id, part_ids, photo, currency, shares, split_type, category, created_at';

function mapExpense(e: any): RawExpense {
  return {
    id: e.id,
    desc: e.description,
    amount: Number(e.amount),
    payerId: e.payer_id || null,
    partIds: e.part_ids || [],
    payerName: e.payer,
    partNames: e.parts || [],
    photo: e.photo || null,
    currency: (e.currency || 'CZK') as CurrencyCode,
    shares: e.shares ? e.shares.map(Number) : null,
    splitType: (e.split_type || 'equal') as SplitType,
    category: e.category || 'ostatni',
    createdAt: e.created_at || null,
  };
}

export async function fetchExpenses(groupId: string): Promise<RawExpense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select(SELECT)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapExpense);
}

// Hromadné načtení výdajů pro VÍCE skupin najednou (1 dotaz místo N) → { groupId: [výdaje] }
export async function fetchExpensesForGroups(groupIds: string[]): Promise<Record<string, RawExpense[]>> {
  if (!groupIds || !groupIds.length) return {};
  const { data, error } = await supabase
    .from('expenses')
    .select('group_id, ' + SELECT)
    .in('group_id', groupIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const byGroup: Record<string, RawExpense[]> = {};
  (data || []).forEach((e: any) => {
    (byGroup[e.group_id] = byGroup[e.group_id] || []).push(mapExpense(e));
  });
  return byGroup;
}

export async function fetchPaymentsForGroups(groupIds: string[]): Promise<Record<string, any[]>> {
  if (!groupIds || !groupIds.length) return {};
  const { data, error } = await supabase
    .from('payments')
    .select('id, group_id, from_id, to_id, from_name, to_name, amount, currency, created_at')
    .in('group_id', groupIds);
  if (error) throw error;
  const byGroup: Record<string, any[]> = {};
  (data || []).forEach((p: any) => { (byGroup[p.group_id] = byGroup[p.group_id] || []).push(p); });
  return byGroup;
}

export async function addExpense({ groupId, description, amount, payer, parts, payerId, partIds, photo, currency, shares, splitType, category }: ExpenseInput) {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      description,
      amount,
      payer,
      parts,
      payer_id: payerId,
      part_ids: partIds,
      photo: photo || null,
      currency: currency || 'CZK',
      shares: shares || null,
      split_type: splitType || 'equal',
      category: category || 'ostatni',
      created_by: u.user?.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpense(id: string, { description, amount, payer, parts, payerId, partIds, photo, currency, shares, splitType, category }: ExpenseUpdate) {
  const { error } = await supabase
    .from('expenses')
    .update({
      description, amount, payer, parts, payer_id: payerId, part_ids: partIds,
      photo: photo || null, currency: currency || 'CZK', shares: shares || null, split_type: splitType || 'equal',
      category: category || 'ostatni',
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// Záznam o provedené platbě (vyrovnání) mezi dvěma členy
export async function addPayment({ groupId, fromName, toName, fromId, toId, amount, currency }: PaymentInput) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from('payments').insert({
    group_id: groupId,
    from_name: fromName,
    to_name: toName,
    from_id: fromId,
    to_id: toId,
    amount,
    currency: currency || 'CZK',
    created_by: u.user?.id,
  });
  if (error) throw error;
}

export async function fetchPayments(groupId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('id, from_id, to_id, from_name, to_name, amount, currency, created_at')
    .eq('group_id', groupId);
  if (error) throw error;
  return data || [];
}
