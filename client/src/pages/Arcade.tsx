import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Column } from "@/components/layout/Layout";
import { Console } from "@/components/arcade/Console";
import { CartridgeShelf } from "@/components/arcade/CartridgeShelf";
import { CartridgePane } from "@/components/arcade/CartridgePane";
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

  return (
    <Column>
      <h1 className="mb-4 font-serif text-2xl font-bold tracking-tight">Arcade</h1>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search cartridges"
        className="mb-5 w-full border-b border-border bg-transparent pb-2 font-mono text-xs outline-none placeholder:text-muted-foreground"
      />

      <div className="grid grid-cols-[1fr_1.7fr_1fr] items-stretch gap-4">
        <div className="flex flex-col">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">SHELF</p>
          <CartridgeShelf
            cartridges={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDrop={() => {}}
          />
        </div>

        <div className="flex flex-col">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">
            {selected ? `${selected.title.toUpperCase()} · ${selected.system.toUpperCase()}` : "NO CARTRIDGE"}
          </p>
          <Console />
        </div>

        <div className="flex flex-col">
          <p className="mb-2 h-3 font-mono text-[8px] tracking-wide text-muted-foreground">CARTRIDGE</p>
          <CartridgePane cartridge={selected} onEject={() => setSelectedId(null)} />
        </div>
      </div>
    </Column>
  );
}
