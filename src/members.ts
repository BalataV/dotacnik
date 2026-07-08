// Překlad člen <-> zobrazované jméno. Výdaje/platby odkazují na člena přes id;
// tady se id překládá na AKTUÁLNÍ jméno ("Já" pro přihlášeného), takže přejmenování
// nevyžaduje přepis historie.
import type { GroupMember } from './types';

const norm = (name: string, myName: string) => (name === myName ? 'Já' : name);

// id člena → zobrazované jméno. Když id chybí (nezmigrovaný řádek), použije se
// uložené jméno jako záloha (převedené na "Já", pokud je to moje jméno).
export function dispMember(
  members: GroupMember[] | undefined,
  id: string | null,
  uid: string | null,
  myName: string,
  fallbackName: string,
): string {
  if (id && members) {
    const m = members.find((x) => x.id === id);
    if (m) return m.userId === uid ? 'Já' : m.name;
  }
  return norm(fallbackName || '', myName);
}

// Zobrazované jméno → id člena (pro ukládání). "Já" → můj člen podle user_id.
export function idForMember(
  members: GroupMember[] | undefined,
  displayName: string,
  uid: string | null,
): string | null {
  if (!members) return null;
  const m = displayName === 'Já'
    ? members.find((x) => x.userId === uid)
    : members.find((x) => x.name === displayName);
  return m ? m.id : null;
}
