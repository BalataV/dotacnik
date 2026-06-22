// Hlavní obal aplikace: hlavička s maskotem, přepínání obrazovek, spodní navigace
import React from 'react';
import { View, Text, Pressable, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native';
import { FONTS } from './theme';
import { useApp } from './store';
import { useColors } from './components/ui';
import Mascot from './components/Mascot';
import { Coins, Toast } from './components/Overlays';

import { Onboarding, RegisterEmail, Login } from './screens/AuthScreens';
import Overview from './screens/Overview';
import CreateGroup from './screens/CreateGroup';
import ShareGroup from './screens/ShareGroup';
import JoinGroup from './screens/JoinGroup';
import GroupDetail from './screens/GroupDetail';
import AddExpense from './screens/AddExpense';
import ExpenseDetail from './screens/ExpenseDetail';
import Settle from './screens/Settle';
import Profile from './screens/Profile';

function SpeechBubble({ text }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 14 }} />
      <View style={{ backgroundColor: '#fff', borderWidth: 3, borderColor: c.ink, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 13 }}>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#15233B', lineHeight: 18 }}>{text}</Text>
      </View>
      {/* ocásek bubliny */}
      <View style={{ position: 'absolute', left: -7, bottom: 13, width: 12, height: 12, backgroundColor: '#fff', borderLeftWidth: 3, borderBottomWidth: 3, borderColor: c.ink, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

function NavItem({ active, color, label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      {icon(color)}
      <Text style={{ fontFamily: FONTS.body800, fontSize: 11, color }}>{label}</Text>
    </Pressable>
  );
}

function GridIcon(color) {
  return (
    <View style={{ width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: 8, height: 8, backgroundColor: color, borderRadius: 2 }} />
      ))}
    </View>
  );
}

function KcIcon(color) {
  return (
    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: FONTS.display700, fontSize: 8, color }}>Kč</Text>
    </View>
  );
}

function PersonIcon(color) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 13, height: 13, borderRadius: 6.5, backgroundColor: color }} />
      <View style={{ width: 20, height: 9, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: color, marginTop: 2 }} />
    </View>
  );
}

export default function Root() {
  const c = useColors();
  const { state, actions } = useApp();
  const sc = state.screen;
  const showChrome = sc !== 'onboarding' && sc !== 'register_email' && sc !== 'login';

  let Screen = null;
  if (sc === 'onboarding') Screen = <Onboarding />;
  else if (sc === 'register_email') Screen = <RegisterEmail />;
  else if (sc === 'login') Screen = <Login />;
  else if (sc === 'overview') Screen = <Overview />;
  else if (sc === 'create_group') Screen = <CreateGroup />;
  else if (sc === 'share_group') Screen = <ShareGroup />;
  else if (sc === 'join') Screen = <JoinGroup />;
  else if (sc === 'group') Screen = <GroupDetail />;
  else if (sc === 'add') Screen = <AddExpense />;
  else if (sc === 'expense') Screen = <ExpenseDetail />;
  else if (sc === 'settle') Screen = <Settle />;
  else if (sc === 'profile') Screen = <Profile />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: showChrome ? c.card : c.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {showChrome && (
          <View style={{ backgroundColor: c.card, borderBottomWidth: 3, borderBottomColor: c.ink, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 14, zIndex: 6 }}>
            <Text style={{ fontFamily: FONTS.display700, fontSize: 23, color: c.ink, letterSpacing: -0.6 }}>Čapí Dluh</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 11 }}>
              <Mascot size={56} />
              <SpeechBubble key={state.bubbleKey} text={state.bubble} />
            </View>
          </View>
        )}

        <View style={{ flex: 1 }}>{Screen}</View>

        {showChrome && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: c.card, borderTopWidth: 3, borderTopColor: c.ink, paddingTop: 8, paddingBottom: 11, paddingHorizontal: 6 }}>
            <NavItem label="Přehled" color={sc === 'overview' ? c.accent : c.muted} icon={GridIcon} onPress={() => actions.navigate('overview')} />
            <NavItem label="Vypořádat" color={sc === 'settle' ? c.accent : c.muted} icon={KcIcon} onPress={() => actions.navigate('settle')} />
            <View style={{ flex: 0, marginTop: -26 }}>
              <Pressable onPress={actions.startAdd} style={({ pressed }) => ({ transform: [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }] })}>
                <View style={{ position: 'relative' }}>
                  <View style={{ position: 'absolute', top: 3, left: 3, width: 58, height: 58, borderRadius: 29, backgroundColor: c.ink }} />
                  <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: c.accent, borderWidth: 3, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: FONTS.display700, fontSize: 30, color: '#fff', lineHeight: 34, includeFontPadding: false, textAlign: 'center' }}>+</Text>
                  </View>
                </View>
              </Pressable>
            </View>
            <NavItem label="Profil" color={sc === 'profile' ? c.accent : c.muted} icon={PersonIcon} onPress={() => actions.navigate('profile')} />
          </View>
        )}

        <Coins show={state.coins} />
        <Toast text={state.toast} ink={c.ink} />
      </View>
      <StatusBar barStyle={!showChrome && c.bg === '#102A43' ? 'light-content' : 'dark-content'} />
    </SafeAreaView>
  );
}
