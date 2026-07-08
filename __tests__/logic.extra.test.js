// Široká sada testů peněžní logiky – hraniční případy, měny, platby, vyrovnání.
import {
  initial, shareOf, currenciesIn, netFor, transfersFor,
  myAllTransfers, myOwedTransfers, totalOwe, totalOwed, hasAny, myNet,
} from '../src/logic';

const G = (members) => ({ id: 'g', members });
const exp = (o) => ({ currency: 'CZK', shares: null, ...o });

describe('initial()', () => {
  test('"Já" zůstává "Já"', () => expect(initial('Já')).toBe('Já'));
  test('jméno → první písmeno velké', () => expect(initial('karel')).toBe('K'));
  test('prázdné → ?', () => expect(initial('')).toBe('?'));
});

describe('netFor – základ a hrany', () => {
  test('prázdná skupina = samé nuly', () => {
    expect(netFor(G(['Já', 'A']), [], [])).toEqual({ Já: 0, A: 0 });
  });
  test('null group → {}', () => {
    expect(netFor(null, [], [])).toEqual({});
  });
  test('plátce není účastník → dluží mu celá skupina', () => {
    const ex = [exp({ amount: 100, payer: 'Já', parts: ['A', 'B'] })];
    expect(netFor(G(['Já', 'A', 'B']), ex, [])).toEqual({ Já: 100, A: -50, B: -50 });
  });
  test('plátce je i účastník', () => {
    const ex = [exp({ amount: 100, payer: 'Já', parts: ['Já', 'A'] })];
    expect(netFor(G(['Já', 'A']), ex, [])).toEqual({ Já: 50, A: -50 });
  });
});

describe('platby (vyrovnání) snižují dluh', () => {
  const group = G(['Já', 'A']);
  const ex = [exp({ amount: 100, payer: 'Já', parts: ['Já', 'A'] })]; // A dluží 50
  test('plná platba → vyrovnáno', () => {
    const pay = [{ from: 'A', to: 'Já', amt: 50, currency: 'CZK' }];
    expect(netFor(group, ex, pay)).toEqual({ Já: 0, A: 0 });
  });
  test('přeplatek → obrátí znaménko', () => {
    const pay = [{ from: 'A', to: 'Já', amt: 80, currency: 'CZK' }];
    expect(netFor(group, ex, pay)).toEqual({ Já: -30, A: 30 });
  });
  test('částečná platba', () => {
    const pay = [{ from: 'A', to: 'Já', amt: 20, currency: 'CZK' }];
    expect(netFor(group, ex, pay)).toEqual({ Já: 30, A: -30 });
  });
});

describe('shareOf – nerovné dělení', () => {
  test('podle cen (exact)', () => {
    const e = exp({ amount: 100, payer: 'Já', parts: ['A', 'B'], shares: [70, 30] });
    expect(shareOf(e, 'A')).toBe(70);
    expect(shareOf(e, 'B')).toBe(30);
  });
  test('poměrově se promítne do netFor', () => {
    const e = exp({ amount: 500, payer: 'Já', parts: ['A', 'B', 'C'], shares: [200, 100, 200] });
    expect(netFor(G(['Já', 'A', 'B', 'C']), [e], [])).toEqual({ Já: 500, A: -200, B: -100, C: -200 });
  });
});

describe('transfersFor – minimalizace převodů', () => {
  test('1 plátce, 3 účastníci → 2 převody na plátce', () => {
    const ex = [exp({ amount: 90, payer: 'Já', parts: ['Já', 'A', 'B'] })];
    const t = transfersFor(G(['Já', 'A', 'B']), ex, []);
    expect(t).toHaveLength(2);
    expect(t.every((x) => x.to === 'Já' && x.amt === 30)).toBe(true);
  });
  test('vzájemné výdaje se vyruší (vyrovnáno)', () => {
    const ex = [
      exp({ amount: 60, payer: 'Já', parts: ['Já', 'A'] }), // A dluží Já 30
      exp({ amount: 60, payer: 'A', parts: ['Já', 'A'] }),  // Já dluží A 30
    ];
    expect(transfersFor(G(['Já', 'A']), ex, [])).toHaveLength(0);
  });
  test('jeden dlužník platí více věřitelům (min. počet převodů)', () => {
    const ex = [
      exp({ amount: 30, payer: 'Já', parts: ['Já', 'A', 'B'] }), // Já +20, A -10, B -10
      exp({ amount: 30, payer: 'B', parts: ['Já', 'A', 'B'] }),  // B +20, Já -10, A -10
    ];
    // Výsledek: Já +10, A -20, B +10 → A zaplatí Já 10 a B 10 (2 převody)
    const t = transfersFor(G(['Já', 'A', 'B']), ex, []);
    expect(t).toHaveLength(2);
    expect(t.every((x) => x.from === 'A')).toBe(true);
    expect(t.reduce((s, x) => s + x.amt, 0)).toBe(20);
  });
  test('převod nese měnu a v převodech se peníze nevytvoří ani neztratí', () => {
    const ex = [exp({ amount: 100, payer: 'Já', parts: ['Já', 'A', 'B', 'C', 'D'] })];
    const t = transfersFor(G(['Já', 'A', 'B', 'C', 'D']), ex, []);
    const sumFrom = t.reduce((s, x) => s + x.amt, 0);
    expect(t.every((x) => x.currency === 'CZK')).toBe(true);
    expect(sumFrom).toBeGreaterThan(0); // někdo někomu dluží
  });
});

describe('více měn', () => {
  const group = G(['Já', 'A']);
  const ex = [
    exp({ amount: 100, payer: 'Já', parts: ['Já', 'A'] }),
    exp({ currency: 'EUR', amount: 20, payer: 'A', parts: ['Já', 'A'], shares: null }),
  ];
  test('currenciesIn vrátí obě', () => {
    expect(currenciesIn(ex, []).sort()).toEqual(['CZK', 'EUR']);
  });
  test('CZK a EUR se počítají odděleně', () => {
    expect(netFor(group, ex, [], 'CZK')).toEqual({ Já: 50, A: -50 });
    expect(netFor(group, ex, [], 'EUR')).toEqual({ Já: -10, A: 10 });
  });
  test('transfersFor vrátí převod v každé měně', () => {
    const t = transfersFor(group, ex, []);
    const curr = t.map((x) => x.currency).sort();
    expect(curr).toEqual(['CZK', 'EUR']);
  });
  test('myNet po měnách', () => {
    expect(myNet(group, ex, [])).toEqual({ CZK: 50, EUR: -10 });
  });
});

describe('souhrny napříč skupinami', () => {
  const groups = [G(['Já', 'A']), { id: 'g2', members: ['Já', 'B'] }];
  const expenses = {
    g: [exp({ amount: 100, payer: 'A', parts: ['Já', 'A'] })],  // Já dluží A 50
    g2: [exp({ amount: 200, payer: 'Já', parts: ['Já', 'B'] })], // B dluží Já 100
  };
  const payments = { g: [], g2: [] };
  test('totalOwe = co dlužím (mapa měn)', () => {
    expect(totalOwe(groups, expenses, payments)).toEqual({ CZK: 50 });
  });
  test('totalOwed = co mi dluží', () => {
    expect(totalOwed(groups, expenses, payments)).toEqual({ CZK: 100 });
  });
  test('myAllTransfers / myOwedTransfers', () => {
    expect(myAllTransfers(groups, expenses, payments)).toHaveLength(1);
    expect(myOwedTransfers(groups, expenses, payments)).toHaveLength(1);
  });
  test('hasAny', () => {
    expect(hasAny({ CZK: 50 })).toBe(true);
    expect(hasAny({ CZK: 0 })).toBe(false);
    expect(hasAny({})).toBe(false);
  });
});
