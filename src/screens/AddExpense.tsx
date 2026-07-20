// Přidání/úprava výdaje – měna, kdo platil, a způsob dělení (rovným dílem / poměrově / podle cen)
import React, { useRef } from 'react';
import { View, Text, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Label, Avatar } from '../components/ui';
import Field from '../components/Field';
import { initial } from '../logic';
import { colorForMember } from '../data';
import { CURRENCIES, curSymbol, fmtMoney } from '../money';
import { CATEGORIES } from '../categories';

function Chip({ label, on, onPress, onColor }: { label: string; on: boolean; onPress: () => void; onColor: string }) {
  const c = useColors();
  return (
    <Pushable onPress={onPress} offset={0} radius={11}>
      <View style={{ backgroundColor: on ? onColor : c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 14 }}>
        <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: on ? '#fff' : c.ink }}>{label}</Text>
      </View>
    </Pushable>
  );
}

// Řádek člena s číselným polem (váha u "poměrově", částka u "podle cen")
function PartInput({ name, value, onChange, suffix, hint, idx }: { name: string; value: string; onChange: (v: string) => void; suffix: string; hint?: string | null; idx: number }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <Avatar name={name} initial={initial(name)} color={colorForMember(name, idx)} size={32} fontSize={12} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: c.ink }} numberOfLines={1}>{name}</Text>
        {!!hint && <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.muted }}>{hint}</Text>}
      </View>
      <View style={{ position: 'relative', width: 110 }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 11, zIndex: 0 }} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor={c.muted}
          keyboardType="numeric"
          maxLength={9}
          style={{ position: 'relative', zIndex: 1, backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 11, paddingVertical: 9, paddingLeft: 12, paddingRight: 30, fontFamily: FONTS.display700, fontSize: 16, color: c.ink, textAlign: 'right' }}
        />
        <Text style={{ position: 'absolute', right: 10, top: 11, fontFamily: FONTS.display700, fontSize: 13, color: c.muted }}>{suffix}</Text>
      </View>
    </View>
  );
}

export default function AddExpense() {
  const c = useColors();
  const { state, actions } = useApp();
  const amountRef = useRef<TextInput>(null);
  const g = state.groups.find((x) => x.id === state.selectedGroup) || state.groups[0];
  const amt = Number(state.addAmount);
  const editing = !!state.editingExpenseId;
  const mode = state.addSplitType;
  const cur = state.addCurrency;
  const sym = curSymbol(cur);
  const members = g ? g.members : [];
  const numVal = (m: string) => Number(state.addShares[m] || 0);

  // Souhrny pro jednotlivé režimy
  const exactSum = members.reduce((s, m) => s + numVal(m), 0);
  const exactRemaining = amt - exactSum;
  const ratioW = members.reduce((s, m) => s + numVal(m), 0);

  let valid = !!state.addDesc && amt > 0;
  if (mode === 'equal') valid = valid && state.addParts.length > 0;
  else if (mode === 'ratio') valid = valid && ratioW > 0;
  else valid = valid && exactSum > 0 && Math.round(exactRemaining) === 0;

  function back() {
    actions.patch({ editingExpenseId: null });
    actions.navigate(editing ? 'expense' : 'group');
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Foťák', 'Povol prosím přístup k fotoaparátu.'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!res.canceled) actions.patch({ addPhoto: res.assets[0].uri });
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Galerie', 'Povol prosím přístup k fotkám.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (!res.canceled) actions.patch({ addPhoto: res.assets[0].uri });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <Text onPress={back} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Zpět</Text>
        <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, marginBottom: 18, letterSpacing: -0.5 }}>{editing ? 'Upravit výdaj' : 'Nový výdaj'}</Text>

        <Label>Za co?</Label>
        <Field value={state.addDesc} onChangeText={(t) => actions.patch({ addDesc: t })} placeholder="Buřty, benzín, pivo…" maxLength={100} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => amountRef.current?.focus()} style={{ marginBottom: 16 }} />

        <Label>Kategorie</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {CATEGORIES.map((cat) => (
            <Chip key={cat.key} label={cat.icon + ' ' + cat.label} on={state.addCategory === cat.key} onColor={cat.color} onPress={() => actions.setCategory(cat.key)} />
          ))}
        </View>

        <Label>Kolik?</Label>
        <Field
          ref={amountRef}
          value={state.addAmount}
          onChangeText={(t) => actions.patch({ addAmount: t.replace(/[^0-9]/g, '') })}
          placeholder="0"
          keyboardType="numeric"
          maxLength={9}
          big
          right={<Text style={{ position: 'absolute', right: 16, top: 18, fontFamily: FONTS.display700, fontSize: 18, color: c.muted }}>{sym}</Text>}
          style={{ marginBottom: 10 }}
        />
        {/* Měna */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          {CURRENCIES.map((m) => (
            <Chip key={m.code} label={m.code + ' ' + m.symbol} on={cur === m.code} onColor={c.accent} onPress={() => actions.setCurrency(m.code)} />
          ))}
        </View>

        <Label>Kdo platil?</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {members.map((m: string) => (
            <Chip key={m} label={m} on={state.addPayer === m} onColor={c.accent} onPress={() => actions.setPayer(m)} />
          ))}
        </View>

        <Label>Jak rozdělit?</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Chip label="Rovným dílem" on={mode === 'equal'} onColor={c.good} onPress={() => actions.setSplitType('equal')} />
          <Chip label="Poměrově" on={mode === 'ratio'} onColor={c.good} onPress={() => actions.setSplitType('ratio')} />
          <Chip label="Podle cen" on={mode === 'exact'} onColor={c.good} onPress={() => actions.setSplitType('exact')} />
        </View>

        {/* ROVNÝM DÍLEM – chipy účastníků */}
        {mode === 'equal' && (
          <>
            <Label>Rozdělit mezi</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {members.map((m: string) => (
                <Chip key={m} label={m} on={state.addParts.indexOf(m) >= 0} onColor={c.good} onPress={() => actions.togglePart(m)} />
              ))}
            </View>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: c.onbg, opacity: 0.8, marginBottom: 18 }}>
              {state.addParts.length > 0 && amt > 0 ? 'Každý dá ' + fmtMoney(amt / state.addParts.length, cur) : 'Vyber, koho se to týká.'}
            </Text>
          </>
        )}

        {/* PODLE CEN – zadej částku každému, hlídá zbytek */}
        {mode === 'exact' && (
          <>
            <Label>Útrata jednotlivců</Label>
            {members.map((m: string, i: number) => (
              <PartInput key={m} idx={i} name={m} value={state.addShares[m] || ''} onChange={(v: string) => actions.setShare(m, v)} suffix={sym} />
            ))}
            <View style={{ backgroundColor: Math.round(exactRemaining) === 0 ? '#E6F7EE' : '#FDEBEA', borderWidth: 3, borderColor: c.ink, borderRadius: 12, padding: 12, marginTop: 6, marginBottom: 18 }}>
              <Text style={{ fontFamily: FONTS.display700, fontSize: 15, color: Math.round(exactRemaining) === 0 ? c.good : c.bad }}>
                {Math.round(exactRemaining) === 0 ? '✓ Sedí přesně' : (exactRemaining > 0 ? 'Zbývá rozpočítat ' + fmtMoney(exactRemaining, cur) : 'Přebývá ' + fmtMoney(-exactRemaining, cur))}
              </Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.muted, marginTop: 2 }}>Rozepsáno {fmtMoney(exactSum, cur)} z {fmtMoney(amt, cur)}</Text>
            </View>
          </>
        )}

        {/* POMĚROVĚ – zadej díly (váhy), appka spočítá částky */}
        {mode === 'ratio' && (
          <>
            <Label>Kolik dílů kdo platí</Label>
            {members.map((m: string, i: number) => (
              <PartInput
                key={m}
                idx={i}
                name={m}
                value={state.addShares[m] || ''}
                onChange={(v: string) => actions.setShare(m, v)}
                suffix="díl"
                hint={ratioW > 0 && numVal(m) > 0 && amt > 0 ? '= ' + fmtMoney((amt * numVal(m)) / ratioW, cur) : null}
              />
            ))}
            <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: c.onbg, opacity: 0.8, marginTop: 4, marginBottom: 18 }}>
              {ratioW > 0 ? 'Celkem ' + ratioW + ' dílů' : 'Zadej, kolik dílů kdo platí (např. 2 a 1).'}
            </Text>
          </>
        )}

        <Label>Účtenka (foto)</Label>
        {state.addPhoto ? (
          <View style={{ position: 'relative', marginBottom: 18 }}>
            <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 14 }} />
            <Image source={{ uri: state.addPhoto }} style={{ width: '100%', height: 180, borderRadius: 14, borderWidth: 3, borderColor: c.ink }} contentFit="cover" transition={150} cachePolicy="memory-disk" />
            <Pushable onPress={() => actions.patch({ addPhoto: null })} accessibilityLabel="Odebrat fotku" offset={2} radius={20} style={{ position: 'absolute', top: 8, right: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.bad, borderWidth: 3, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontFamily: FONTS.body900, fontSize: 16 }}>×</Text>
              </View>
            </Pushable>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            <Pushable onPress={takePhoto} radius={13} style={{ flex: 1 }}>
              <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 13, paddingVertical: 13, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: c.ink }}>📷 Vyfotit</Text>
              </View>
            </Pushable>
            <Pushable onPress={pickPhoto} radius={13} style={{ flex: 1 }}>
              <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 13, paddingVertical: 13, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: c.ink }}>🖼️ Z galerie</Text>
              </View>
            </Pushable>
          </View>
        )}

        <Pushable onPress={actions.submitExpense} disabled={!valid || state.busy} radius={14}>
          <View style={{ backgroundColor: valid ? c.good : c.muted, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: '#fff' }}>{editing ? 'Uložit změny' : 'Přidat výdaj'}</Text>
          </View>
        </Pushable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
