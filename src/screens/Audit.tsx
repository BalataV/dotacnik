// Audit NKÚ – statistiky skupiny stylizované jako vládní kontrolní závěr.
// Zahrnuje i žebříček „Sponzor večera" (kdo nejvíc platil).
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Avatar } from '../components/ui';
import { initial } from '../logic';
import { groupTotal, leaderboard, biggestExpense, expenseCount, shareByMember, mapSum, totalByCategory } from '../stats';
import { colorForMember } from '../data';
import { categoryOf } from '../categories';
import { fmtMoney, fmtMoneyMap } from '../money';
import { convertMap, shouldApprox } from '../fx';
import type { MoneyMap } from '../types';

// Vtipné tituly do žebříčku podle pořadí / částky.
function rankTitle(i: number, score: number): { medal: string; title: string } {
  if (score === 0) return { medal: '🚌', title: 'Černý pasažér' };
  if (i === 0) return { medal: '🏆', title: 'Sponzor večera' };
  if (i === 1) return { medal: '🥈', title: 'Dotační náměstek' };
  if (i === 2) return { medal: '🥉', title: 'Pokladník' };
  return { medal: '•', title: 'Řadový občan' };
}

// Průměr na hlavu z celkové mapy.
function perHead(total: MoneyMap, n: number): MoneyMap {
  const m: MoneyMap = {};
  if (n <= 0) return m;
  Object.keys(total).forEach((k) => (m[k] = Math.round(total[k] / n)));
  return m;
}

function Para({ no, label, value }: { no: string; label: string; value: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(127,127,127,0.18)' }}>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 13, color: c.muted, width: 30 }}>§ {no}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 12, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Text>
        <Text style={{ fontFamily: FONTS.display700, fontSize: 17, color: c.ink, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function Audit() {
  const c = useColors();
  const { state, actions } = useApp();
  const g = state.groups.find((x) => x.id === state.selectedGroup) || state.groups[0];
  const expenses = state.expenses[g.id] || [];

  const total = groupTotal(expenses);
  const count = expenseCount(expenses);
  const big = biggestExpense(expenses);
  const board = leaderboard(g, expenses);
  const shares = shareByMember(g, expenses);
  const cats = totalByCategory(expenses);
  const catMax = cats.reduce((m, s) => Math.max(m, s.score), 0) || 1;
  const empty = count === 0;
  const totalApprox = shouldApprox(total, 'CZK') ? convertMap(total, 'CZK', state.fxRates) : null;
  const totalText = fmtMoneyMap(total) + (totalApprox != null ? ' (≈ ' + fmtMoney(totalApprox, 'CZK') + ')' : '');
  const caseNo = (g.id || '0000').replace(/[^0-9a-zA-Z]/g, '').slice(-4).toUpperCase() || '0000';

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text onPress={() => actions.openGroup(g.id)} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Skupina</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5, marginBottom: 14 }}>📋 Audit NKÚ</Text>

      {/* Dokument kontrolního závěru */}
      <View style={{ position: 'relative', marginBottom: 18 }}>
        <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 18 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, overflow: 'hidden' }}>
          {/* hlavička dokumentu */}
          <View style={{ backgroundColor: c.ink, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 14, color: c.card, letterSpacing: 0.3 }}>NEJVYŠŠÍ KONTROLNÍ ÚŘAD</Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: c.card, opacity: 0.8 }}>Kontrolní závěr č. j. NKÚ/{caseNo}/26</Text>
            </View>
            <View style={{ transform: [{ rotate: '-9deg' }], borderWidth: 2.5, borderColor: c.bad, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 12, color: c.bad, letterSpacing: 0.5 }}>PROVĚŘENO</Text>
            </View>
          </View>

          <View style={{ paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 12, color: c.muted }}>Kontrolovaný subjekt</Text>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 18, color: c.ink }}>{g.name}</Text>
          </View>

          {empty ? (
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.muted, paddingHorizontal: 14, paddingBottom: 16 }}>
              Žádné prostředky k prověření. Kontrola pozastavena. Makáme.
            </Text>
          ) : (
            <>
              <Para no="1" label="Celkový objem prostředků" value={totalText} />
              <Para no="2" label="Počet proplacených transakcí" value={String(count)} />
              <Para no="3" label="Průměr na hlavu" value={fmtMoneyMap(perHead(total, g.members.length))} />
              {big && <Para no="4" label="Největší jednorázová položka" value={big.desc + ' · ' + fmtMoney(big.amount, big.currency)} />}
            </>
          )}
        </View>
      </View>

      {!empty && cats.length > 0 && (
        <>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: c.onbg, marginBottom: 10 }}>📊 Struktura výdajů</Text>
          <View style={{ position: 'relative', marginBottom: 18 }}>
            <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 16 }} />
            <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, padding: 14 }}>
              {cats.map((slice, i) => {
                const cat = categoryOf(slice.key);
                const pct = Math.round((slice.score / catMax) * 100);
                return (
                  <View key={slice.key} style={{ marginBottom: i < cats.length - 1 ? 12 : 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: c.ink }}>{cat.icon} {cat.label}</Text>
                      <Text style={{ fontFamily: FONTS.display700, fontSize: 13, color: c.ink }}>{fmtMoneyMap(slice.total)}</Text>
                    </View>
                    <View style={{ height: 12, borderRadius: 6, backgroundColor: c.bg2, borderWidth: 2, borderColor: c.ink, overflow: 'hidden' }}>
                      <View style={{ width: (pct + '%') as any, height: '100%', backgroundColor: cat.color }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}

      {!empty && (
        <>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: c.onbg, marginBottom: 10 }}>🏆 Žebříček sponzorů</Text>
          {board.map((row, i) => {
            const rt = rankTitle(i, row.score);
            const isTop = i === 0 && row.score > 0;
            return (
              <View key={row.name} style={{ position: 'relative', marginBottom: 10 }}>
                <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 14 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: isTop ? c.bg2 : c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12 }}>
                  <Text style={{ fontFamily: FONTS.display700, fontSize: 18, width: 26, textAlign: 'center' }}>{rt.medal}</Text>
                  <Avatar name={row.name} initial={initial(row.name)} color={colorForMember(row.name, i)} size={36} fontSize={13} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: c.ink }} numberOfLines={1}>{row.name}</Text>
                    <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.muted }}>{rt.title} · spotřeboval {fmtMoneyMap(shares[row.name] || {}) || '0'}</Text>
                  </View>
                  <Text style={{ fontFamily: FONTS.display700, fontSize: 16, color: row.score > 0 ? c.good : c.muted }}>{fmtMoneyMap(row.paid) || fmtMoney(0, 'CZK')}</Text>
                </View>
              </View>
            );
          })}

          <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.onbg, opacity: 0.6, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>
            Kontrolu provedl revizní orgán. Pochybení nebylo shledáno.{'\n'}My tam ty peníze máme. Sorry jako.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
