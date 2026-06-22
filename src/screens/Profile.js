// Profil – statistiky, volba vzhledu, přepínače a odhlášení
import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable } from '../components/ui';
import Mascot from '../components/Mascot';
import { totalOwe, totalOwed } from '../logic';
import { PRIVACY_URL } from '../config';

function confirmDelete(onConfirm) {
  Alert.alert(
    'Smazat účet?',
    'Trvale se smažou tvoje skupiny, výdaje i přihlašovací údaje. Tuto akci nelze vrátit.',
    [
      { text: 'Zrušit', style: 'cancel' },
      { text: 'Smazat účet', style: 'destructive', onPress: onConfirm },
    ],
  );
}

function Toggle({ label, value, onPress }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.07)' }}>
      <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: c.ink }}>{label}</Text>
      <View style={{ width: 46, height: 27, borderRadius: 14, borderWidth: 2, borderColor: c.ink, backgroundColor: value ? c.good : '#cfd5e0', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: 1.5, left: value ? 22 : 1.5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: c.ink }} />
      </View>
    </Pressable>
  );
}

function StatBox({ value, label, color }) {
  const c = useColors();
  return (
    <Pushable offset={3} radius={14} style={{ flex: 1 }}>
      <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 6, alignItems: 'center' }}>
        <Text style={{ fontFamily: FONTS.display700, fontSize: 18, color }}>{value}</Text>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 10, color: c.muted, textTransform: 'uppercase', marginTop: 2 }}>{label}</Text>
      </View>
    </Pushable>
  );
}

export default function Profile() {
  const c = useColors();
  const { state, actions } = useApp();
  const owe = totalOwe(state.groups, state.expenses, state.payments);
  const owed = totalOwed(state.groups, state.expenses, state.payments);
  const isZ = state.userTheme === 'zluta';
  const isM = state.userTheme === 'modra';

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 24, alignItems: 'center' }}>
      <Mascot size={110} float />
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, marginTop: 8 }}>Ty pacholku</Text>
      <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: c.onbg, opacity: 0.65, marginBottom: 18 }}>@dluznik · člen od r. 2017</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, width: '100%' }}>
        <StatBox value={owe + ' Kč'} label="Dlužíš" color={c.bad} />
        <StatBox value={owed + ' Kč'} label="Dostaneš" color={c.good} />
        <StatBox value={String(state.groups.length)} label="Skupiny" color={c.accent} />
      </View>

      <View style={{ width: '100%', position: 'relative', marginBottom: 16 }}>
        <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 18 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, overflow: 'hidden' }}>
          <View style={{ padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.07)' }}>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vzhled</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => actions.setTheme('zluta')} style={{ flex: 1, padding: 12, borderWidth: 3, borderColor: c.ink, borderRadius: 12, alignItems: 'center', backgroundColor: isZ ? '#FFD60A' : c.card }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: isZ ? '#15233B' : c.muted }}>Žlutá</Text>
              </Pressable>
              <Pressable onPress={() => actions.setTheme('modra')} style={{ flex: 1, padding: 12, borderWidth: 3, borderColor: c.ink, borderRadius: 12, alignItems: 'center', backgroundColor: isM ? '#102A43' : c.card }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: isM ? '#fff' : c.muted }}>Modrá</Text>
              </Pressable>
            </View>
          </View>
          <Toggle label="Upozornění od Falťase" value={state.toggles.notif} onPress={() => actions.toggleSet('notif')} />
          <Toggle label={'Zvuk „Čau lidi" při startu'} value={state.toggles.sound} onPress={() => actions.toggleSet('sound')} />
        </View>
      </View>

      <Pushable onPress={actions.logout} radius={14} style={{ width: '100%' }}>
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: c.bad }}>Odhlásit se</Text>
        </View>
      </Pushable>

      <Text onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})} style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.onbg, opacity: 0.6, marginTop: 18, textDecorationLine: 'underline' }}>
        Zásady ochrany osobních údajů
      </Text>
      <Text onPress={() => confirmDelete(actions.deleteAccount)} style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.bad, opacity: 0.85, marginTop: 12 }}>
        Smazat účet a všechna data
      </Text>
    </ScrollView>
  );
}
