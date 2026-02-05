/**
 * Color utility functions for brightness detection and contrast calculation
 */

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., "#FFFFFF" or "FFFFFF")
 * @returns RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');
  
  // Parse hex string
  const bigint = parseInt(cleanHex, 16);
  
  if (isNaN(bigint)) {
    return null;
  }
  
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Calculate relative luminance of a color using WCAG formula
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Relative luminance (0-1)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  // Convert RGB to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Determine if a color is light or dark based on luminance
 * @param color - Hex color string
 * @returns true if the color is light, false if dark
 */
export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return true; // Default to light if parsing fails
  }
  
  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  
  // Threshold: 0.5 is middle gray
  // Colors with luminance > 0.5 are considered light
  return luminance > 0.5;
}

/**
 * Get optimal text color (dark or light) for a given background color
 * @param backgroundColor - Hex color string of the background
 * @returns Hex color string for text ("#1A1A1A" for dark text, "#FFFFFF" for light text)
 */
export function getContrastTextColor(backgroundColor: string): string {
  const isLight = isLightColor(backgroundColor);
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return isLight ? "#1A1A1A" : "#FFFFFF";
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * @param color1 - First hex color string
 * @param color2 - Second hex color string
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    return 1; // Minimum contrast if parsing fails
  }
  
  const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

