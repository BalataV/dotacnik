// Potvrzení vytvoření skupiny + sdílení odkazem
import React from 'react';
import { View, Text, ScrollView, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FONTS } from '../theme';
import { useApp } from '../store';
import { useColors, Pushable } from '../components/ui';
import { landingJoinUrl } from '../config';

export default function ShareGroup() {
  const c = useColors();
  const { state, actions } = useApp();
  const code = state.shareCode || '';
  const url = landingJoinUrl(code);
  // Zobrazujeme bez "https://" – kratší a hezčí v kartě
  const link = url.replace(/^https?:\/\//, '');

  async function copy() {
    try {
      await Clipboard.setStringAsync(url);
    } catch (e) {}
    actions.showToast('Odkaz zkopírován!');
  }

  async function shareInvite() {
    try {
      await Share.share({
        message: 'Přidej se do mojí skupiny v appce Dotačník! 🦤\nKód: ' + code + '\nOdkaz: ' + url,
      });
    } catch (e) {}
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <Pushable offset={4} radius={32}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.good, borderWidth: 3, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: FONTS.body900, fontSize: 28 }}>✓</Text>
        </View>
      </Pushable>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 24, color: c.onbg, marginTop: 18, marginBottom: 6 }}>Skupina vytvořena!</Text>
      <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: c.onbg, opacity: 0.65, marginBottom: 24, maxWidth: 220, textAlign: 'center', lineHeight: 20 }}>
        Sdílej odkaz — kamarádi se přidají jedním klepnutím
      </Text>

      <View style={{ width: '100%', position: 'relative', marginBottom: 14 }}>
        <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: c.ink, borderRadius: 16 }} />
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 16, padding: 15 }}>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Odkaz ke sdílení</Text>
          <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: c.accent, lineHeight: 20 }}>{link}</Text>
        </View>
      </View>

      <Pushable onPress={shareInvite} radius={14} style={{ width: '100%', marginBottom: 10 }}>
        <View style={{ backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: '#fff' }}>Sdílet pozvánku</Text>
        </View>
      </Pushable>
      <Pushable onPress={copy} radius={14} style={{ width: '100%', marginBottom: 10 }}>
        <View style={{ backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.ink }}>Kopírovat odkaz</Text>
        </View>
      </Pushable>
      <Pushable onPress={() => actions.navigate('overview')} offset={0} radius={14} style={{ width: '100%' }}>
        <View style={{ borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.display600, fontSize: 17, color: c.onbg }}>Hotovo</Text>
        </View>
      </Pushable>
    </ScrollView>
  );
}
