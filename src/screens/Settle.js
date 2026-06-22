// Vypořádání – seznam mých dluhů s možností "zacvakat"
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Avatar } from '../components/ui';
import { myAllTransfers, totalOwe, initial } from '../logic';
import { colorForMember } from '../data';

export default function Settle() {
  const c = useColors();
  const { state, actions } = useApp();
  const list = myAllTransfers(state.groups, state.expenses, state.payments);
  const owe = totalOwe(state.groups, state.expenses, state.payments);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text onPress={() => actions.navigate('overview')} style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Zpět</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5 }}>Vypořádání</Text>
      <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: c.onbg, opacity: 0.8, marginBottom: 18 }}>
        {owe > 0 ? 'Dlužíš celkem ' + owe + ' Kč' : 'Hotovo! Jsi vyrovnaný.'}
      </Text>

      {list.length === 0 ? (
        <Pushable radius={18}>
          <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 20, color: c.ink }}>Jsi vyrovnaný!</Text>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.muted, marginTop: 6 }}>Jsme premianti.</Text>
          </View>
        </Pushable>
      ) : list.map((d) => (
        <View key={d.id} style={{ position: 'relative', marginBottom: 12 }}>
          <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 16 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, padding: 13 }}>
            <Avatar name={d.to} initial={initial(d.to)} color={colorForMember(d.to)} size={40} fontSize={14} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: c.ink }}>Zaplatit {d.to}</Text>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 20, color: c.bad }}>{d.amt} Kč</Text>
            </View>
            <Pushable onPress={() => actions.payDebt(d)} offset={3} radius={12}>
              <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16 }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: '#fff' }}>Zacvakat</Text>
              </View>
            </Pushable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
