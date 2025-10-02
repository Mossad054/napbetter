// Light theme colors
export const LIGHT_COLORS = {
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#FAFAFA',
  
  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Primary colors
  primary: '#2ECC71',
  primaryDark: '#27AE60',
  
  // Accent colors
  accent: '#1ABC9C',
  accentLight: '#48C9B0',
  
  // Status colors
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  
  // Mood colors
  moodAwful: '#FF6B6B',
  moodBad: '#FF7F50', 
  moodMeh: '#4ECDC4',
  moodGood: '#58D68D',
  moodRad: '#2ECC71',
  
  // UI colors
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Dark theme colors (imported from darkTheme.ts)
import { DARK_COLORS } from './darkTheme';

// Currently active colors - this will be updated when theme changes
let CURRENT_COLORS = LIGHT_COLORS;
export const COLORS = CURRENT_COLORS;

// Function to set the current theme colors
export const setTheme = (isDarkMode: boolean) => {
  CURRENT_COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  // Update the exported COLORS object to point to the new theme
  Object.assign(COLORS, CURRENT_COLORS);
};

// Function to get colors based on theme mode
export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? DARK_COLORS : LIGHT_COLORS;
};

// Spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius constants
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 999,
};

// Typography constants
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};