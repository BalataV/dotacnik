// Skupiny a členové – čtení/zápis do Supabase
import { supabase } from '../supabase';
import { colorForMember } from '../data';

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Načte všechny skupiny, kterých jsem členem, včetně členů (s user_id pro rozpoznání "mě")
export async function fetchGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, currency, share_code, archived, group_members(name, color, user_id, role)')
    .eq('archived', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((g) => ({
    id: g.id,
    name: g.name,
    currency: g.currency,
    shareCode: g.share_code,
    members: (g.group_members || []).map((m) => ({ name: m.name, userId: m.user_id })),
  }));
}

// Vytvoří skupinu a vloží členy; "meName" je reálné jméno přihlášeného (admin)
export async function createGroup(name, memberNames, meName) {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  const code = randomCode();

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, currency: 'CZK', share_code: code, created_by: userId })
    .select()
    .single();
  if (error) throw error;

  const rows = memberNames.map((n, i) => ({
    group_id: group.id,
    name: n,
    color: colorForMember(n, i),
    user_id: n === meName ? userId : null,
    role: n === meName ? 'admin' : 'member',
  }));
  const { error: mErr } = await supabase.from('group_members').insert(rows);
  if (mErr) throw mErr;

  return { id: group.id, name: group.name, shareCode: code };
}

// Připojení do skupiny pomocí sdíleného kódu (z odkazu)
// Volá serverovou funkci join_group_by_code (viz supabase/schema.sql)
export async function joinGroupByCode(code) {
  const { data, error } = await supabase.rpc('join_group_by_code', { code });
  if (error) throw new Error('Skupina s tímto kódem nenalezena.');
  return data; // id skupiny
}

export async function archiveGroup(id) {
  const { error } = await supabase.from('groups').update({ archived: true }).eq('id', id);
  if (error) throw error;
}
