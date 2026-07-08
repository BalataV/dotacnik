// Znovupoužitelné UI prvky v neo-brutalistickém stylu
import React, { useState, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { THEMES, FONTS } from '../theme';
import { useApp } from '../store';
import type { ThemeColors } from '../types';

// Hook vracející aktuální barvy podle zvoleného tématu
export function useColors(): ThemeColors {
  const { state } = useApp();
  return THEMES[state.userTheme] || THEMES.zluta;
}

interface HardShadowProps {
  offset?: number;
  radius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

// Kontejner s "tvrdým" posunutým stínem (box-shadow: Npx Npx 0 ink)
export function HardShadow({ offset = 4, radius = 14, color, style, children }: HardShadowProps) {
  const c = useColors();
  return (
    <View style={[{ position: 'relative' }, style]}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: offset, left: offset, right: -offset, bottom: -offset,
          backgroundColor: color || c.ink, borderRadius: radius,
        }}
      />
      {children}
    </View>
  );
}

interface PushableProps {
  onPress?: () => void;
  disabled?: boolean;
  offset?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children?: ReactNode;
}

// Tlačítko s tvrdým stínem a "stiskem" (posun o 2px, zmenšení stínu)
export function Pushable({ onPress, disabled, offset = 4, radius = 14, style, contentStyle, accessibilityLabel, children }: PushableProps) {
  const c = useColors();
  const [pressed, setPressed] = useState(false);
  const o = pressed ? Math.max(1, offset - 2) : offset;
  const shift = pressed ? 2 : 0;
  // U průhledných (outline) tlačítek se stín nekreslí, aby neprosvítal jako tmavá plocha
  const showShadow = offset > 0;
  return (
    <View style={[{ position: 'relative', opacity: disabled ? 0.45 : 1 }, style]}>
      {showShadow && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', top: o, left: o, right: -o, bottom: -o,
            backgroundColor: c.ink, borderRadius: radius,
          }}
        />
      )}
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!disabled }}
        style={[{ transform: [{ translateX: shift }, { translateY: shift }] }, contentStyle]}
      >
        {children}
      </Pressable>
    </View>
  );
}

interface AvatarProps {
  name?: string;
  initial: string;
  color: string;
  size?: number;
  fontSize?: number;
}

// Kruhový avatar s iniciálou
export function Avatar({ name, initial, color, size = 30, fontSize = 11 }: AvatarProps) {
  const c = useColors();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: color,
        borderWidth: 2, borderColor: c.ink, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontFamily: FONTS.body800, fontSize }}>{initial}</Text>
    </View>
  );
}

interface LabelProps {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
}

// Popisek sekce (velká písmena, prostrkané)
export function Label({ children, style }: LabelProps) {
  const c = useColors();
  return (
    <Text style={[styles.label, { color: c.onbg }, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.body800, fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 7, opacity: 0.7,
  },
});
