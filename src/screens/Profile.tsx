// Profil – statistiky, volba vzhledu, přepínače a odhlášení
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable } from '../components/ui';
import Mascot from '../components/Mascot';
import Field from '../components/Field';
import { totalOwe, totalOwed } from '../logic';
import { fmtMoneyMap } from '../money';

function confirmDelete(onConfirm: () => void) {
  Alert.alert(
    'Smazat účet?',
    'Trvale se smažou tvoje skupiny, výdaje i přihlašovací údaje. Tuto akci nelze vrátit.',
    [
      { text: 'Zrušit', style: 'cancel' },
      { text: 'Smazat účet', style: 'destructive', onPress: onConfirm },
    ],
  );
}

function Toggle({ label, value, onPress }: { label: string; value: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.07)' }}>
      <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: c.ink }}>{label}</Text>
      <View style={{ width: 46, height: 27, borderRadius: 14, borderWidth: 2, borderColor: c.ink, backgroundColor: value ? c.good : '#cfd5e0', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: 1.5, left: value ? 22 : 1.5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: c.ink }} />
      </View>
    </Pressable>
  );
}

function StatBox({ value, label, color, onPress }: { value: string; label: string; color: string; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pushable onPress={onPress} accessibilityLabel={label} offset={3} radius={14} style={{ flex: 1 }}>
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
  const isD = state.userTheme === 'tmava';
  const [editName, setEditName] = useState<string | null>(null); // null = needituji, jinak rozepsané jméno

  function saveName() {
    const v = (editName || '').trim();
    if (v && v !== state.myName) actions.setMyName(v);
    setEditName(null);
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 24, alignItems: 'center' }}>
      <Mascot size={110} float />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, marginBottom: 16, width: '100%' }}>
        <StatBox value={fmtMoneyMap(owe)} label="Dlužíš" color={c.bad} onPress={() => actions.navigate('overview')} />
        <StatBox value={fmtMoneyMap(owed)} label="Dostaneš" color={c.good} onPress={() => actions.navigate('overview')} />
        <StatBox value={String(state.groups.length)} label="Skupiny" color={c.accent} onPress={() => actions.navigate('overview')} />
      </View>

      {/* Tvoje jméno – jak tě vidí ostatní ve skupinách */}
      <View style={{ width: '100%', position: 'relative', marginBottom: 16 }}>
        <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 18 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, padding: 14 }}>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tvoje jméno</Text>
          {editName === null ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: FONTS.display600, fontSize: 18, color: c.ink }} numberOfLines={1}>{state.myName}</Text>
              <Pushable onPress={() => setEditName(state.myName === 'Já' ? '' : state.myName)} offset={2} radius={11}>
                <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 11, paddingVertical: 8, paddingHorizontal: 14 }}>
                  <Text style={{ fontFamily: FONTS.display600, fontSize: 13, color: '#fff' }}>✏️ Upravit</Text>
                </View>
              </Pushable>
            </View>
          ) : (
            <View>
              <Field value={editName} onChangeText={setEditName} placeholder="Napiš svoje jméno" autoFocus maxLength={30} style={{ marginBottom: 10 }} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pushable onPress={saveName} disabled={!editName.trim() || state.busy} radius={12} style={{ flex: 1 }}>
                  <View style={{ backgroundColor: c.good, borderWidth: 3, borderColor: c.ink, borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}>
                    <Text style={{ fontFamily: FONTS.display600, fontSize: 15, color: '#fff' }}>Uložit</Text>
                  </View>
                </Pushable>
                <Pushable onPress={() => setEditName(null)} offset={0} radius={12} style={{ flex: 0 }}>
                  <View style={{ borderWidth: 3, borderColor: c.ink, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center' }}>
                    <Text style={{ fontFamily: FONTS.display600, fontSize: 15, color: c.ink }}>Zrušit</Text>
                  </View>
                </Pushable>
              </View>
            </View>
          )}
        </View>
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
              <Pressable onPress={() => actions.setTheme('tmava')} style={{ flex: 1, padding: 12, borderWidth: 3, borderColor: c.ink, borderRadius: 12, alignItems: 'center', backgroundColor: isD ? '#0F1A2C' : c.card }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: isD ? '#F2E8CE' : c.muted }}>Tmavá</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ padding: 14, borderTopWidth: 2, borderTopColor: 'rgba(0,0,0,0.07)' }}>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color: c.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Velikost obsahu</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {([['small', 'Malý'], ['medium', 'Střední'], ['large', 'Velký']] as const).map(([key, label]) => {
                const on = state.contentSize === key;
                return (
                  <Pressable key={key} onPress={() => actions.setContentSize(key)} style={{ flex: 1, padding: 12, borderWidth: 3, borderColor: c.ink, borderRadius: 12, alignItems: 'center', backgroundColor: on ? c.accent : c.card }}>
                    <Text style={{ fontFamily: FONTS.display600, fontSize: key === 'small' ? 12 : key === 'large' ? 17 : 14, color: on ? '#fff' : c.muted }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Toggle label="Chceš dostávat novinky z MF DNES" value={state.toggles.notif} onPress={() => actions.toggleSet('notif')} />
        </View>
      </View>

      <Pushable onPress={actions.logout} radius={14} style={{ width: '100%' }}>
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: c.bad }}>Odhlásit se</Text>
        </View>
      </Pushable>

      <Text onPress={() => actions.navigate('privacy')} accessibilityRole="button" suppressHighlighting style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.onbg, opacity: 0.6, marginTop: 18, textDecorationLine: 'underline' }}>
        Zásady ochrany osobních údajů
      </Text>
      <Text onPress={() => confirmDelete(actions.deleteAccount)} accessibilityRole="button" suppressHighlighting style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.bad, opacity: 0.85, marginTop: 12 }}>
        Smazat účet a všechna data
      </Text>
    </ScrollView>
  );
}
