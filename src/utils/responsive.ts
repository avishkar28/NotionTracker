import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints for different screen sizes
export const SCREEN_SIZES = {
  SMALL: width < 380,    // Small phones
  MEDIUM: width >= 380 && width < 600,  // Regular phones
  LARGE: width >= 600 && width < 900,   // Tablets / Large phones
  EXTRA_LARGE: width >= 900,             // Large tablets
};

// Responsive scaling function
export const scale = (size: number): number => {
  return (width / 375) * size; // 375 is standard iPhone width
};

// Responsive font sizes
export const responsiveFontSize = {
  h1: scale(32),
  h2: scale(24),
  h3: scale(20),
  body: scale(14),
  small: scale(12),
  tiny: scale(10),
};

// Responsive spacing
export const responsiveSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
};

// Responsive padding
export const getResponsivePadding = (): { horizontal: number; vertical: number } => {
  if (SCREEN_SIZES.SMALL) {
    return { horizontal: scale(12), vertical: scale(8) };
  } else if (SCREEN_SIZES.MEDIUM) {
    return { horizontal: scale(16), vertical: scale(12) };
  } else if (SCREEN_SIZES.LARGE) {
    return { horizontal: scale(20), vertical: scale(16) };
  } else {
    return { horizontal: scale(24), vertical: scale(20) };
  }
};

// Responsive card dimensions
export const getResponsiveCardDimensions = (): { width: number; marginBottom: number } => {
  if (SCREEN_SIZES.SMALL) {
    return { width: width - scale(24), marginBottom: scale(12) };
  } else if (SCREEN_SIZES.MEDIUM) {
    return { width: width - scale(32), marginBottom: scale(16) };
  } else if (SCREEN_SIZES.LARGE) {
    return { width: (width - scale(48)) / 2, marginBottom: scale(16) };
  } else {
    return { width: (width - scale(64)) / 3, marginBottom: scale(20) };
  }
};

// Responsive grid layout
export const getGridColumns = (): number => {
  if (SCREEN_SIZES.SMALL) {
    return 1;
  } else if (SCREEN_SIZES.MEDIUM) {
    return 1;
  } else if (SCREEN_SIZES.LARGE) {
    return 2;
  } else {
    return 3;
  }
};

// Get responsive margin
export const getResponsiveMargin = (): number => {
  return SCREEN_SIZES.SMALL ? scale(12) : SCREEN_SIZES.MEDIUM ? scale(16) : scale(20);
};

// Responsive border radius
export const getResponsiveBorderRadius = (): number => {
  return SCREEN_SIZES.SMALL ? scale(6) : scale(8);
};

// Responsive dimensions hook-like export for easy use
export const responsiveDimensions = {
  screenWidth: width,
  screenHeight: height,
  isSmallScreen: SCREEN_SIZES.SMALL,
  isMediumScreen: SCREEN_SIZES.MEDIUM,
  isLargeScreen: SCREEN_SIZES.LARGE,
  isExtraLargeScreen: SCREEN_SIZES.EXTRA_LARGE,
  fontSize: responsiveFontSize,
  spacing: responsiveSpacing,
  padding: getResponsivePadding(),
  cardDimensions: getResponsiveCardDimensions(),
  gridColumns: getGridColumns(),
  borderRadius: getResponsiveBorderRadius(),
};
