// Barevná témata a fonty – přesně podle Claude Design (Babišovník.dc.html)

export const THEMES = {
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
