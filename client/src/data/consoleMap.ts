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

// The screen is a hole rather than a fill: the emulator canvas sits behind the
// SVG and shows through it.
export const CONSOLE_SCREEN = { x: 7, y: 9, w: 42, h: 27 } as const;

const rep = (ch: string, n: number) => ch.repeat(n);
// Every row is the left border, 52 inner pixels, then the right border.
const row = (inner: string) => `KK${inner}KK`;

const SHELL = rep("G", 52);
const SLOT_EDGE = rep("G", 14) + rep("K", 24) + rep("G", 14);
const SLOT_MOUTH = rep("G", 14) + "K" + rep("X", 22) + "K" + rep("G", 14);
const SCREEN_EDGE = rep("G", 3) + rep("K", 46) + rep("G", 3);
const SCREEN_BEZEL = rep("G", 3) + "K" + rep("N", 44) + "K" + rep("G", 3);
const SCREEN_HOLE =
  rep("G", 3) + "K" + "N" + rep(".", CONSOLE_SCREEN.w) + "N" + "K" + rep("G", 3);

export const CONSOLE_MAP: PixelMap = [
  rep("K", 56),
  row(rep("S", 52)),
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
  row("G" + "K" + "E" + "K" + rep("G", 48)),
  row(rep("G", 39) + rep("A", 8) + rep("G", 5)),
  row(SHELL),
  row("G" + "AAGAAGAA" + rep("G", 30) + rep("A", 8) + rep("G", 5)),
  row(SHELL),
  row(SHELL),
  row(SHELL),
  row(SHELL),
  row(SHELL),
  row(SHELL),
  row(SHELL),
  rep("K", 56),
];
