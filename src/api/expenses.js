// Výdaje a platby – čtení/zápis do Supabase
import { supabase } from '../supabase';

export async function fetchExpenses(groupId) {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, description, amount, payer, parts, photo, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((e) => ({
    id: e.id,
    desc: e.description,
    amount: Number(e.amount),
    payer: e.payer,
    parts: e.parts || [],
    photo: e.photo || null,
  }));
}

export async function addExpense({ groupId, description, amount, payer, parts, photo }) {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      description,
      amount,
      payer,
      parts,
      photo: photo || null,
      created_by: u.user?.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// Záznam o provedené platbě (vyrovnání) mezi dvěma členy
export async function addPayment({ groupId, fromName, toName, amount }) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from('payments').insert({
    group_id: groupId,
    from_name: fromName,
    to_name: toName,
    amount,
    created_by: u.user?.id,
  });
  if (error) throw error;
}

export async function fetchPayments(groupId) {
  const { data, error } = await supabase
    .from('payments')
    .select('id, from_name, to_name, amount, created_at')
    .eq('group_id', groupId);
  if (error) throw error;
  return data || [];
}
