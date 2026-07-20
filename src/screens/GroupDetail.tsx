// Detail skupiny – kdo komu dluží + seznam výdajů
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Share, Alert, RefreshControl } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Avatar } from '../components/ui';
import { transfersFor, initial } from '../logic';
import { colorForMember } from '../data';
import { fmtMoney } from '../money';
import { categoryOf } from '../categories';
import { landingJoinUrl } from '../config';
import Field from '../components/Field';

// Hledání bez ohledu na diakritiku a velikost písmen ("rizek" najde "Řízek")
function foldText(s: string): string {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function GroupDetail() {
  const c = useColors();
  const { state, actions } = useApp();
  const g = state.groups.find((x) => x.id === state.selectedGroup) || state.groups[0];
  const expenses = state.expenses[g.id] || [];
  const transfers = transfersFor(g, expenses, state.payments[g.id]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const cardRef = useRef<View>(null);

  // Filtr výdajů: hledá v popisu, plátci i názvu kategorie
  const q = foldText(query.trim());
  const shownExpenses = q
    ? expenses.filter((e) =>
        foldText(e.desc).includes(q) || foldText(e.payer).includes(q) || foldText(categoryOf(e.category).label).includes(q))
    : expenses;

  // Sdílení kartičky „kdo komu dluží" jako obrázku
  async function shareCard() {
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else await Share.share({ url: uri });
    } catch (e) {
      actions.showToast('Sdílení se nepovedlo');
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await actions.refreshGroup(g.id);
    setRefreshing(false);
  }

  async function invite() {
    if (!g.shareCode) return;
    try {
      await Share.share({
        message: 'Přidej se do skupiny „' + g.name + '" v appce Dotačníček! 🦤\nKód: ' + g.shareCode + '\nOdkaz: ' + landingJoinUrl(g.shareCode),
      });
    } catch (e) {}
  }

  function confirmDelete() {
    Alert.alert(
      'Smazat skupinu?',
      'Skupina „' + g.name + '" i všechny její výdaje zmizí všem členům. Tuto akci nelze vrátit.',
      [
        { text: 'Zrušit', style: 'cancel' },
        { text: 'Smazat', style: 'destructive', onPress: () => actions.deleteGroup(g.id) },
      ],
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} colors={[c.accent]} />}
    >
      <Text onPress={() => actions.navigate('overview')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Skupiny</Text>
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

      {/* Parta – kdo už je v appce připojený (userId), kdo zatím čeká */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: g.memberList?.some((m) => !m.userId) ? 8 : 18 }}>
        {(g.memberList
          ? g.memberList.map((m) => ({ key: m.id, name: m.userId === state.meUid ? 'Já' : m.name, joined: !!m.userId as boolean | undefined }))
          : g.members.map((n) => ({ key: n, name: n, joined: undefined as boolean | undefined }))
        ).map((m) => (
          <View key={m.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.card, borderWidth: 2, borderColor: c.ink, borderRadius: 20, paddingVertical: 5, paddingLeft: 6, paddingRight: 10, opacity: m.joined === false ? 0.55 : 1 }}>
            <Avatar name={m.name} initial={initial(m.name)} color={colorForMember(m.name)} size={24} fontSize={10} />
            <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: c.ink }}>{m.name}</Text>
            {m.joined === true && <Text style={{ fontSize: 11 }} accessibilityLabel="Připojený člen">✅</Text>}
            {m.joined === false && <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: c.muted }}>⏳ čeká</Text>}
          </View>
        ))}
      </View>
      {g.memberList?.some((m) => !m.userId) && (
        <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.onbg, opacity: 0.65, marginBottom: 18, lineHeight: 17 }}>
          ⏳ = zatím není v appce. Pošli pozvánku tlačítkem 📤 Pozvat{g.shareCode ? ' (kód ' + g.shareCode + ')' : ''}, dluhy se jim počítají i tak.
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg }}>Kdo komu dluží</Text>
        <Text onPress={shareCard} accessibilityRole="button" accessibilityLabel="Sdílet přehled dluhů jako obrázek" suppressHighlighting style={{ fontFamily: FONTS.body800, fontSize: 14, color: c.accent }}>📸 Sdílet</Text>
      </View>
      <View style={{ position: 'relative', marginBottom: 20 }}>
        <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 16 }} />
        <View ref={cardRef} collapsable={false} style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, overflow: 'hidden' }}>
          {/* hlavička kartičky (kvůli sdílenému obrázku) */}
          <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 }}>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 16, color: c.ink }} numberOfLines={1}>{g.name}</Text>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>Kdo komu dluží</Text>
          </View>
          {transfers.length === 0 ? (
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.muted, paddingHorizontal: 14, paddingBottom: 12 }}>Vyrovnáno – nikdo nikomu nedluží.</Text>
          ) : transfers.map((t) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 13, borderTopWidth: 2, borderTopColor: 'rgba(127,127,127,0.15)' }}>
              <Avatar name={t.from} initial={initial(t.from)} color={colorForMember(t.from)} size={30} />
              <Text style={{ flex: 1, fontFamily: FONTS.body700, fontSize: 14, color: c.ink }}>{t.from} → {t.to}</Text>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 15, color: c.bad }}>{fmtMoney(t.amt, t.currency)}</Text>
            </View>
          ))}
          {/* patička se značkou */}
          <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 2, borderTopColor: 'rgba(127,127,127,0.15)', backgroundColor: c.bg2 }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 12, color: c.onbg }}>🦤 Dotačníček — kdo komu dluží, spočítám to za vás</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg, marginBottom: 10 }}>Výdaje</Text>
      {expenses.length === 0 && (
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.6, marginBottom: 6 }}>Zatím žádný výdaj – přidej první níže.</Text>
      )}
      {expenses.length > 3 && (
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="🔍 Hledat výdaj…"
          maxLength={60}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={{ marginBottom: 12 }}
        />
      )}
      {expenses.length > 0 && shownExpenses.length === 0 && (
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.6, marginBottom: 6 }}>Nic nenalezeno. Zkus to jinak.</Text>
      )}
      {shownExpenses.map((e) => (
        <Pushable key={e.id} onPress={() => actions.openExpense(e.id)} offset={3} radius={14} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, borderWidth: 2, borderColor: c.ink, backgroundColor: categoryOf(e.category).color, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 19 }}>{categoryOf(e.category).icon}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: c.ink }}>{e.desc} {e.photo ? '📷' : ''}</Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.muted }}>
                Platil {e.payer}{e.shares && e.shares.length === e.parts.length ? ' · nerovně' : ' · ' + fmtMoney(e.amount / e.parts.length, e.currency) + '/os'}
              </Text>
            </View>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 17, color: c.ink }}>{fmtMoney(e.amount, e.currency)}</Text>
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
            <Text style={{ fontFamily: FONTS.display600, fontSize: 15, color: '#fff' }}>Rozpočet</Text>
          </View>
        </Pushable>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Pushable onPress={() => actions.navigate('audit')} offset={3} radius={14} style={{ flex: 1 }}>
          <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: c.ink }}>📋 Audit NKÚ</Text>
          </View>
        </Pushable>
        <Pushable onPress={() => actions.navigate('activity')} offset={3} radius={14} style={{ flex: 1 }}>
          <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: c.ink }}>🕓 Historie</Text>
          </View>
        </Pushable>
      </View>

      <Text onPress={confirmDelete} accessibilityRole="button" suppressHighlighting style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.bad, opacity: 0.85, textAlign: 'center', marginTop: 22 }}>
        Smazat skupinu
      </Text>
    </ScrollView>
  );
}
