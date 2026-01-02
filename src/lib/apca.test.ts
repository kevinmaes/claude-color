import { describe, it, expect } from 'vitest';
import { checkContrast, getMinimumLc } from './apca.js';

describe('checkContrast', () => {
  describe('basic contrast calculations', () => {
    it('returns high contrast for black on white', () => {
      const result = checkContrast('#000000', '#ffffff');

      expect(result.lc).toBeGreaterThan(100);
      expect(result.passes).toBe(true);
      expect(result.polarity).toBe('dark-on-light');
      expect(result.rating).toBe('AAA');
    });

    it('returns high contrast for white on black (negative Lc)', () => {
      const result = checkContrast('#ffffff', '#000000');

      expect(result.lc).toBeLessThan(-100);
      expect(result.lcAbsolute).toBeGreaterThan(100);
      expect(result.passes).toBe(true);
      expect(result.polarity).toBe('light-on-dark');
      expect(result.rating).toBe('AAA');
    });

    it('returns low contrast for similar colors', () => {
      const result = checkContrast('#888888', '#999999');

      expect(result.lcAbsolute).toBeLessThan(20);
      expect(result.passes).toBe(false);
      expect(result.rating).toBe('fail');
      expect(result.recommendation).not.toBeNull();
    });

    it('returns zero or near-zero for identical colors', () => {
      const result = checkContrast('#808080', '#808080');

      expect(result.lcAbsolute).toBeLessThan(1);
      expect(result.passes).toBe(false);
    });
  });

  describe('color format parsing', () => {
    it('accepts hex colors with #', () => {
      const result = checkContrast('#000', '#fff');
      expect(result.lcAbsolute).toBeGreaterThan(100);
    });

    it('accepts 6-digit hex colors', () => {
      const result = checkContrast('#000000', '#ffffff');
      expect(result.lcAbsolute).toBeGreaterThan(100);
    });

    it('accepts rgb() format', () => {
      const result = checkContrast('rgb(0,0,0)', 'rgb(255,255,255)');
      expect(result.lcAbsolute).toBeGreaterThan(100);
    });

    it('accepts named colors', () => {
      const result = checkContrast('black', 'white');
      expect(result.lcAbsolute).toBeGreaterThan(100);
    });
  });

  describe('use case thresholds', () => {
    it('uses 75 Lc threshold for body text by default', () => {
      const result = checkContrast('#000000', '#ffffff');
      expect(result.minimumLc).toBe(75);
    });

    it('uses 60 Lc threshold for large text', () => {
      const result = checkContrast('#000000', '#ffffff', {
        useCase: 'large-text',
      });
      expect(result.minimumLc).toBe(60);
    });

    it('uses 60 Lc threshold for UI components', () => {
      const result = checkContrast('#000000', '#ffffff', {
        useCase: 'ui-component',
      });
      expect(result.minimumLc).toBe(60);
    });

    it('uses 45 Lc threshold for placeholders', () => {
      const result = checkContrast('#000000', '#ffffff', {
        useCase: 'placeholder',
      });
      expect(result.minimumLc).toBe(45);
    });

    it('uses 45 Lc threshold for disabled states', () => {
      const result = checkContrast('#000000', '#ffffff', {
        useCase: 'disabled',
      });
      expect(result.minimumLc).toBe(45);
    });
  });

  describe('font size and weight adjustments', () => {
    it('uses 75 Lc for 16px normal body text', () => {
      const result = checkContrast('#000000', '#ffffff', {
        fontSize: 16,
        fontWeight: 'normal',
        useCase: 'body-text',
      });
      expect(result.minimumLc).toBe(75);
    });

    it('uses 60 Lc for 16px bold body text', () => {
      const result = checkContrast('#000000', '#ffffff', {
        fontSize: 16,
        fontWeight: 'bold',
        useCase: 'body-text',
      });
      expect(result.minimumLc).toBe(60);
    });

    it('uses 60 Lc for 24px+ text regardless of weight', () => {
      const result = checkContrast('#000000', '#ffffff', {
        fontSize: 24,
        fontWeight: 'normal',
        useCase: 'body-text',
      });
      expect(result.minimumLc).toBe(60);
    });
  });

  describe('ratings', () => {
    it('returns AAA for Lc >= 90', () => {
      // Black on white gives ~106 Lc
      const result = checkContrast('#000000', '#ffffff');
      expect(result.rating).toBe('AAA');
    });

    it('returns AA for Lc >= 75 and < 90', () => {
      // #555555 on white gives ~77 Lc
      const result = checkContrast('#555555', '#ffffff');
      expect(result.lcAbsolute).toBeGreaterThanOrEqual(75);
      expect(result.lcAbsolute).toBeLessThan(90);
      expect(result.rating).toBe('AA');
    });

    it('returns fail for Lc < 60', () => {
      // Very low contrast
      const result = checkContrast('#777777', '#999999');
      expect(result.lcAbsolute).toBeLessThan(60);
      expect(result.rating).toBe('fail');
    });
  });

  describe('recommendations', () => {
    it('returns null recommendation when passing', () => {
      const result = checkContrast('#000000', '#ffffff');
      expect(result.recommendation).toBeNull();
    });

    it('provides recommendation when failing', () => {
      // #777777 on white gives ~71 Lc, which fails body-text (75) but is high enough
      // to get a helpful "increase contrast" message rather than "too low"
      const result = checkContrast('#777777', '#ffffff');
      expect(result.passes).toBe(false);
      expect(result.recommendation).not.toBeNull();
      expect(result.recommendation).toContain('Increase contrast');
    });

    it('warns about very low contrast', () => {
      const result = checkContrast('#808080', '#858585');
      expect(result.recommendation).toContain('too low');
    });
  });
});

describe('getMinimumLc', () => {
  it('returns 75 for body-text at 16px normal', () => {
    expect(getMinimumLc('body-text', 16, 'normal')).toBe(75);
  });

  it('returns 60 for body-text at 16px bold', () => {
    expect(getMinimumLc('body-text', 16, 'bold')).toBe(60);
  });

  it('returns 60 for body-text at 24px', () => {
    expect(getMinimumLc('body-text', 24, 'normal')).toBe(60);
  });

  it('returns threshold directly for non-body-text use cases', () => {
    expect(getMinimumLc('large-text', 16, 'normal')).toBe(60);
    expect(getMinimumLc('ui-component', 12, 'normal')).toBe(60);
    expect(getMinimumLc('placeholder', 14, 'normal')).toBe(45);
    expect(getMinimumLc('disabled', 14, 'normal')).toBe(45);
    expect(getMinimumLc('non-text', 16, 'normal')).toBe(45);
  });
});
