import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Console } from "@/components/arcade/Console";
import { CartridgeShelf } from "@/components/arcade/CartridgeShelf";
import { useEmulator } from "@/components/arcade/useEmulator";
import { fetchCartridges, filterCartridges, type Cartridge } from "@/lib/cartridges";

export default function Arcade() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data } = useQuery<Cartridge[]>({
    queryKey: ["/arcade/cartridges.json"],
    queryFn: fetchCartridges,
  });

  const all = data ?? [];
  const visible = useMemo(() => filterCartridges(all, query), [all, query]);
  const selected = all.find(c => c.id === selectedId) ?? null;
  const { containerRef, status } = useEmulator(selected);

  return (
    <div className="mx-auto w-full max-w-[72rem] px-5 pb-10">
      <h1 className="mb-4 font-serif text-2xl font-bold tracking-tight">Arcade</h1>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search cartridges"
        className="mb-5 w-full border-b border-border bg-transparent pb-2 font-mono text-xs outline-none placeholder:text-muted-foreground"
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-center sm:gap-5">
        <div className="flex w-[min(100%,calc((100svh-21rem)*56/52))] min-w-0 flex-col">
        <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">
          {!selected
            ? "NO CARTRIDGE"
            : status === "loading"
              ? `${selected.title.toUpperCase()} · LOADING CORE…`
              : status === "error"
                ? `${selected.title.toUpperCase()} · CORE FAILED TO LOAD`
                : `${selected.title.toUpperCase()} · ${selected.system.toUpperCase()}`}
        </p>
        <Console>
          <div id="emulator" key={selected?.id ?? "empty"} ref={containerRef} className="h-full w-full" />
        </Console>

        {selected && (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="font-mono text-[10px] text-muted-foreground">
              <span className="text-foreground">{selected.title}</span>
              {" · "}{selected.author} · {selected.year} · {selected.genre}
              {" · "}
              {selected.licenceUrl ? (
                <a className="underline underline-offset-2" href={selected.licenceUrl}>
                  {selected.licence}
                </a>
              ) : (
                selected.licence
              )}
            </p>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="font-mono text-[10px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              eject
            </button>
          </div>
        )}
        </div>

        <div className="w-full sm:w-40 sm:flex-none">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">SHELF</p>
          <CartridgeShelf
            cartridges={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
