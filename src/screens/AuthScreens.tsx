// Úvodní obrazovka, registrace e-mailem a přihlášení
import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../theme';
import { useApp, CLOUD_MODE } from '../store';
import { useColors, Pushable, Label } from '../components/ui';
import Mascot from '../components/Mascot';
import Field from '../components/Field';

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12.255v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.08 3.56-5.17 3.56-8.82z" fill="#4285F4" />
      <Path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" fill="#34A853" />
      <Path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" fill="#FBBC05" />
      <Path d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335" />
    </Svg>
  );
}

export function Onboarding() {
  const c = useColors();
  const { state, actions } = useApp();
  const showGoogle = !CLOUD_MODE || state.googleEnabled;
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28, paddingVertical: 40 }}>
      <View style={{ position: 'relative', marginBottom: 14 }}>
        <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 18 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 22, color: c.ink }}>Čau lidi!</Text>
        </View>
      </View>
      <Pressable onPress={actions.pokeMascot} accessibilityRole="image" accessibilityLabel="Maskot Dotačníku">
        <Mascot size={130} float />
      </Pressable>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 38, color: c.onbg, marginTop: 14, marginBottom: 6, letterSpacing: -1 }}>Dotačník</Text>
      <Text style={{ color: c.onbg, opacity: 0.85, fontFamily: FONTS.body700, fontSize: 14, maxWidth: 240, textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
        Kdo komu dluží? Spočítám to za vás. Sorry jako.
      </Text>

      {showGoogle && (
        <Pushable onPress={actions.enterGoogle} radius={14} style={{ width: '100%', maxWidth: 280, marginBottom: 10 }}>
          <View style={{ backgroundColor: '#fff', borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <GoogleIcon />
            <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: '#15233B' }}>Pokračovat s Googlem</Text>
          </View>
        </Pushable>
      )}

      <Pushable onPress={() => actions.navigate('register_email')} radius={14} style={{ width: '100%', maxWidth: 280, marginBottom: 20 }}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: '#fff' }}>Registrovat přes e-mail</Text>
        </View>
      </Pushable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', maxWidth: 280, marginBottom: 18 }}>
        <View style={{ flex: 1, height: 2, backgroundColor: c.onbg, opacity: 0.15, borderRadius: 2 }} />
        <Text style={{ fontFamily: FONTS.body800, fontSize: 12, color: c.onbg, opacity: 0.45 }}>nebo</Text>
        <View style={{ flex: 1, height: 2, backgroundColor: c.onbg, opacity: 0.15, borderRadius: 2 }} />
      </View>

      <Pushable onPress={() => actions.navigate('login')} offset={0} radius={14} style={{ width: '100%', maxWidth: 280 }}>
        <View style={{ borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 16, color: c.onbg }}>Přihlásit se</Text>
        </View>
      </Pushable>

      <Text style={{ color: c.onbg, opacity: 0.5, fontFamily: FONTS.body600, marginTop: 18, maxWidth: 240, textAlign: 'center', lineHeight: 20, fontSize: 12 }}>
        Přihlášením souhlasíte, že to stejně nikdo nečet.
      </Text>
    </ScrollView>
  );
}

function BackButton({ onPress, label = '‹ Zpět' }: { onPress: () => void; label?: string }) {
  const c = useColors();
  return (
    <Text onPress={onPress} accessibilityRole="button" suppressHighlighting style={{ color: c.onbg, fontFamily: FONTS.body800, fontSize: 15, marginBottom: 22 }}>{label}</Text>
  );
}

export function RegisterEmail() {
  const c = useColors();
  const { state, actions } = useApp();
  const valid = !!(state.regEmail && state.regPassword.length >= 6);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 28 }} keyboardShouldPersistTaps="handled">
      <BackButton onPress={() => actions.navigate('onboarding')} />
      <Text style={{ fontFamily: FONTS.display700, fontSize: 28, color: c.onbg, marginBottom: 4 }}>Vytvořit účet</Text>
      <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.6, marginBottom: 26 }}>Registrace je zdarma. Sorry jako.</Text>
      <Label>E-mail</Label>
      <Field value={state.regEmail} onChangeText={(t) => actions.patch({ regEmail: t })} placeholder="vas@email.cz" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" maxLength={254} style={{ marginBottom: 14 }} />
      <Label>Heslo</Label>
      <Field value={state.regPassword} onChangeText={(t) => actions.patch({ regPassword: t })} placeholder="min. 6 znaků" secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={72} style={{ marginBottom: 26 }} />
      <Pushable onPress={actions.doRegister} disabled={!valid} radius={14}>
        <View style={{ backgroundColor: c.good, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: '#fff' }}>Zaregistrovat se</Text>
        </View>
      </Pushable>
      <Text onPress={() => actions.navigate('login')} accessibilityRole="button" suppressHighlighting style={{ textAlign: 'center', fontFamily: FONTS.body700, fontSize: 14, color: c.accent, marginTop: 20 }}>
        Již mám účet → Přihlásit se
      </Text>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Login() {
  const c = useColors();
  const { state, actions } = useApp();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 28 }} keyboardShouldPersistTaps="handled">
      <BackButton onPress={() => actions.navigate('onboarding')} />
      <Text style={{ fontFamily: FONTS.display700, fontSize: 28, color: c.onbg, marginBottom: 4 }}>Přihlásit se</Text>
      <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.6, marginBottom: 26 }}>Vítej zpátky, motýle!</Text>
      <Label>E-mail</Label>
      <Field value={state.loginEmail} onChangeText={(t) => actions.patch({ loginEmail: t })} placeholder="vas@email.cz" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" maxLength={254} style={{ marginBottom: 14 }} />
      <Label>Heslo</Label>
      <Field value={state.loginPassword} onChangeText={(t) => actions.patch({ loginPassword: t })} placeholder="••••••••" secureTextEntry autoComplete="current-password" textContentType="password" maxLength={72} style={{ marginBottom: 26 }} />
      <Pushable onPress={actions.doLogin} radius={14}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 18, color: '#fff' }}>Vstoupit</Text>
        </View>
      </Pushable>
      <Text onPress={() => actions.navigate('register_email')} accessibilityRole="button" suppressHighlighting style={{ textAlign: 'center', fontFamily: FONTS.body700, fontSize: 14, color: c.accent, marginTop: 20 }}>
        Nemám účet → Zaregistrovat se
      </Text>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
