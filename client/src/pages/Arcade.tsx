import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Console } from "@/components/arcade/Console";
import { CartridgeShelf } from "@/components/arcade/CartridgeShelf";
import { useEmulator } from "@/components/arcade/useEmulator";
import { fetchCartridges, type Cartridge } from "@/lib/cartridges";
import { CABINET_WIDTH } from "@/lib/cabinet";

export default function Arcade() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data } = useQuery<Cartridge[]>({
    queryKey: ["/arcade/cartridges.json"],
    queryFn: fetchCartridges,
  });

  const all = data ?? [];
  const selected = all.find(c => c.id === selectedId) ?? null;
  const { containerRef, status } = useEmulator(selected);

  return (
    <div className="mx-auto w-full max-w-[72rem] px-5 pb-10">
      <h1 className="mb-4 font-serif text-2xl font-bold tracking-tight">Arcade</h1>


      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        <div className={`flex ${CABINET_WIDTH} min-w-0 flex-col`}>
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

        <div className="w-full sm:w-56 sm:flex-none">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">SHELF</p>
          <CartridgeShelf
            cartridges={all}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
