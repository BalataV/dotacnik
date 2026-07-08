// Testy formátování částek a měn.
import { fmtMoney, fmtMoneyMap, curSymbol } from '../src/money';

describe('fmtMoney', () => {
  test('oddělovač tisíců mezerou + symbol za částkou', () => {
    expect(fmtMoney(12345, 'CZK')).toBe('12 345 Kč');
    expect(fmtMoney(30, 'EUR')).toBe('30 €');
    expect(fmtMoney(1500, 'USD')).toBe('1 500 $');
  });
  test('zaokrouhlí na celé', () => {
    expect(fmtMoney(99.6, 'CZK')).toBe('100 Kč');
  });
  test('výchozí měna CZK', () => {
    expect(fmtMoney(50)).toBe('50 Kč');
  });
});

describe('fmtMoneyMap', () => {
  test('spojí nenulové měny, nuly vynechá', () => {
    expect(fmtMoneyMap({ CZK: 1200, EUR: 30, USD: 0 })).toBe('1 200 Kč · 30 €');
  });
  test('prázdná mapa = 0 Kč', () => {
    expect(fmtMoneyMap({})).toBe('0 Kč');
  });
});

describe('curSymbol', () => {
  test('známé měny', () => {
    expect(curSymbol('CZK')).toBe('Kč');
    expect(curSymbol('EUR')).toBe('€');
    expect(curSymbol('USD')).toBe('$');
  });
});
