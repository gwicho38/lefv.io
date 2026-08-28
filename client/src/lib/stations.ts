export interface Station {
  id: string;
  name: string;
  city: string;
  genre: string;
  url: string;
  codec: string;
  bitrate: number;
  cors: boolean;
  colour: string;
}

export function filterStations(all: Station[], query: string): Station[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return all;
  return all.filter(s =>
    [s.name, s.city, s.genre].some(field => field.toLowerCase().includes(needle)),
  );
}

export async function fetchStations(): Promise<Station[]> {
  const res = await fetch("/jukebox/stations.json");
  if (!res.ok) throw new Error("Failed to load stations");
  return res.json();
}
