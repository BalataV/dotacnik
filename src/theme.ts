// Barevná témata a fonty – přesně podle Claude Design (Babišovník.dc.html)
import type { ThemeName, ThemeColors } from './types';

export const THEMES: Record<ThemeName, ThemeColors> = {
  zluta: {
    bg: '#FFD60A', bg2: '#FFE680', card: '#FFFFFF', ink: '#15233B',
    muted: '#7A839A', accent: '#1D5FD8', accent2: '#FF5A36',
    good: '#1FA06A', bad: '#E23B2E', onbg: '#15233B',
  },
  modra: {
    bg: '#102A43', bg2: '#1B3B5C', card: '#FFF8E7', ink: '#15233B',
    muted: '#86909F', accent: '#1D5FD8', accent2: '#FF8A3D',
    good: '#1FA06A', bad: '#E23B2E', onbg: '#FFF8E7',
  },
  // Plný tmavý režim: tmavé pozadí i karty, světlé okraje/text (ink = světlá).
  // Karty (c.card) i text na nich (c.ink) se tím v celé appce obrátí samy.
  tmava: {
    bg: '#0F1A2C', bg2: '#1A2840', card: '#1E2D45', ink: '#F2E8CE',
    muted: '#9AA6BC', accent: '#4A86FF', accent2: '#FF7A4D',
    good: '#34C58A', bad: '#FF6155', onbg: '#F2E8CE',
  },
};

// Mapování vah na konkrétní názvy fontů (v RN se váha řeší přes fontFamily)
// Display = Baloo 2 (kulatý, hravý, plná podpora češtiny vč. háčků a čárek)
export const FONTS = {
  display400: 'Baloo2_400Regular',
  display500: 'Baloo2_500Medium',
  display600: 'Baloo2_600SemiBold',
  display700: 'Baloo2_700Bold',
  body400: 'Nunito_400Regular',
  body600: 'Nunito_600SemiBold',
  body700: 'Nunito_700Bold',
  body800: 'Nunito_800ExtraBold',
  body900: 'Nunito_900Black',
};
