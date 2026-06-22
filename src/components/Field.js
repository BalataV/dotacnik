// Stylované textové pole s tvrdým stínem
import React from 'react';
import { View, TextInput } from 'react-native';
import { FONTS } from '../theme';
import { useColors } from './ui';

export default function Field({ value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, big, style, right, ...rest }) {
  const c = useColors();
  return (
    <View style={[{ position: 'relative' }, style]}>
      <View style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 13 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'sentences'}
        style={{
          backgroundColor: c.card, borderWidth: 3, borderColor: c.ink, borderRadius: 13,
          paddingVertical: 13, paddingLeft: 15, paddingRight: right ? 50 : 15,
          fontFamily: big ? FONTS.display700 : FONTS.body700,
          fontSize: big ? 22 : 16, color: c.ink,
        }}
        {...rest}
      />
      {right}
    </View>
  );
}
