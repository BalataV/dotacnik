// Vytvoření nové skupiny a přidávání členů
import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Label } from '../components/ui';
import Field from '../components/Field';

export default function CreateGroup() {
  const c = useColors();
  const { state, actions } = useApp();
  const valid = !!(state.newGroupName.trim() && state.newGroupMembers.length >= 2);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <Text onPress={() => actions.navigate('overview')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 14 }}>‹ Zpět</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, marginBottom: 18, letterSpacing: -0.5 }}>Nová skupina</Text>

      <Label>Název skupiny</Label>
      <Field value={state.newGroupName} onChangeText={(t) => actions.patch({ newGroupName: t })} placeholder="Chata, výlet, pivo…" maxLength={50} returnKeyType="done" style={{ marginBottom: 18 }} />

      <Label>Členové skupiny</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12, minHeight: 38 }}>
        {state.newGroupMembers.map((m) => (
          <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.accent, borderWidth: 2, borderColor: c.ink, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 11 }}>
            <Text style={{ fontFamily: FONTS.display600, fontSize: 14, color: '#fff' }}>{m}</Text>
            {m !== 'Já' && (
              <Text onPress={() => actions.removeMember(m)} accessibilityRole="button" accessibilityLabel={'Odebrat člena ' + m} suppressHighlighting style={{ color: '#fff', fontSize: 14, paddingHorizontal: 3 }}>×</Text>
            )}
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
        <Field
          value={state.newMemberInput}
          onChangeText={(t) => actions.patch({ newMemberInput: t })}
          onSubmitEditing={actions.addMember}
          submitBehavior="submit"
          returnKeyType="next"
          placeholder="Jméno člena…"
          maxLength={30}
          style={{ flex: 1 }}
        />
        <Pushable onPress={actions.addMember} accessibilityLabel="Přidat člena" offset={3} radius={13}>
          <View style={{ backgroundColor: c.good, borderWidth: 3, borderColor: c.ink, borderRadius: 13, paddingVertical: 11, paddingHorizontal: 18 }}>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 20, color: '#fff' }}>+</Text>
          </View>
        </Pushable>
      </View>

      <Pushable onPress={actions.createGroup} disabled={!valid} radius={14}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: '#fff' }}>Vytvořit skupinu →</Text>
        </View>
      </Pushable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
