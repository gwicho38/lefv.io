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
  M: "#a9efc9", // cone, centre and display glass
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
export const BOOMBOX_DISPLAY = { x: 20, y: 21, w: 16, h: 4 } as const;

// Each transport key is its own map drawn over the body, so it can be pressed.
export const BOOMBOX_KEYS = { play: 16, pause: 25, stop: 34 } as const;
export const BOOMBOX_KEY_ROW = 33;

const TW_A = "tKKKt", TW_B = "KTMTK", TW_C = "KMmMK";
const left = (a: string, b: string) => "t" + a + "t" + b + "tt";
const right = (a: string, b: string) => "tt" + a + "t" + b + "t";

const WOOFER = [
  "ddKKKKKKKKdd", "dKTTTTTTTTKd", "KTTDDDDDDTTK", "KTDDDDDDDDTK",
  "KTDDmmmmDDTK", "KTDDmMMmDDTK", "KTDDmMMmDDTK", "KTDDmmmmDDTK",
  "KTDDDDDDDDTK", "KTTDDDDDDTTK", "dKTTTTTTTTKd", "ddKKKKKKKKdd",
];

const DECK = [
  "dd" + rep("K", 20) + "dd",
  "ddK" + rep("p", 18) + "Kdd",
  ...Array.from({ length: BOOMBOX_DISPLAY.h }, () =>
    "ddKp" + rep(".", BOOMBOX_DISPLAY.w) + "pKdd"),
  "ddK" + rep("p", 18) + "Kdd",
  "ddK" + "pc" + rep("p", 14) + "cp" + "Kdd",
  "ddK" + rep("p", 18) + "Kdd",
  "ddK" + rep("p", 18) + "Kdd",
  "dd" + rep("K", 20) + "dd",
  "dd" + rep("d", 20) + "dd",
];

export const BOOMBOX_MAP: PixelMap = [
  rep(".", 14) + rep("K", 28) + rep(".", 14),
  rep(".", 14) + "K" + rep(".", 26) + "K" + rep(".", 14),
  rep(".", 13) + "KmK" + rep(".", 24) + "KmK" + rep(".", 13),
  rep(".", 13) + "KmK" + rep(".", 3) + rep("b", 18) + rep(".", 3) + "KmK" + rep(".", 13),
  rep(".", 13) + "KmK" + rep(".", 24) + "KmK" + rep(".", 13),
  rep(".", 13) + "KmK" + rep(".", 24) + "KmK" + rep(".", 13),
  rep(".", 13) + "KmK" + rep(".", 24) + "KmK" + rep(".", 13),
  rep("K", 56),
  row(rep("l", 52)),
  row(rep("t", 52)),
  row(left(TW_A, TW_A) + rep("t", 24) + right(TW_A, TW_A)),
  row(left(TW_B, TW_B) + "t" + rep("b", 22) + "t" + right(TW_B, TW_B)),
  row(left(TW_C, TW_C) + rep("t", 24) + right(TW_C, TW_C)),
  row(left(TW_B, TW_B) + "t" + rep("b", 22) + "t" + right(TW_B, TW_B)),
  row(left(TW_A, TW_A) + rep("t", 24) + right(TW_A, TW_A)),
  row(rep("t", 15) + rep("b", 16) + rep("t", 21)),
  row(rep("t", 52)),
  row(rep("d", 52)),
  row("dc" + rep("d", 48) + "cd"),
  ...WOOFER.map((w, i) => row("d" + w + "d" + DECK[i] + "d" + w + "d")),
  row("dc" + rep("d", 48) + "cd"),
  ...Array.from({ length: 8 }, () => row(rep("d", 52))),
  rep("K", 56),
];

export const KEY_MAPS = {
  play: ["KKKKKK", "KccccK", "KcgccK", "KcggcK", "KcgccK", "KccccK", "KKKKKK"],
  pause: ["KKKKKK", "KccccK", "KcgcgK", "KcgcgK", "KcgcgK", "KccccK", "KKKKKK"],
  stop: ["KKKKKK", "KccccK", "KcggcK", "KcggcK", "KcggcK", "KccccK", "KKKKKK"],
} satisfies Readonly<Record<string, PixelMap>>;

export type TransportKey = keyof typeof KEY_MAPS;
