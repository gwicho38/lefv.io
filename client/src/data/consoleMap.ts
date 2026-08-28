import type { Palette, PixelMap } from "@/lib/pixels";

export const CONSOLE_PALETTE: Palette = {
  K: "#150c08", // outline
  G: "#b9c1c0", // shell
  S: "#d8dedd", // top highlight
  N: "#3a4342", // screen bezel
  X: "#1b2120", // cartridge slot
  E: "#25c07f", // power lamp
  A: "#7d8786", // vents and wordmark
};

// A hole, not a fill: the emulator canvas sits behind and shows through.
export const CONSOLE_SCREEN = { x: 11, y: 9, w: 50, h: 28 } as const;

const rep = (ch: string, n: number) => ch.repeat(n);
// Every row is the left border, 68 inner pixels, then the right border.
const row = (inner: string) => `KK${inner}KK`;

const SHELL = rep("G", 68);
const SLOT_EDGE = rep("G", 22) + rep("K", 24) + rep("G", 22);
const SLOT_MOUTH = rep("G", 22) + "K" + rep("X", 22) + "K" + rep("G", 22);
const SCREEN_EDGE = rep("G", 7) + rep("K", 54) + rep("G", 7);
const SCREEN_BEZEL = rep("G", 7) + "K" + rep("N", 52) + "K" + rep("G", 7);
const SCREEN_HOLE =
  rep("G", 7) + "K" + "N" + rep(".", CONSOLE_SCREEN.w) + "N" + "K" + rep("G", 7);

// Landscape, like the boombox: a near-square body grows too tall when widened.
export const CONSOLE_MAP: PixelMap = [
  rep("K", 72),
  row(rep("S", 68)),
  row(SHELL),
  row(SLOT_EDGE),
  row(SLOT_MOUTH),
  row(SLOT_EDGE),
  row(SHELL),
  row(SCREEN_EDGE),
  row(SCREEN_BEZEL),
  ...Array.from({ length: CONSOLE_SCREEN.h }, () => row(SCREEN_HOLE)),
  row(SCREEN_BEZEL),
  row(SCREEN_EDGE),
  row(SHELL),
  row(SHELL),
  row("G" + "K" + "E" + "K" + rep("G", 64)),
  row(rep("G", 52) + rep("A", 10) + rep("G", 6)),
  row(SHELL),
  row("G" + "AAGAAGAA" + rep("G", 40) + rep("A", 10) + rep("G", 9)),
  row(SHELL),
  row(SHELL),
  row(SHELL),
  rep("K", 72),
];
