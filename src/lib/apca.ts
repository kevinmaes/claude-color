/**
 * APCA (Accessible Perceptual Contrast Algorithm) utilities
 *
 * APCA returns a Lightness Contrast (Lc) value:
 * - Positive Lc: dark text on light background (BoW - Black on White)
 * - Negative Lc: light text on dark background (WoB - White on Black)
 * - Absolute value indicates contrast strength (0-108 range typical)
 */

// @ts-expect-error - apca-w3 has no type definitions
import { calcAPCA } from 'apca-w3';

export type UseCase =
  | 'body-text'
  | 'large-text'
  | 'ui-component'
  | 'non-text'
  | 'placeholder'
  | 'disabled';

export type FontWeight = 'normal' | 'bold';

export interface ContrastResult {
  /** APCA Lightness Contrast value (signed) */
  lc: number;
  /** Absolute Lc value */
  lcAbsolute: number;
  /** Whether the contrast meets the minimum for the use case */
  passes: boolean;
  /** Minimum Lc required for this use case */
  minimumLc: number;
  /** Polarity: dark text on light bg, or light text on dark bg */
  polarity: 'dark-on-light' | 'light-on-dark';
  /** Human-readable recommendation if failing */
  recommendation: string | null;
  /** APCA rating based on absolute Lc */
  rating: 'AAA' | 'AA' | 'A' | 'fail';
}

/**
 * APCA Lc thresholds by use case
 *
 * These are conservative minimums based on APCA guidelines.
 * Higher values are always better for readability.
 */
const USE_CASE_THRESHOLDS: Record<UseCase, number> = {
  'body-text': 75, // 16px normal weight
  'large-text': 60, // 24px+ or bold
  'ui-component': 60, // Interactive elements
  'non-text': 45, // Icons, graphics
  placeholder: 45, // Placeholder text (with other indicators)
  disabled: 45, // Disabled states (with other indicators)
};

/**
 * Determine minimum Lc based on use case, font size, and weight
 */
export function getMinimumLc(
  useCase: UseCase,
  fontSize: number,
  fontWeight: FontWeight
): number {
  // If use case is explicitly set to something other than body-text,
  // use that threshold directly
  if (useCase !== 'body-text') {
    return USE_CASE_THRESHOLDS[useCase];
  }

  // For body text, adjust based on font size and weight
  const isLarge = fontSize >= 24;
  const isBold = fontWeight === 'bold';

  if (isLarge || isBold) {
    return 60; // Large or bold text can use lower contrast
  }

  return 75; // Standard body text
}

/**
 * Get rating based on absolute Lc value
 */
function getRating(lcAbsolute: number): 'AAA' | 'AA' | 'A' | 'fail' {
  if (lcAbsolute >= 90) return 'AAA';
  if (lcAbsolute >= 75) return 'AA';
  if (lcAbsolute >= 60) return 'A';
  return 'fail';
}

/**
 * Generate a recommendation for improving contrast
 */
function getRecommendation(
  passes: boolean,
  lcAbsolute: number,
  minimumLc: number,
  useCase: UseCase
): string | null {
  if (passes) return null;

  const deficit = minimumLc - lcAbsolute;

  if (lcAbsolute < 15) {
    return `Contrast is too low for any text use. Current Lc: ${lcAbsolute.toFixed(1)}, need at least ${minimumLc} for ${useCase}.`;
  }

  if (lcAbsolute < 45) {
    return `Only suitable for decorative or non-essential elements. Increase contrast by ~${deficit.toFixed(0)} Lc points for ${useCase}.`;
  }

  return `Increase contrast by ~${deficit.toFixed(0)} Lc points. Try darkening the text or lightening the background (or vice versa for dark mode).`;
}

/**
 * Check contrast between foreground and background colors using APCA
 *
 * @param foreground - Text/foreground color (hex, rgb, hsl, or named color)
 * @param background - Background color (hex, rgb, hsl, or named color)
 * @param options - Font size, weight, and use case
 * @returns ContrastResult with Lc value and pass/fail status
 */
export function checkContrast(
  foreground: string,
  background: string,
  options: {
    fontSize?: number;
    fontWeight?: FontWeight;
    useCase?: UseCase;
  } = {}
): ContrastResult {
  const {
    fontSize = 16,
    fontWeight = 'normal',
    useCase = 'body-text',
  } = options;

  // Calculate APCA contrast
  // calcAPCA returns signed Lc: positive = dark on light, negative = light on dark
  const lc = calcAPCA(foreground, background) as number;
  const lcAbsolute = Math.abs(lc);
  const polarity: 'dark-on-light' | 'light-on-dark' =
    lc >= 0 ? 'dark-on-light' : 'light-on-dark';

  // Determine minimum threshold
  const minimumLc = getMinimumLc(useCase, fontSize, fontWeight);

  // Check if it passes
  const passes = lcAbsolute >= minimumLc;

  // Get rating and recommendation
  const rating = getRating(lcAbsolute);
  const recommendation = getRecommendation(
    passes,
    lcAbsolute,
    minimumLc,
    useCase
  );

  return {
    lc: Math.round(lc * 10) / 10, // Round to 1 decimal
    lcAbsolute: Math.round(lcAbsolute * 10) / 10,
    passes,
    minimumLc,
    polarity,
    recommendation,
    rating,
  };
}
