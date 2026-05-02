// Notion-inspired color palette
export const COLORS = {
  // Backgrounds
  background: '#ffffff',
  backgroundSecondary: '#fbfbfa',
  
  // Text
  textPrimary: '#37352f',
  textSecondary: '#787774',
  textTertiary: '#9b9390',
  
  // Borders & Dividers
  border: 'rgba(0,0,0,0.08)',
  
  // Semantic colors
  accent: '#0a66d2',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#d44536',
  
  // Additional
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export type ColorKey = keyof typeof COLORS;
