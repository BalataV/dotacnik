// Testy výpočtu dluhů – pojistka proti rozbití peněžní matematiky.
import { shareOf, netFor, transfersFor, myNet, totalOwe, currenciesIn } from '../src/logic';

const group = { id: 'g', members: ['Já', 'Honza', 'Jana', 'Pavel'] };

describe('shareOf', () => {
  test('rovným dílem (shares = null)', () => {
    const e = { amount: 90, parts: ['Já', 'Honza', 'Jana'], shares: null };
    expect(shareOf(e, 'Honza')).toBeCloseTo(30);
  });
  test('konkrétní částky (shares)', () => {
    const e = { amount: 100, parts: ['Honza', 'Jana'], shares: [70, 30] };
    expect(shareOf(e, 'Honza')).toBe(70);
    expect(shareOf(e, 'Jana')).toBe(30);
  });
  test('kdo není účastník, platí 0', () => {
    const e = { amount: 100, parts: ['Honza'], shares: [100] };
    expect(shareOf(e, 'Pavel')).toBe(0);
  });
});

describe('netFor – podle cen (exact)', () => {
  test('500: Honza 200, Jana 100, Pavel 200, platil Já', () => {
    const ex = [{ currency: 'CZK', amount: 500, payer: 'Já', parts: ['Honza', 'Jana', 'Pavel'], shares: [200, 100, 200] }];
    expect(netFor(group, ex, [])).toEqual({ Já: 500, Honza: -200, Jana: -100, Pavel: -200 });
  });
});

describe('netFor – poměrově (ratio)', () => {
  test('500 v poměru 2:1:2 = 200:100:200', () => {
    const W = 5;
    const shares = [2, 1, 2].map((w) => (500 * w) / W);
    const ex = [{ currency: 'CZK', amount: 500, payer: 'Já', parts: ['Honza', 'Jana', 'Pavel'], shares }];
    expect(netFor(group, ex, [])).toEqual({ Já: 500, Honza: -200, Jana: -100, Pavel: -200 });
  });
});

describe('netFor – rovným dílem + platba', () => {
  test('400 mezi 4, pak Honza vrátí 100', () => {
    const ex = [{ currency: 'CZK', amount: 400, payer: 'Já', parts: ['Já', 'Honza', 'Jana', 'Pavel'], shares: null }];
    const pay = [{ from: 'Honza', to: 'Já', amt: 100, currency: 'CZK' }];
    const net = netFor(group, ex, pay);
    expect(net['Já']).toBe(200); // dostane 300 od ostatních − 100 už vrátil Honza
    expect(net['Honza']).toBe(0); // dlužil 100, zaplatil 100
    expect(net['Jana']).toBe(-100);
  });
});

describe('měny se nemíchají', () => {
  const ex = [
    { currency: 'CZK', amount: 100, payer: 'Já', parts: ['Já', 'Honza'], shares: null },
    { currency: 'EUR', amount: 20, payer: 'Honza', parts: ['Já', 'Honza'], shares: null },
  ];
  test('currenciesIn vrátí obě měny', () => {
    expect(currenciesIn(ex, []).sort()).toEqual(['CZK', 'EUR']);
  });
  test('CZK bilance', () => {
    expect(netFor(group, ex, [], 'CZK')).toMatchObject({ Já: 50, Honza: -50 });
  });
  test('EUR bilance', () => {
    expect(netFor(group, ex, [], 'EUR')).toMatchObject({ Já: -10, Honza: 10 });
  });
});

describe('transfersFor + totalOwe', () => {
  const groups = [group];
  const expenses = { g: [{ currency: 'CZK', amount: 300, payer: 'Honza', parts: ['Já', 'Honza', 'Jana'], shares: null }] };
  const payments = { g: [] };
  test('převody nesou měnu a směr', () => {
    const t = transfersFor(group, expenses.g, payments.g);
    expect(t.every((x) => x.currency === 'CZK')).toBe(true);
    const mine = t.find((x) => x.from === 'Já');
    expect(mine.to).toBe('Honza');
    expect(mine.amt).toBe(100);
  });
  test('totalOwe vrací mapu po měnách', () => {
    expect(totalOwe(groups, expenses, payments)).toEqual({ CZK: 100 });
  });
  test('myNet u skupiny', () => {
    expect(myNet(group, expenses.g, payments.g)).toEqual({ CZK: -100 });
  });
});
