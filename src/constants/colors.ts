// Notion-inspired color palette (Freelance Notion White Theme)
export const COLORS = {
  // Backgrounds
  background: '#f7f6f3',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafaf8',
  
  // Text
  textPrimary: '#191919',
  textSecondary: '#9b9b9b',
  textTertiary: '#bbb7b0',
  
  // Borders & Dividers
  border: '#e8e5e0',
  
  // Semantic colors
  accent: '#2383e2',
  success: '#37a169',
  warning: '#e9973f',
  danger: '#cb2431',
  
  // Additional
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  darkOverlay: '#2c2c2c',
};

export type ColorKey = keyof typeof COLORS;
