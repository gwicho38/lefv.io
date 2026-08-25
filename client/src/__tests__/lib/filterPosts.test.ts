import { describe, it, expect } from 'vitest';
import { filterPosts, collectTagNames } from '@/lib/filterPosts';
import type { Post } from '@/components/blog/PostIndex';

const post = (over: Partial<Post>): Post => ({
  id: 1, slug: 's', title: 'T', excerpt: 'E', readingTime: 1,
  createdAt: '2025-01-01T00:00:00.000Z', tags: [], ...over,
});

const posts: Post[] = [
  post({ id: 1, slug: 'swab', title: 'Brief Against Compelling Buccal Swab',
         excerpt: 'DNA sample and the Fourth Amendment',
         tags: [{ id: 1, name: 'law' }, { id: 2, name: 'criminal-procedure' }] }),
  post({ id: 2, slug: 'games', title: 'Development Implications of Repeated Games',
         excerpt: "The prisoner's dilemma as a model",
         tags: [{ id: 1, name: 'law' }, { id: 2, name: 'game-theory' }] }),
  post({ id: 3, slug: 'diamond', title: 'The Diamond Model and the FireEye Cyberattack',
         excerpt: 'Intrusion analysis', tags: [{ id: 1, name: 'security' }] }),
];

describe('filterPosts', () => {
  it('returns everything when nothing is being filtered', () => {
    expect(filterPosts(posts, '', null)).toHaveLength(3);
  });

  it('matches on title, case-insensitively', () => {
    expect(filterPosts(posts, 'diamond', null).map(p => p.slug)).toEqual(['diamond']);
  });

  it('matches on excerpt so search is not limited to titles', () => {
    expect(filterPosts(posts, 'prisoner', null).map(p => p.slug)).toEqual(['games']);
  });

  it('matches on tag names', () => {
    expect(filterPosts(posts, 'security', null).map(p => p.slug)).toEqual(['diamond']);
  });

  it('requires every term, so more words narrow rather than widen', () => {
    expect(filterPosts(posts, 'repeated games', null).map(p => p.slug)).toEqual(['games']);
    expect(filterPosts(posts, 'repeated diamond', null)).toHaveLength(0);
  });

  it('filters by tag', () => {
    expect(filterPosts(posts, '', 'law').map(p => p.slug)).toEqual(['swab', 'games']);
  });

  it('combines tag and query', () => {
    expect(filterPosts(posts, 'buccal', 'law').map(p => p.slug)).toEqual(['swab']);
    expect(filterPosts(posts, 'buccal', 'security')).toHaveLength(0);
  });

  it('ignores surrounding whitespace in the query', () => {
    expect(filterPosts(posts, '   diamond   ', null)).toHaveLength(1);
  });
});

describe('collectTagNames', () => {
  it('lists each tag once, sorted', () => {
    expect(collectTagNames(posts)).toEqual([
      'criminal-procedure', 'game-theory', 'law', 'security',
    ]);
  });

  it('handles posts with no tags', () => {
    expect(collectTagNames([post({ tags: [] })])).toEqual([]);
  });
});
