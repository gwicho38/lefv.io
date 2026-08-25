import { describe, it, expect } from 'vitest';
import { slugify, titleFromFilename, splitLeadingHeading, resolveDate } from '../posts';

describe('slugify', () => {
  it('strips the extension and lowercases', () => {
    expect(slugify('Hello World.md')).toBe('hello-world');
  });

  it('drops a date prefix so the slug stays clean', () => {
    expect(slugify('2024-03-01-my-post.md')).toBe('my-post');
  });

  it('collapses punctuation without leaving a trailing dash', () => {
    expect(slugify('Special Characters @#$%.md')).toBe('special-characters');
  });
});

describe('titleFromFilename', () => {
  it('title-cases a bare filename', () => {
    expect(titleFromFilename('my-first-post.md')).toBe('My First Post');
  });

  it('ignores the date prefix', () => {
    expect(titleFromFilename('2024-03-01-on-consent.md')).toBe('On Consent');
  });
});

describe('splitLeadingHeading', () => {
  it('lifts an opening H1 out of the body', () => {
    const { heading, rest } = splitLeadingHeading('# On Consent\n\nBody text.');
    expect(heading).toBe('On Consent');
    expect(rest).toBe('Body text.');
  });

  it('leaves a heading alone when prose comes first', () => {
    const body = 'Intro line.\n\n# Later Heading\n\nMore.';
    const { heading, rest } = splitLeadingHeading(body);
    expect(heading).toBeUndefined();
    expect(rest).toBe(body);
  });

  it('returns the body unchanged when there is no heading', () => {
    expect(splitLeadingHeading('Just prose.')).toEqual({ rest: 'Just prose.' });
  });
});

describe('resolveDate', () => {
  const mtime = new Date('2020-01-01T00:00:00Z');

  it('prefers frontmatter', () => {
    expect(resolveDate('2024-05-06', 'x.md', mtime).toISOString().slice(0, 10)).toBe('2024-05-06');
  });

  it('falls back to a date prefix in the filename', () => {
    expect(resolveDate(undefined, '2022-07-08-x.md', mtime).toISOString().slice(0, 10)).toBe('2022-07-08');
  });

  it('falls back to mtime rather than now, so undated posts do not float to the top', () => {
    expect(resolveDate(undefined, 'x.md', mtime)).toEqual(mtime);
  });

  it('ignores an unparseable frontmatter date', () => {
    expect(resolveDate('not a date', 'x.md', mtime)).toEqual(mtime);
  });
});
