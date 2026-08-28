export interface Cartridge {
  id: string;
  title: string;
  system: string;
  author: string;
  year: number;
  genre: string;
  licence: string;
  licenceUrl: string;
  source: string;
  rom: string;
  blurb: string;
  colour: string;
}

export function filterCartridges(all: Cartridge[], query: string): Cartridge[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return all;
  return all.filter(c =>
    [c.title, c.author, c.system, c.genre].some(field =>
      field.toLowerCase().includes(needle),
    ),
  );
}

export async function fetchCartridges(): Promise<Cartridge[]> {
  const res = await fetch("/arcade/cartridges.json");
  if (!res.ok) throw new Error("Failed to load cartridges");
  return res.json();
}
