import {
  BOOMBOX_MAP, BOOMBOX_PALETTE, BOOMBOX_DISPLAY, BOOMBOX_KEYS, BOOMBOX_KEY_ROW, KEY_MAPS,
} from '@/data/boomboxMap';
import { mapSize, toRects } from '@/lib/pixels';

describe('BOOMBOX_MAP', () => {
  it('is 56 wide', () => {
    expect(mapSize(BOOMBOX_MAP).width).toBe(56);
  });

  it('has every row the same width', () => {
    expect([...new Set(BOOMBOX_MAP.map(r => r.length))]).toEqual([56]);
  });

  it('uses only characters the palette defines', () => {
    expect(() => toRects(BOOMBOX_MAP, BOOMBOX_PALETTE)).not.toThrow();
  });

  it('leaves the display transparent so the readout shows through', () => {
    const { x, y, w, h } = BOOMBOX_DISPLAY;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        expect(BOOMBOX_MAP[row][col]).toBe('.');
      }
    }
  });

  it('paints the pixel either side of the display', () => {
    const { x, y, w } = BOOMBOX_DISPLAY;
    expect(BOOMBOX_MAP[y][x - 1]).not.toBe('.');
    expect(BOOMBOX_MAP[y][x + w]).not.toBe('.');
  });
});

describe('transport keys', () => {
  it('defines a map for every key position', () => {
    expect(Object.keys(KEY_MAPS).sort()).toEqual(Object.keys(BOOMBOX_KEYS).sort());
  });

  it('draws each key 6 wide and 7 tall', () => {
    for (const map of Object.values(KEY_MAPS)) {
      expect(mapSize(map)).toEqual({ width: 6, height: 7 });
    }
  });

  it('gives each key a distinct glyph', () => {
    const glyphs = Object.values(KEY_MAPS).map(m => m.join('|'));
    expect(new Set(glyphs).size).toBe(glyphs.length);
  });

  it('keeps every key inside the body', () => {
    const { height } = mapSize(BOOMBOX_MAP);
    for (const x of Object.values(BOOMBOX_KEYS)) {
      expect(x + 6).toBeLessThanOrEqual(56);
    }
    expect(BOOMBOX_KEY_ROW + 7).toBeLessThanOrEqual(height);
  });

  it('does not overlap two keys', () => {
    const xs = Object.values(BOOMBOX_KEYS).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(6);
  });
});
