import { describe, it, expect } from 'vitest';
import { slugify, readingTimeMinutes } from '../../../../server/utils/blogPosts';

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
    expect(slugify('Hello World!.md')).toBe('hello-world');
    expect(slugify('My First Blog Post.md')).toBe('my-first-blog-post');
    expect(slugify('Special Characters @#$%.md')).toBe('special-characters');
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
  it('should calculate reading time correctly', () => {
    expect(readingTimeMinutes('This is a short text with ten words exactly here.')).toBe(1);
  });

  it('should handle long text', () => {
    expect(readingTimeMinutes(Array(500).fill('word').join(' '))).toBe(3);
  });

  it('should report a one minute floor for empty text', () => {
    expect(readingTimeMinutes('')).toBe(1);
    expect(readingTimeMinutes('   ')).toBe(1);
  });
});
