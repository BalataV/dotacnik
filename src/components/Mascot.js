// Animovaný maskot aplikace (karikatura politika-podnikatele).
// Souřadnice jsou v základní soustavě 100x100 a škálují se podle "size".
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

export default function Mascot({ size = 72, float = false }) {
  const k = size / 100;
  const s = (v) => v * k;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const talk = useRef(new Animated.Value(7)).current;
  const brow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loops = [];

    if (float) {
      const f = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      f.start();
      loops.push(f);
    }

    const b = Animated.loop(
      Animated.sequence([
        Animated.delay(3800),
        Animated.timing(blink, { toValue: 0.08, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: true }),
      ])
    );
    b.start();
    loops.push(b);

    const t = Animated.loop(
      Animated.sequence([
        Animated.timing(talk, { toValue: 13, duration: 310, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(talk, { toValue: 7, duration: 310, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    t.start();
    loops.push(t);

    const br = Animated.loop(
      Animated.sequence([
        Animated.timing(brow, { toValue: -2, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(brow, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    br.start();
    loops.push(br);

    return () => loops.forEach((l) => l.stop());
  }, [float]);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, s(-7)] });
  const rotate = floatAnim.interpolate({ inputRange: [0, 1], outputRange: ['-1deg', '1deg'] });
  const ink = '#15233B';
  const bw = Math.max(1.5, s(3));
  const bw2 = Math.max(1, s(2));

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }, { rotate }] }}>
      {/* vlasy vzadu */}
      <View style={{ position: 'absolute', left: s(17), top: s(1), width: s(66), height: s(55), backgroundColor: '#B9B1A0', borderRadius: s(28) }} />
      {/* uši */}
      <View style={{ position: 'absolute', left: s(15), top: s(41), width: s(13), height: s(16), backgroundColor: '#F4C9A0', borderWidth: bw, borderColor: ink, borderRadius: s(8) }} />
      <View style={{ position: 'absolute', left: s(72), top: s(41), width: s(13), height: s(16), backgroundColor: '#F4C9A0', borderWidth: bw, borderColor: ink, borderRadius: s(8) }} />
      {/* obličej */}
      <View style={{ position: 'absolute', left: s(22), top: s(9), width: s(56), height: s(69), backgroundColor: '#F4C9A0', borderWidth: bw, borderColor: ink, borderTopLeftRadius: s(26), borderTopRightRadius: s(26), borderBottomLeftRadius: s(28), borderBottomRightRadius: s(28) }} />
      {/* vlasy nahoře */}
      <View style={{ position: 'absolute', left: s(23), top: s(3), width: s(54), height: s(27), backgroundColor: '#C7BFAE', borderWidth: bw, borderColor: ink, borderTopLeftRadius: s(26), borderTopRightRadius: s(24), borderBottomLeftRadius: s(8), borderBottomRightRadius: s(14) }} />
      {/* obočí */}
      <Animated.View style={{ position: 'absolute', left: s(30), top: s(33), width: s(14), height: s(5), backgroundColor: '#8B8475', borderRadius: s(4), transform: [{ translateY: brow }] }} />
      <Animated.View style={{ position: 'absolute', left: s(56), top: s(33), width: s(14), height: s(5), backgroundColor: '#8B8475', borderRadius: s(4), transform: [{ translateY: brow }] }} />
      {/* oči */}
      <Animated.View style={{ position: 'absolute', left: s(31), top: s(38), width: s(13), height: s(13), backgroundColor: '#fff', borderWidth: bw2, borderColor: ink, borderRadius: s(7), overflow: 'hidden', transform: [{ scaleY: blink }] }}>
        <View style={{ position: 'absolute', left: s(4), top: s(5), width: s(6), height: s(6), backgroundColor: ink, borderRadius: s(3) }} />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', left: s(56), top: s(38), width: s(13), height: s(13), backgroundColor: '#fff', borderWidth: bw2, borderColor: ink, borderRadius: s(7), overflow: 'hidden', transform: [{ scaleY: blink }] }}>
        <View style={{ position: 'absolute', left: s(4), top: s(5), width: s(6), height: s(6), backgroundColor: ink, borderRadius: s(3) }} />
      </Animated.View>
      {/* nos */}
      <View style={{ position: 'absolute', left: s(45), top: s(48), width: s(11), height: s(15), backgroundColor: '#E6B488', borderRadius: s(5) }} />
      {/* pusa */}
      <Animated.View style={{ position: 'absolute', left: s(39), top: s(64), width: s(23), height: talk.interpolate({ inputRange: [7, 13], outputRange: [s(7), s(13)] }), backgroundColor: '#8A3D2E', borderWidth: bw2, borderColor: ink, borderRadius: s(6) }} />
      {/* límec */}
      <View style={{ position: 'absolute', left: s(13), top: s(84), width: s(74), height: s(19), backgroundColor: ink, borderTopLeftRadius: s(30), borderTopRightRadius: s(30) }} />
      {/* kravata */}
      <View style={{ position: 'absolute', left: s(45), top: s(84), width: s(10), height: s(17), backgroundColor: '#E23B2E', borderWidth: bw2, borderColor: ink, borderRadius: s(3) }} />
    </Animated.View>
  );
}
