// Přehled – souhrn dluhů a seznam skupin
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Avatar } from '../components/ui';
import { myNet, initial, totalOwe, totalOwed } from '../logic';
import { colorForMember } from '../data';
import { fmtMoney, fmtMoneyMap } from '../money';
import { convertMap, shouldApprox } from '../fx';

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  const c = useColors();
  return (
    <Pushable offset={3} radius={16} style={{ flex: 1 }}>
      <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 13 }}>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
        <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color }}>{value}</Text>
        {!!sub && <Text style={{ fontFamily: FONTS.body800, fontSize: 12, color: c.muted, marginTop: 1 }}>{sub}</Text>}
      </View>
    </Pushable>
  );
}

export default function Overview() {
  const c = useColors();
  const { state, actions } = useApp();
  const owe = totalOwe(state.groups, state.expenses, state.payments);
  const owed = totalOwed(state.groups, state.expenses, state.payments);
  // Orientační přepočet smíšených měn do Kč (živý kurz)
  const oweApprox = shouldApprox(owe, 'CZK') ? convertMap(owe, 'CZK', state.fxRates) : null;
  const owedApprox = shouldApprox(owed, 'CZK') ? convertMap(owed, 'CZK', state.fxRates) : null;
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await actions.refreshAll(true); // force – pull-to-refresh obejde throttle
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} colors={[c.accent]} />}
    >
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        <StatCard label="Dlužíš" value={fmtMoneyMap(owe)} color={c.bad} sub={oweApprox != null ? '≈ ' + fmtMoney(oweApprox, 'CZK') : undefined} />
        <StatCard label="Dostaneš" value={fmtMoneyMap(owed)} color={c.good} sub={owedApprox != null ? '≈ ' + fmtMoney(owedApprox, 'CZK') : undefined} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontFamily: FONTS.display600, fontSize: 21, color: c.onbg }}>Tvoje skupiny</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pushable onPress={actions.startJoin} offset={2} radius={10}>
            <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: c.ink }}>Připojit</Text>
            </View>
          </Pushable>
          <Pushable onPress={actions.startCreateGroup} offset={2} radius={10}>
            <View style={{ backgroundColor: c.accent2, borderWidth: 3, borderColor: c.ink, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 13 }}>
              <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: '#fff' }}>+ Nová</Text>
            </View>
          </Pushable>
        </View>
      </View>

      {state.groups.length === 0 && (
        <Pushable radius={18}>
          <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 19, color: c.ink, textAlign: 'center' }}>Zatím nejsi součástí koncernu</Text>
          </View>
        </Pushable>
      )}

      {state.groups.map((g) => {
        const nm = myNet(g, state.expenses[g.id], state.payments[g.id]);
        const keys = Object.keys(nm);
        let netText, netColor;
        if (!keys.length) { netText = 'Vyrovnáno'; netColor = c.muted; }
        else if (keys.length === 1) {
          const k = keys[0]; const n = nm[k];
          netText = (n < 0 ? 'Dlužíš ' : 'Dostaneš ') + fmtMoney(Math.abs(n), k);
          netColor = n < 0 ? c.bad : c.good;
        } else {
          netText = keys.map((k) => (nm[k] < 0 ? '−' : '+') + fmtMoney(Math.abs(nm[k]), k)).join('  ');
          netColor = c.ink;
        }
        return (
          <Pushable key={g.id} onPress={() => actions.openGroup(g.id)} radius={18} style={{ marginBottom: 14 }}>
            <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: c.ink, marginBottom: 9 }}>{g.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {g.members.map((m, i) => (
                    <View key={m} style={{ marginRight: -7 }}>
                      <Avatar name={m} initial={initial(m)} color={colorForMember(m, i)} size={28} />
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: FONTS.display700, fontSize: 16, color: netColor }}>{netText}</Text>
                <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: c.muted, marginTop: 2 }}>›</Text>
              </View>
            </View>
          </Pushable>
        );
      })}
    </ScrollView>
  );
}
