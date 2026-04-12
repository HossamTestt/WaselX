/**
 * WaselX Brand Theme
 * Colors, typography, spacing, shadows
 */
export const Colors = {
  // Brand
  navy:       '#142F48',
  navyDark:   '#0d1f30',
  navyLight:  '#1e4266',
  blue:       '#007BFC',
  blueHover:  '#0067d6',
  blueLight:  '#E8F3FF',
  orange:     '#FF7917',
  orangeLight:'#FFF4EB',

  // UI
  bg:         '#F3F5F9',
  surface:    '#FFFFFF',
  border:     '#E2E8F0',
  text:       '#1A2533',
  textMuted:  '#64748B',
  textLight:  '#94A3B8',

  // Status
  success:    '#10B981',
  successBg:  '#D1FAE5',
  warning:    '#F59E0B',
  warningBg:  '#FEF3C7',
  error:      '#EF4444',
  errorBg:    '#FEE2E2',

  // Map
  mapDot:     '#007BFC',
  mapLine:    '#FF7917',

  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' },
  h4: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodySmall: { fontSize: 13, fontWeight: '400' },
  caption: { fontSize: 11, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
