import { Platform } from 'react-native';

export const colors = {
  background: '#080808',
  foreground: '#F2F2F2',

  card: '#111111',
  cardForeground: '#F2F2F2',

  primary: '#22D3EE',
  primaryForeground: '#080808',

  secondary: '#1A1A1A',
  secondaryForeground: '#D4D4D4',

  muted: '#1C1C1C',
  mutedForeground: '#737373',

  border: '#262626',
  input: '#161616',
  ring: 'rgba(34,211,238,0.4)',

  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',

  success: '#22C55E',
  successForeground: '#FFFFFF',

  warning: '#EAB308',
  warningForeground: '#000000',

  info: '#0EA5E9',
  infoForeground: '#FFFFFF',

  accent: '#22D3EE',
  accentForeground: '#080808',

  glass: {
    background: 'rgba(255,255,255,0.05)',
    backgroundMedium: 'rgba(255,255,255,0.08)',
    backgroundStrong: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    highlight: 'rgba(255,255,255,0.18)',
    tint: 'systemUltraThinMaterialDark' as const,
    intensity: Platform.OS === 'ios' ? 35 : 55,
    intensityStrong: Platform.OS === 'ios' ? 55 : 75,
  },

  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.5)',
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
