import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boombox } from "@/components/jukebox/Boombox";
import { useRadio } from "@/components/jukebox/useRadio";
import { fetchStations, filterStations, type Station } from "@/lib/stations";

const STATE_LABEL: Record<string, string> = {
  stopped: "OFF AIR",
  loading: "TUNING…",
  playing: "ON AIR",
  paused: "PAUSED",
  error: "STREAM UNAVAILABLE",
};

export default function Jukebox() {
  const [query, setQuery] = useState("");

  const { data } = useQuery<Station[]>({
    queryKey: ["/jukebox/stations.json"],
    queryFn: fetchStations,
  });

  const all = data ?? [];
  const visible = useMemo(() => filterStations(all, query), [all, query]);
  const { station: selected, transport, levels, tuneTo, play, pause, stop } = useRadio();

  return (
    <div className="mx-auto w-full max-w-[72rem] px-5 pb-10">
      <h1 className="mb-4 font-serif text-2xl font-bold tracking-tight">Jukebox</h1>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search stations"
        className="mb-5 w-full border-b border-border bg-transparent pb-2 font-mono text-xs outline-none placeholder:text-muted-foreground"
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-center sm:gap-5">
        <div className="flex w-[min(100%,calc((100svh-21rem)*56/41))] min-w-0 flex-col">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">
            {selected ? `${selected.name.toUpperCase()} · ${STATE_LABEL[transport]}` : "NO STATION"}
          </p>

          <Boombox
            transport={transport}
            levels={levels}
            onPlay={play}
            onPause={pause}
            onStop={stop}
          >
            {selected ? `${selected.name} · ${selected.city}` : "—"}
          </Boombox>

          {selected && (
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-mono text-[10px] text-muted-foreground">
                <span className="text-foreground">{selected.name}</span>
                {" · "}{selected.city} · {selected.genre} · {selected.bitrate}k {selected.codec}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                streams direct from the station
              </p>
            </div>
          )}
        </div>

        <div className="w-full sm:w-56 sm:flex-none">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">STATIONS</p>
          <div className="flex flex-wrap gap-2">
            {visible.map(s => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === selected?.id}
                aria-label={`${s.name}, ${s.genre}`}
                onClick={() => tuneTo(s)}
                title={`${s.name} · ${s.genre}`}
                className={`flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-colors ${
                  s.id === selected?.id
                    ? "border-foreground/40 bg-foreground/5 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 flex-none rounded-full"
                  style={{ backgroundColor: s.colour }}
                />
                <span className="truncate font-mono text-[11px]">{s.name}</span>
                <span className="ml-auto flex-none font-mono text-[9px] text-muted-foreground">
                  {s.bitrate}k
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
