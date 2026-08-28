export type PixelMap = readonly string[];
export type Palette = Readonly<Record<string, string>>;

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  fill: string;
}

const TRANSPARENT = ".";

interface ToRectsOptions {
  ox?: number;
  oy?: number;
  swap?: Readonly<Record<string, string>>;
}

// Runs of one colour become a single rect, which keeps a 56x52 map at a few
// dozen nodes instead of ~2900.
export function toRects(
  map: PixelMap,
  palette: Palette,
  { ox = 0, oy = 0, swap }: ToRectsOptions = {},
): PixelRect[] {
  const rects: PixelRect[] = [];

  map.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === TRANSPARENT) {
        x += 1;
        continue;
      }

      let run = 1;
      while (row[x + run] === ch) run += 1;

      const key = swap?.[ch] ?? ch;
      const fill = palette[key];
      if (!fill) {
        throw new Error(`pixels: no palette entry for "${ch}"`);
      }

      rects.push({ x: x + ox, y: y + oy, w: run, fill });
      x += run;
    }
  });

  return rects;
}

export function mapSize(map: PixelMap): { width: number; height: number } {
  return {
    width: map.reduce((widest, row) => Math.max(widest, row.length), 0),
    height: map.length,
  };
}
