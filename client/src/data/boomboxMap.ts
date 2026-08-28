import type { Palette, PixelMap } from "@/lib/pixels";

export const BOOMBOX_PALETTE: Palette = {
  K: "#150c08", // outline
  d: "#6e3a14", // body, lower
  b: "#8a4a1a", // vent lines
  t: "#c98a3e", // body, upper
  l: "#dda65c", // top highlight
  D: "#0e4a42", // cone, outer
  T: "#1f7a68", // cone, mid
  m: "#6fd9a8", // cone, inner
  M: "#a9efc9", // cone, centre
  p: "#6d3a8f", // cassette deck
  c: "#f2e4cf", // key face, screws
  g: "#9c8a72", // key glyph
  o: "#f08a3c", // lit lamp, pressed key
  x: "#3a2a18", // unlit lamp
};

const rep = (ch: string, n: number) => ch.repeat(n);
const row = (inner: string) => `KK${inner}KK`;

// The cassette window doubles as the display, so it is transparent and the
// station readout sits behind it.
export const BOOMBOX_DISPLAY = { x: 26, y: 21, w: 20, h: 5 } as const;

// Each transport key is its own map drawn over the body, so it can be pressed.
export const BOOMBOX_KEYS = { play: 24, pause: 33, stop: 42 } as const;
export const BOOMBOX_KEY_ROW = 38;

const TW_A = "tKKKt", TW_B = "KTMTK", TW_C = "KMmMK";
const leftPanel = (a: string, b: string) => "tt" + a + "tt" + b + rep("t", 6);
const rightPanel = (a: string, b: string) => rep("t", 6) + a + "tt" + b + "tt";

const WOOFER = [
  "ddddKKKKKKKKdddd", "ddKKTTTTTTTTKKdd", "dKTTTTTTTTTTTTKd", "KTTTDDDDDDDDTTTK",
  "KTTDDDDDDDDDDTTK", "KTDDDDmmmmDDDDTK", "KTDDDmMMMMmDDDTK", "KTDDDmMMMMmDDDTK",
  "KTDDDmMMMMmDDDTK", "KTDDDmMMMMmDDDTK", "KTDDDDmmmmDDDDTK", "KTTDDDDDDDDDDTTK",
  "KTTTDDDDDDDDTTTK", "dKTTTTTTTTTTTTKd", "ddKKTTTTTTTTKKdd", "ddddKKKKKKKKdddd",
];

const DECK = [
  "dd" + rep("K", 24) + "dd",
  "ddK" + rep("p", 22) + "Kdd",
  ...Array.from({ length: BOOMBOX_DISPLAY.h }, () =>
    "ddKp" + rep(".", BOOMBOX_DISPLAY.w) + "pKdd"),
  "ddK" + rep("p", 22) + "Kdd",
  "ddK" + "pc" + rep("p", 18) + "cp" + "Kdd",
  "ddK" + rep("p", 22) + "Kdd",
  "ddK" + rep("p", 22) + "Kdd",
  "dd" + rep("K", 24) + "dd",
  ...Array.from({ length: 4 }, () => "dd" + rep("d", 24) + "dd"),
];

// 72 x 49, matching the console: the two units are the same shape.
export const BOOMBOX_MAP: PixelMap = [
  rep(".", 18) + rep("K", 36) + rep(".", 18),
  rep(".", 18) + "K" + rep(".", 34) + "K" + rep(".", 18),
  rep(".", 17) + "KmK" + rep(".", 32) + "KmK" + rep(".", 17),
  rep(".", 17) + "KmK" + rep(".", 4) + rep("b", 24) + rep(".", 4) + "KmK" + rep(".", 17),
  rep(".", 17) + "KmK" + rep(".", 32) + "KmK" + rep(".", 17),
  rep(".", 17) + "KmK" + rep(".", 32) + "KmK" + rep(".", 17),
  rep(".", 17) + "KmK" + rep(".", 32) + "KmK" + rep(".", 17),
  rep("K", 72),
  row(rep("l", 68)),
  row(rep("t", 68)),
  row(leftPanel(TW_A, TW_A) + rep("t", 28) + rightPanel(TW_A, TW_A)),
  row(leftPanel(TW_B, TW_B) + "tt" + rep("b", 24) + "tt" + rightPanel(TW_B, TW_B)),
  row(leftPanel(TW_C, TW_C) + rep("t", 28) + rightPanel(TW_C, TW_C)),
  row(leftPanel(TW_B, TW_B) + "tt" + rep("b", 24) + "tt" + rightPanel(TW_B, TW_B)),
  row(leftPanel(TW_A, TW_A) + rep("t", 28) + rightPanel(TW_A, TW_A)),
  row(rep("t", 22) + rep("b", 18) + rep("t", 28)),
  row(rep("t", 68)),
  row(rep("d", 68)),
  row("dc" + rep("d", 64) + "cd"),
  ...WOOFER.map((w, i) => row("dd" + w + "dd" + DECK[i] + "dd" + w + "dd")),
  row("dc" + rep("d", 64) + "cd"),
  ...Array.from({ length: 12 }, () => row(rep("d", 68))),
  rep("K", 72),
];

export const KEY_MAPS = {
  play: ["KKKKKK", "KccccK", "KcgccK", "KcggcK", "KcgccK", "KccccK", "KKKKKK"],
  pause: ["KKKKKK", "KccccK", "KcgcgK", "KcgcgK", "KcgcgK", "KccccK", "KKKKKK"],
  stop: ["KKKKKK", "KccccK", "KcggcK", "KcggcK", "KcggcK", "KccccK", "KKKKKK"],
} satisfies Readonly<Record<string, PixelMap>>;

export type TransportKey = keyof typeof KEY_MAPS;
