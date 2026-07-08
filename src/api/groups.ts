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
    .select('id, name, currency, share_code, archived, group_members(id, name, color, user_id, role)')
    .eq('archived', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((g: any) => ({
    id: g.id,
    name: g.name,
    currency: g.currency,
    shareCode: g.share_code,
    members: (g.group_members || []).map((m: any) => ({ id: m.id, name: m.name, userId: m.user_id })),
  }));
}

// Vytvoří skupinu a vloží členy; "meName" je reálné jméno přihlášeného (admin)
export async function createGroup(name: string, memberNames: string[], meName: string) {
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  const code = randomCode();

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, currency: 'CZK', share_code: code, created_by: userId })
    .select()
    .single();
  if (error) throw error;

  const rows = memberNames.map((n: string, i: number) => ({
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
export async function joinGroupByCode(code: string) {
  const { data, error } = await supabase.rpc('join_group_by_code', { code });
  if (error) throw new Error('Skupina s tímto kódem nenalezena.');
  return data; // id skupiny
}

// Náhled skupiny podle kódu – kdo už ve skupině je (pro výběr "kdo jsem")
// Vrací { groupId, groupName, members: [{ name, claimed, isMe }] }  nebo null
export async function groupPreview(code: string) {
  const { data, error } = await supabase.rpc('group_preview', { code });
  if (error) throw new Error('Skupina s tímto kódem nenalezena.');
  if (!data || !data.length) return null;
  return {
    groupId: data[0].group_id,
    groupName: data[0].group_name,
    members: data.map((r: any) => ({ name: r.member_name, claimed: r.claimed, isMe: r.is_me })),
  };
}

// Připojení s výběrem jména: buď zaberu volnou roli (claimName), nebo přidám nové jméno (newName)
export async function joinGroupChoose(code: string, claimName: string | null, newName: string | null) {
  const { data, error } = await supabase.rpc('join_group_choose', {
    code, claim_name: claimName || null, new_name: newName || null,
  });
  if (error) throw new Error(error.message || 'Připojení selhalo');
  return data; // id skupiny
}

export async function archiveGroup(id: string) {
  const { error } = await supabase.from('groups').update({ archived: true }).eq('id', id);
  if (error) throw error;
}
