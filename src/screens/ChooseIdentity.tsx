// "Kdo jsi?" – po otevření pozvánky si připojující vybere svoje jméno ze seznamu
// členů, které napsal zakladatel skupiny. Nebo přidá nové jméno.
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Label, Avatar } from '../components/ui';
import { initial } from '../logic';
import { colorForMember } from '../data';
import Field from '../components/Field';

export default function ChooseIdentity() {
  const c = useColors();
  const { state, actions } = useApp();
  const p = state.joinPreview;
  const [newName, setNewName] = useState('');

  if (!p) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text onPress={() => actions.navigate('overview')} style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15 }}>‹ Zpět</Text>
        <Text style={{ fontFamily: FONTS.body700, color: c.onbg, marginTop: 12 }}>Pozvánka vypršela – zkus odkaz znovu.</Text>
      </ScrollView>
    );
  }

  const free = p.members.filter((m) => !m.claimed);
  const taken = p.members.filter((m) => m.claimed);
  const newTrim = newName.trim();
  const dup = p.members.some((m) => m.name.toLowerCase() === newTrim.toLowerCase());

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
      <Text onPress={() => actions.navigate('overview')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 12 }}>‹ Zpět</Text>

      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, letterSpacing: -0.5 }}>Kdo jsi?</Text>
      <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.65, marginBottom: 20, lineHeight: 20 }}>
        Připojuješ se do „{p.groupName}". Klepni na svoje jméno v seznamu.
      </Text>

      {free.length > 0 && <Label>Vyber svoje jméno</Label>}
      {free.map((m) => (
        <Pushable key={m.name} onPress={() => actions.finishJoin({ claimName: m.name })} disabled={state.busy} offset={3} radius={14} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13 }}>
            <Avatar name={m.name} initial={initial(m.name)} color={colorForMember(m.name)} size={36} fontSize={13} />
            <Text style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 16, color: c.ink }}>{m.name}</Text>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: c.accent }}>To jsem já ›</Text>
          </View>
        </Pushable>
      ))}

      {taken.length > 0 && (
        <View style={{ marginTop: 6, marginBottom: 4 }}>
          <Label>Už obsazeno</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {taken.map((m) => (
              <View key={m.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.card, borderWidth: 2, borderColor: c.muted, borderRadius: 11, paddingVertical: 7, paddingHorizontal: 11, opacity: 0.55 }}>
                <Avatar name={m.name} initial={initial(m.name)} color={colorForMember(m.name)} size={22} fontSize={10} />
                <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.muted }}>{m.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 22 }} />

      <Label>Nejsi na seznamu?</Label>
      <Field
        value={newName}
        onChangeText={setNewName}
        placeholder="Napiš svoje jméno"
        returnKeyType="go"
        onSubmitEditing={() => { if (newTrim && !dup && !state.busy) actions.finishJoin({ newName: newTrim }); }}
        style={{ marginBottom: 12 }}
      />
      <Pushable onPress={() => actions.finishJoin({ newName: newTrim })} disabled={!newTrim || dup || state.busy} radius={14}>
        <View style={{ backgroundColor: c.good, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: '#fff' }}>
            {newTrim ? 'Připojit jako ' + newTrim : 'Připojit s novým jménem'}
          </Text>
        </View>
      </Pushable>
      {dup && <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: c.bad, marginTop: 8 }}>Tohle jméno už ve skupině je – vyber ho nahoře.</Text>}
    </ScrollView>
  );
}
