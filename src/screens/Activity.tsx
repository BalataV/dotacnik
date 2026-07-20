// Historie aktivit skupiny – časová osa výdajů a vyrovnání.
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Avatar } from '../components/ui';
import { initial } from '../logic';
import { colorForMember } from '../data';
import { categoryOf } from '../categories';
import { activityFeed, whenLabel } from '../activity';
import { fmtMoney } from '../money';

export default function Activity() {
  const c = useColors();
  const { state, actions } = useApp();
  const g = state.groups.find((x) => x.id === state.selectedGroup) || state.groups[0];
  const feed = activityFeed(state.expenses[g.id], state.payments[g.id]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <Text onPress={() => actions.openGroup(g.id)} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Skupina</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5, marginBottom: 14 }}>🕓 Historie</Text>

      {/* Parta – stav připojení členů (jen cloud: memberList nese userId) */}
      {g.memberList && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg, marginBottom: 10 }}>Parta</Text>
          <View style={{ position: 'relative' }}>
            <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 16 }} />
            <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, overflow: 'hidden' }}>
              {g.memberList.map((m, i) => {
                const name = m.userId === state.meUid ? 'Já' : m.name;
                const joined = !!m.userId;
                return (
                  <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 13, borderTopWidth: i === 0 ? 0 : 2, borderTopColor: 'rgba(127,127,127,0.15)', opacity: joined ? 1 : 0.6 }}>
                    <Avatar name={name} initial={initial(name)} color={colorForMember(name)} size={30} />
                    <Text style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 14, color: c.ink }} numberOfLines={1}>{name}</Text>
                    <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: joined ? c.good : c.muted }}>
                      {joined ? '✅ Připojeno' : '⏳ Zatím bez appky'}
                    </Text>
                  </View>
                );
              })}
              {g.memberList.some((m) => !m.userId) && g.shareCode && (
                <View style={{ paddingHorizontal: 13, paddingVertical: 9, borderTopWidth: 2, borderTopColor: 'rgba(127,127,127,0.15)', backgroundColor: c.bg2 }}>
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.onbg }}>Pozvi je kódem <Text style={{ fontFamily: FONTS.display700 }}>{g.shareCode}</Text> — najdou ho i pod 📤 Pozvat ve skupině.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {g.memberList && <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg, marginBottom: 10 }}>Události</Text>}
      {feed.length === 0 ? (
        <View style={{ position: 'relative' }}>
          <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 18 }} />
          <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, padding: 22, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 17, color: c.ink, textAlign: 'center' }}>Zatím se nic nestalo</Text>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.muted, marginTop: 6, textAlign: 'center' }}>Přidej výdaj a začne se psát historie.</Text>
          </View>
        </View>
      ) : feed.map((it) => {
        const isPay = it.kind === 'payment';
        const cat = categoryOf(it.category);
        return (
          <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 11 }}>
            {/* ikona události */}
            {isPay ? (
              <Avatar name={it.actor} initial={initial(it.actor)} color={colorForMember(it.actor)} size={38} fontSize={14} />
            ) : (
              <View style={{ width: 38, height: 38, borderRadius: 11, borderWidth: 2, borderColor: c.ink, backgroundColor: cat.color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 19 }}>{cat.icon}</Text>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              {isPay ? (
                <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: c.onbg }} numberOfLines={2}>
                  <Text style={{ color: c.good }}>{it.actor}</Text> vyrovnal{it.actor === 'Já' ? 'i jsme' : ''} dluh u <Text style={{ fontFamily: FONTS.display600 }}>{it.counterparty}</Text>
                </Text>
              ) : (
                <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: c.onbg }} numberOfLines={2}>
                  <Text style={{ fontFamily: FONTS.display600 }}>{it.actor}</Text> přidal{it.actor === 'Já' ? 'i jsme' : ''} výdaj „{it.desc}"
                </Text>
              )}
              <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.muted }}>{whenLabel(it.when)}</Text>
            </View>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 15, color: isPay ? c.good : c.ink }}>{(isPay ? '↩ ' : '') + fmtMoney(it.amount, it.currency)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
