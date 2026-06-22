// Detail skupiny – kdo komu dluží + seznam výdajů
import React from 'react';
import { View, Text, ScrollView, Share } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Avatar } from '../components/ui';
import { transfersFor, initial } from '../logic';
import { colorForMember } from '../data';
import { landingJoinUrl } from '../config';

export default function GroupDetail() {
  const c = useColors();
  const { state, actions } = useApp();
  const g = state.groups.find((x) => x.id === state.selectedGroup) || state.groups[0];
  const expenses = state.expenses[g.id] || [];
  const transfers = transfersFor(g, expenses, state.payments[g.id]);

  async function invite() {
    if (!g.shareCode) return;
    try {
      await Share.share({
        message: 'Přidej se do skupiny „' + g.name + '" v appce Čapí Dluh! 🦤\nKód: ' + g.shareCode + '\nOdkaz: ' + landingJoinUrl(g.shareCode),
      });
    } catch (e) {}
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text onPress={() => actions.navigate('overview')} style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Skupiny</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Text style={{ flex: 1, fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5, lineHeight: 30 }}>{g.name}</Text>
        {g.shareCode && (
          <Pushable onPress={invite} offset={2} radius={10}>
            <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: FONTS.display600, fontSize: 13, color: c.ink }}>📤 Pozvat</Text>
            </View>
          </Pushable>
        )}
      </View>

      <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg, marginBottom: 10 }}>Kdo komu dluží</Text>
      <View style={{ position: 'relative', marginBottom: 20 }}>
        <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 16 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, overflow: 'hidden' }}>
          {transfers.length === 0 ? (
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.muted, padding: 14 }}>Vyrovnáno – nikdo nikomu nedluží.</Text>
          ) : transfers.map((t, idx) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 13, borderBottomWidth: idx < transfers.length - 1 ? 2 : 0, borderBottomColor: 'rgba(0,0,0,0.07)' }}>
              <Avatar name={t.from} initial={initial(t.from)} color={colorForMember(t.from)} size={30} />
              <Text style={{ flex: 1, fontFamily: FONTS.body700, fontSize: 14, color: c.ink }}>{t.from} → {t.to}</Text>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 15, color: c.bad }}>{t.amt} Kč</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg, marginBottom: 10 }}>Výdaje</Text>
      {expenses.length === 0 && (
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.6, marginBottom: 6 }}>Zatím žádný výdaj – přidej první níže.</Text>
      )}
      {expenses.map((e) => (
        <Pushable key={e.id} onPress={() => actions.openExpense(e.id)} offset={3} radius={14} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12 }}>
            <Avatar name={e.payer} initial={initial(e.payer)} color={colorForMember(e.payer)} size={36} fontSize={13} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: c.ink }}>{e.desc} {e.photo ? '📷' : ''}</Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.muted }}>Platil {e.payer} · {Math.round(e.amount / e.parts.length)} Kč/os</Text>
            </View>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 17, color: c.ink }}>{e.amount} Kč</Text>
          </View>
        </Pushable>
      ))}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Pushable onPress={actions.startAdd} radius={14} style={{ flex: 1 }}>
          <View style={{ backgroundColor: c.accent2, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 15, color: '#fff' }}>+ Výdaj</Text>
          </View>
        </Pushable>
        <Pushable onPress={() => actions.navigate('settle')} radius={14} style={{ flex: 1 }}>
          <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 15, color: '#fff' }}>Vypořádat</Text>
          </View>
        </Pushable>
      </View>
    </ScrollView>
  );
}
