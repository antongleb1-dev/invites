import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  calculateLuminance,
  isLightColor,
  getContrastTextColor,
  calculateContrastRatio,
} from './colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('should convert hex color with # to RGB', () => {
      const result = hexToRgb('#FFFFFF');
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert hex color without # to RGB', () => {
      const result = hexToRgb('000000');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert golden color to RGB', () => {
      const result = hexToRgb('#D4AF37');
      expect(result).toEqual({ r: 212, g: 175, b: 55 });
    });

    it('should return null for invalid hex', () => {
      const result = hexToRgb('invalid');
      expect(result).toBeNull();
    });
  });

  describe('calculateLuminance', () => {
    it('should return 1 for white (255, 255, 255)', () => {
      const luminance = calculateLuminance(255, 255, 255);
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should return 0 for black (0, 0, 0)', () => {
      const luminance = calculateLuminance(0, 0, 0);
      expect(luminance).toBe(0);
    });

    it('should calculate luminance for middle gray (128, 128, 128)', () => {
      const luminance = calculateLuminance(128, 128, 128);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('isLightColor', () => {
    it('should return true for white', () => {
      expect(isLightColor('#FFFFFF')).toBe(true);
    });

    it('should return false for black', () => {
      expect(isLightColor('#000000')).toBe(false);
    });

    it('should return true for light beige (#F5F0E8)', () => {
      expect(isLightColor('#F5F0E8')).toBe(true);
    });

    it('should return false for dark blue (#1A2B4A)', () => {
      expect(isLightColor('#1A2B4A')).toBe(false);
    });

    it('should return false for golden (#D4AF37)', () => {
      // Golden has medium luminance (below 0.5 threshold), classified as dark
      expect(isLightColor('#D4AF37')).toBe(false);
    });
  });

  describe('getContrastTextColor', () => {
    it('should return dark text for white background', () => {
      expect(getContrastTextColor('#FFFFFF')).toBe('#1A1A1A');
    });

    it('should return light text for black background', () => {
      expect(getContrastTextColor('#000000')).toBe('#FFFFFF');
    });

    it('should return dark text for light beige background', () => {
      expect(getContrastTextColor('#F5F0E8')).toBe('#1A1A1A');
    });

    it('should return light text for dark navy background', () => {
      expect(getContrastTextColor('#1A2B4A')).toBe('#FFFFFF');
    });
  });

  describe('calculateContrastRatio', () => {
    it('should return 21 for black on white (maximum contrast)', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1 for same colors (no contrast)', () => {
      const ratio = calculateContrastRatio('#FFFFFF', '#FFFFFF');
      expect(ratio).toBe(1);
    });

    it('should calculate ratio for dark text on light background', () => {
      const ratio = calculateContrastRatio('#1A1A1A', '#F5F0E8');
      // Should meet WCAG AA standard (4.5:1)
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should calculate ratio for light text on dark background', () => {
      const ratio = calculateContrastRatio('#FFFFFF', '#1A2B4A');
      // Should meet WCAG AA standard (4.5:1)
      expect(ratio).toBeGreaterThan(4.5);
    });
  });

  describe('WCAG AA compliance', () => {
    it('should ensure getContrastTextColor produces sufficient contrast for light backgrounds', () => {
      const lightBg = '#F5F0E8';
      const textColor = getContrastTextColor(lightBg);
      const ratio = calculateContrastRatio(textColor, lightBg);
      
      // WCAG AA requires 4.5:1 for normal text
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should ensure getContrastTextColor produces sufficient contrast for dark backgrounds', () => {
      const darkBg = '#1A2B4A';
      const textColor = getContrastTextColor(darkBg);
      const ratio = calculateContrastRatio(textColor, darkBg);
      
      // WCAG AA requires 4.5:1 for normal text
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

