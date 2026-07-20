// Stylované textové pole s tvrdým stínem
import React, { ReactNode, forwardRef } from 'react';
import { View, TextInput, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { FONTS } from '../theme';
import { useColors } from './ui';

interface FieldProps extends TextInputProps {
  big?: boolean;
  style?: StyleProp<ViewStyle>;
  right?: ReactNode;
}

// forwardRef: obrazovky můžou řetězit fokus (enter v jednom poli skočí do dalšího)
const Field = forwardRef<TextInput, FieldProps>(function Field(
  { value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, big, style, right, ...rest },
  ref,
) {
  const c = useColors();
  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* pointerEvents none + nižší vrstva: na webu se stín nesmí vykreslit přes input ani blokovat psaní */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, backgroundColor: c.ink, borderRadius: 13, zIndex: 0 }} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'sentences'}
        style={{
          position: 'relative', zIndex: 1,
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
});

export default Field;
