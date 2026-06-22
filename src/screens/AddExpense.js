// Přidání nového výdaje – kdo platil a mezi koho se to dělí
import React from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Label } from '../components/ui';
import Field from '../components/Field';

function Chip({ label, on, onPress, onColor }) {
  const c = useColors();
  return (
    <Pushable onPress={onPress} offset={0} radius={11}>
      <View style={{ backgroundColor: on ? onColor : c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 14 }}>
        <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: on ? '#fff' : c.ink }}>{label}</Text>
      </View>
    </Pushable>
  );
}

export default function AddExpense() {
  const c = useColors();
  const { state, actions } = useApp();
  const g = state.groups.find((x) => x.id === state.selectedGroup) || state.groups[0];
  const amt = Number(state.addAmount);
  const valid = !!state.addDesc && amt > 0 && state.addParts.length > 0;
  const shareText = valid
    ? 'Každý dá ' + Math.round(amt / state.addParts.length) + ' Kč'
    : 'Vyplň co, kolik a koho se to týká.';

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
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text onPress={() => actions.navigate('group')} style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 10 }}>‹ Zpět</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, marginBottom: 18, letterSpacing: -0.5 }}>Nový výdaj</Text>

      <Label>Za co?</Label>
      <Field value={state.addDesc} onChangeText={(t) => actions.patch({ addDesc: t })} placeholder="Buřty, benzín, pivo…" style={{ marginBottom: 16 }} />

      <Label>Kolik?</Label>
      <Field
        value={state.addAmount}
        onChangeText={(t) => actions.patch({ addAmount: t.replace(/[^0-9]/g, '') })}
        placeholder="0"
        keyboardType="numeric"
        big
        right={<Text style={{ position: 'absolute', right: 16, top: 18, fontFamily: FONTS.display700, fontSize: 18, color: c.muted }}>Kč</Text>}
        style={{ marginBottom: 18 }}
      />

      <Label>Kdo platil?</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {g.members.map((m) => (
          <Chip key={m} label={m} on={state.addPayer === m} onColor={c.accent} onPress={() => actions.setPayer(m)} />
        ))}
      </View>

      <Label>Rozdělit mezi</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {g.members.map((m) => (
          <Chip key={m} label={m} on={state.addParts.indexOf(m) >= 0} onColor={c.good} onPress={() => actions.togglePart(m)} />
        ))}
      </View>

      <Label>Účtenka (foto)</Label>
      {state.addPhoto ? (
        <View style={{ position: 'relative', marginBottom: 18 }}>
          <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 14 }} />
          <Image source={{ uri: state.addPhoto }} style={{ width: '100%', height: 180, borderRadius: 14, borderWidth: 3, borderColor: c.ink }} resizeMode="cover" />
          <Pushable onPress={() => actions.patch({ addPhoto: null })} offset={2} radius={20} style={{ position: 'absolute', top: 8, right: 8 }}>
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

      <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: c.onbg, opacity: 0.8, marginBottom: 18 }}>{shareText}</Text>

      <Pushable onPress={actions.submitExpense} disabled={!valid} radius={14}>
        <View style={{ backgroundColor: c.good, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: '#fff' }}>Přidat výdaj</Text>
        </View>
      </Pushable>
    </ScrollView>
  );
}
