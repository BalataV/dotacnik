// Překryvné efekty: padající mince po zaplacení a toast notifikace
import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { FONTS } from '../theme';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

function Coin({ left, delay, dur }) {
  const y = useRef(new Animated.Value(-30)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, { toValue: SCREEN_H + 40, duration: dur, easing: Easing.bezier(0.4, 0.1, 0.6, 1), useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1, duration: dur, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: dur * 0.12, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: dur * 0.88, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute', top: 0, left: (left / 100) * SCREEN_W,
        width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFE680',
        borderWidth: 2, borderColor: '#B8860B', alignItems: 'center', justifyContent: 'center',
        opacity: op, transform: [{ translateY: y }, { rotate }],
      }}
    >
      <Text style={{ fontFamily: FONTS.display700, fontSize: 10, color: '#7a5a00' }}>Kč</Text>
    </Animated.View>
  );
}

export function Coins({ show }) {
  const coins = useMemo(
    () => Array.from({ length: 14 }).map(() => ({
      left: Math.round(4 + Math.random() * 90),
      delay: Math.round(Math.random() * 350),
      dur: 900 + Math.round(Math.random() * 500),
    })),
    [show]
  );
  if (!show) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {coins.map((c, i) => (
        <Coin key={i} {...c} />
      ))}
    </View>
  );
}

export function Toast({ text, ink }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (text) {
      op.setValue(0);
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    }
  }, [text]);
  if (!text) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute', bottom: 96, alignSelf: 'center', zIndex: 31, opacity: op,
        backgroundColor: ink, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 30,
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
      }}
    >
      <Text style={{ color: '#fff', fontFamily: FONTS.body800, fontSize: 14 }}>{text}</Text>
    </Animated.View>
  );
}
