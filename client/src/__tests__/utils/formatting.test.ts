import { describe, it, expect } from 'vitest';

// Utility functions that might exist in your app
// These are common formatting utilities that would be useful to test

describe('Date Formatting', () => {
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  it('should format date strings correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('January 15, 2024');
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-12-25');
    const result = formatDate(date);
    expect(result).toBe('December 25, 2024');
  });

  it('should handle invalid dates gracefully', () => {
    expect(() => formatDate('invalid-date')).not.toThrow();
  });
});

describe('Text Utilities', () => {
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  it('should truncate text correctly', () => {
    const longText = 'This is a very long text that should be truncated';
    const result = truncateText(longText, 20);
    expect(result).toBe('This is a very long ...');
  });

  it('should not truncate short text', () => {
    const shortText = 'Short text';
    const result = truncateText(shortText, 20);
    expect(result).toBe('Short text');
  });

  it('should create proper slugs', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('My First Blog Post')).toBe('my-first-blog-post');
    expect(slugify('Special Characters @#$%')).toBe('special-characters');
  });

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('');
    expect(truncateText('', 10)).toBe('');
  });
});

describe('Number Formatting', () => {
  const formatNumber = (num: number, decimals: number = 1): string => {
    return num.toFixed(decimals);
  };

  const formatTemperature = (temp: number): string => {
    return `${formatNumber(temp, 1)}°F`;
  };

  const formatPercentage = (value: number): string => {
    return `${formatNumber(value, 0)}%`;
  };

  it('should format numbers with correct decimals', () => {
    expect(formatNumber(123.456, 2)).toBe('123.46');
    expect(formatNumber(123.456, 0)).toBe('123');
    expect(formatNumber(123.456)).toBe('123.5');
  });

  it('should format temperature correctly', () => {
    expect(formatTemperature(72.5)).toBe('72.5°F');
    expect(formatTemperature(100)).toBe('100.0°F');
  });

  it('should format percentage correctly', () => {
    expect(formatPercentage(75.6)).toBe('76%');
    expect(formatPercentage(100)).toBe('100%');
  });
});

describe('Reading Time Calculator', () => {
  const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  it('should calculate reading time correctly', () => {
    const shortText = 'This is a short text with ten words exactly here.';
    expect(calculateReadingTime(shortText)).toBe(1); // 10 words, 200 wpm = 1 minute minimum
  });

  it('should handle long text', () => {
    const longText = Array(500).fill('word').join(' '); // 500 words
    expect(calculateReadingTime(longText)).toBe(3); // 500/200 = 2.5, rounded up to 3
  });

  it('should handle empty text', () => {
    expect(calculateReadingTime('')).toBe(0);
    expect(calculateReadingTime('   ')).toBe(0);
  });

  it('should allow custom words per minute', () => {
    const text = Array(100).fill('word').join(' '); // 100 words
    expect(calculateReadingTime(text, 100)).toBe(1); // 100/100 = 1
    expect(calculateReadingTime(text, 50)).toBe(2); // 100/50 = 2
  });
});