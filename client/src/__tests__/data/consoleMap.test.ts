import { CONSOLE_MAP, CONSOLE_PALETTE, CONSOLE_SCREEN } from '@/data/consoleMap';
import { mapSize, toRects } from '@/lib/pixels';

describe('CONSOLE_MAP', () => {
  it('is 56 wide and 52 tall', () => {
    expect(mapSize(CONSOLE_MAP)).toEqual({ width: 56, height: 52 });
  });

  it('has every row the same width', () => {
    const widths = new Set(CONSOLE_MAP.map(r => r.length));
    expect([...widths]).toEqual([56]);
  });

  it('uses only characters the palette defines', () => {
    expect(() => toRects(CONSOLE_MAP, CONSOLE_PALETTE)).not.toThrow();
  });

  it('leaves the screen area transparent so the canvas shows through', () => {
    const { x, y, w, h } = CONSOLE_SCREEN;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        expect(CONSOLE_MAP[row][col]).toBe('.');
      }
    }
  });

  it('paints every pixel outside the screen', () => {
    const { x, y, w, h } = CONSOLE_SCREEN;
    const inScreen = (col: number, row: number) =>
      row >= y && row < y + h && col >= x && col < x + w;

    CONSOLE_MAP.forEach((rowStr, row) => {
      [...rowStr].forEach((ch, col) => {
        if (!inScreen(col, row)) expect(ch).not.toBe('.');
      });
    });
  });
});
