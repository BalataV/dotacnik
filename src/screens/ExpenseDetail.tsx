// Detail výdaje – popis, částka, kdo platil, rozdělení a foto účtenky
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Avatar } from '../components/ui';
import { initial, shareOf } from '../logic';
import { colorForMember } from '../data';
import { categoryOf } from '../categories';
import { fmtMoney } from '../money';

export default function ExpenseDetail() {
  const c = useColors();
  const { state, actions } = useApp();
  const g = state.groups.find((x) => x.id === state.selectedGroup);
  const list = (state.selectedGroup ? state.expenses[state.selectedGroup] : []) || [];
  const e = list.find((x) => x.id === state.selectedExpense);

  if (!e) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text onPress={() => actions.navigate('group')} style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15 }}>‹ Zpět</Text>
        <Text style={{ fontFamily: FONTS.body700, color: c.onbg, marginTop: 12 }}>Výdaj nenalezen.</Text>
      </ScrollView>
    );
  }

  const uneven = !!(e.shares && e.shares.length === e.parts.length); // nerovné dělení
  const splitLabel = e.splitType === 'ratio' ? 'Poměrově' : e.splitType === 'exact' ? 'Podle cen' : 'Rovným dílem';

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text onPress={() => actions.navigate('group')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Zpět</Text>

      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5 }}>{e.desc}</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 34, color: c.onbg, marginBottom: 8 }}>{fmtMoney(e.amount, e.currency)}</Text>
      <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: categoryOf(e.category).color, borderWidth: 2, borderColor: c.ink, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 11, marginBottom: 16 }}>
        <Text style={{ fontSize: 14 }}>{categoryOf(e.category).icon}</Text>
        <Text style={{ fontFamily: FONTS.display600, fontSize: 13, color: '#fff' }}>{categoryOf(e.category).label}</Text>
      </View>

      {/* Foto účtenky */}
      {e.photo && (
        <View style={{ position: 'relative', marginBottom: 16 }}>
          <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 16 }} />
          <Image source={{ uri: e.photo }} style={{ width: '100%', height: 240, borderRadius: 16, borderWidth: 3, borderColor: c.ink }} contentFit="cover" transition={150} cachePolicy="memory-disk" />
        </View>
      )}

      {/* Kdo platil */}
      <View style={{ position: 'relative', marginBottom: 12 }}>
        <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 14 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, padding: 12 }}>
          <Avatar name={e.payer} initial={initial(e.payer)} color={colorForMember(e.payer)} size={36} fontSize={13} />
          <Text style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 15, color: c.ink }}>Platil {e.payer}</Text>
        </View>
      </View>

      {/* Rozdělení */}
      <View style={{ position: 'relative', marginBottom: 20 }}>
        <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 14 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, overflow: 'hidden' }}>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, padding: 12, paddingBottom: 8 }}>Rozděleno mezi · {splitLabel}{!uneven ? ' · ' + fmtMoney(e.amount / e.parts.length, e.currency) + '/os' : ''}</Text>
          {e.parts.map((p, idx) => (
            <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 2, borderTopColor: 'rgba(0,0,0,0.07)' }}>
              <Avatar name={p} initial={initial(p)} color={colorForMember(p, idx)} size={28} />
              <Text style={{ flex: 1, fontFamily: FONTS.body700, fontSize: 14, color: c.ink }}>{p}</Text>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 14, color: c.ink }}>{fmtMoney(shareOf(e, p), e.currency)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pushable onPress={() => actions.startEdit(e.id)} radius={14} style={{ marginBottom: 10 }}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: '#fff' }}>✏️ Upravit výdaj</Text>
        </View>
      </Pushable>

      <Pushable onPress={() => actions.deleteExpense(e.id)} radius={14}>
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: c.bad }}>Smazat výdaj</Text>
        </View>
      </Pushable>
    </ScrollView>
  );
}
