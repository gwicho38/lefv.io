import { toRects, mapSize } from '@/lib/pixels';

const PAL = { a: '#aaa', b: '#bbb' };

describe('toRects', () => {
  it('collapses a run of identical pixels into one rect', () => {
    expect(toRects(['aaa'], PAL)).toEqual([{ x: 0, y: 0, w: 3, fill: '#aaa' }]);
  });

  it('splits a row where the colour changes', () => {
    expect(toRects(['aab'], PAL)).toEqual([
      { x: 0, y: 0, w: 2, fill: '#aaa' },
      { x: 2, y: 0, w: 1, fill: '#bbb' },
    ]);
  });

  it('emits nothing for transparent cells', () => {
    expect(toRects(['a.a'], PAL)).toEqual([
      { x: 0, y: 0, w: 1, fill: '#aaa' },
      { x: 2, y: 0, w: 1, fill: '#aaa' },
    ]);
  });

  it('does not merge across a transparent gap', () => {
    expect(toRects(['a.a'], PAL)).toHaveLength(2);
  });

  it('tracks the row index as y', () => {
    expect(toRects(['a', 'b'], PAL)).toEqual([
      { x: 0, y: 0, w: 1, fill: '#aaa' },
      { x: 0, y: 1, w: 1, fill: '#bbb' },
    ]);
  });

  it('offsets every rect by ox and oy', () => {
    expect(toRects(['a'], PAL, { ox: 5, oy: 7 })).toEqual([
      { x: 5, y: 7, w: 1, fill: '#aaa' },
    ]);
  });

  it('substitutes palette entries named in swap', () => {
    expect(toRects(['a'], PAL, { swap: { a: 'b' } })).toEqual([
      { x: 0, y: 0, w: 1, fill: '#bbb' },
    ]);
  });

  it('throws on a character with no palette entry', () => {
    expect(() => toRects(['z'], PAL)).toThrow(/z/);
  });
});

describe('mapSize', () => {
  it('measures width from the longest row', () => {
    expect(mapSize(['ab', 'abcd', 'a'])).toEqual({ width: 4, height: 3 });
  });

  it('measures an empty map as zero', () => {
    expect(mapSize([])).toEqual({ width: 0, height: 0 });
  });
});
