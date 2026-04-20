import { Dimensions } from 'react-native';

export const W = Dimensions.get('window').width;
export const H = Dimensions.get('window').height;

export const colors = {
  primary:   '#1a2340',
  accent:    '#0ea5e9',
  teal:      '#0d9488',
  danger:    '#ef4444',
  warning:   '#f59e0b',
  success:   '#10b981',
  purple:    '#8b5cf6',
  bg:        '#f1f5f9',
  card:      '#ffffff',
  text:      '#0f172a',
  textSub:   '#64748b',
  textLight: '#94a3b8',
  border:    '#e2e8f0',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const font = {
  xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28,
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};
