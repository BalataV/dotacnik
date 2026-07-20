// Připojení do existující skupiny pomocí kódu z pozvánky
import React from 'react';
import { View, Text, ScrollView, Keyboard } from 'react-native';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable, Label } from '../components/ui';
import Field from '../components/Field';

export default function JoinGroup() {
  const c = useColors();
  const { state, actions } = useApp();
  const valid = !!state.joinCodeInput.trim();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, paddingTop: 16 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <Text onPress={() => actions.navigate('overview')} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 14 }}>‹ Zpět</Text>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 26, color: c.onbg, marginBottom: 6, letterSpacing: -0.5 }}>Připojit se do skupiny</Text>
      <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.6, marginBottom: 22, lineHeight: 20 }}>
        Zadej kód z pozvánky, kterou ti poslal kamarád.
      </Text>

      <Label>Kód pozvánky</Label>
      <Field
        value={state.joinCodeInput}
        onChangeText={(t) => {
          // jen písmena a číslice, velkými; po 6. znaku se rovnou připojíme
          const code = t.toUpperCase().replace(/[^A-Z0-9]/g, '');
          actions.patch({ joinCodeInput: code });
          if (code.length === 6) {
            Keyboard.dismiss();
            actions.submitJoin(code);
          }
        }}
        placeholder="např. 8KRGF1"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        returnKeyType="go"
        onSubmitEditing={() => actions.submitJoin()}
        style={{ marginBottom: 22 }}
      />

      <Pushable onPress={actions.submitJoin} disabled={!valid} radius={14}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: '#fff' }}>Připojit se</Text>
        </View>
      </Pushable>
    </ScrollView>
  );
}
