// Testy překladu člen <-> jméno (jádro přechodu na ID místo jmen).
import { dispMember, idForMember } from '../src/members';

const MY_UID = 'uid-me';
// Skupina: já (David), Honza, Jana
const members = [
  { id: 'm1', name: 'David', userId: MY_UID },
  { id: 'm2', name: 'Honza', userId: null },
  { id: 'm3', name: 'Jana', userId: 'uid-jana' },
];

describe('dispMember (id → zobrazované jméno)', () => {
  test('můj člen se zobrazí jako "Já"', () => {
    expect(dispMember(members, 'm1', MY_UID, 'David', 'David')).toBe('Já');
  });
  test('cizí člen se zobrazí jménem', () => {
    expect(dispMember(members, 'm2', MY_UID, 'David', 'Honza')).toBe('Honza');
  });
  test('po přejmenování člena se ID přeloží na NOVÉ jméno (historie se nepřepisuje)', () => {
    const renamed = members.map((m) => (m.id === 'm2' ? { ...m, name: 'Honzík' } : m));
    // Výdaj v DB stále nese starý fallback "Honza", ale překlad přes id dá "Honzík".
    expect(dispMember(renamed, 'm2', MY_UID, 'David', 'Honza')).toBe('Honzík');
  });
  test('chybějící id → záloha na uložené jméno', () => {
    expect(dispMember(members, null, MY_UID, 'David', 'Honza')).toBe('Honza');
    expect(dispMember(members, null, MY_UID, 'David', 'David')).toBe('Já'); // moje jméno → "Já"
  });
  test('neznámé id → záloha na jméno', () => {
    expect(dispMember(members, 'xxx', MY_UID, 'David', 'Jana')).toBe('Jana');
  });
});

describe('idForMember (zobrazované jméno → id)', () => {
  test('"Já" → můj člen podle user_id', () => {
    expect(idForMember(members, 'Já', MY_UID)).toBe('m1');
  });
  test('cizí jméno → jeho id', () => {
    expect(idForMember(members, 'Honza', MY_UID)).toBe('m2');
    expect(idForMember(members, 'Jana', MY_UID)).toBe('m3');
  });
  test('neznámé jméno → null', () => {
    expect(idForMember(members, 'Nikdo', MY_UID)).toBeNull();
  });
  test('bez seznamu členů → null (lokální režim)', () => {
    expect(idForMember(undefined, 'Honza', MY_UID)).toBeNull();
  });
});

describe('round-trip jméno → id → jméno', () => {
  test('zachová identitu i po přejmenování', () => {
    const id = idForMember(members, 'Honza', MY_UID); // m2
    const renamed = members.map((m) => (m.id === id ? { ...m, name: 'Honzík' } : m));
    expect(dispMember(renamed, id, MY_UID, 'David', 'Honza')).toBe('Honzík');
  });
});
