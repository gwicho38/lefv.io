import type { Cartridge } from "@/lib/cartridges";

interface Props {
  cartridge: Cartridge | null;
  onEject: () => void;
}

export function CartridgePane({ cartridge, onEject }: Props) {
  if (!cartridge) {
    return (
      <p className="font-serif text-xs text-muted-foreground">
        Pick one from the shelf, or drop in a file of your own.
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="font-serif text-[15px] font-semibold leading-tight">{cartridge.title}</h2>
      <p className="mt-1 font-mono text-[9px] leading-relaxed text-muted-foreground">
        {cartridge.author} · {cartridge.year}
        <br />
        {cartridge.system.toUpperCase()} · {cartridge.genre}
        <br />
        <a className="underline underline-offset-2" href={cartridge.licenceUrl}>
          {cartridge.licence}
        </a>
      </p>
      <p className="mt-2 font-serif text-[11.5px] leading-snug text-muted-foreground">
        {cartridge.blurb}
      </p>

      <div className="my-3 border-t border-border" />
      <button type="button" onClick={onEject} className="text-left font-mono text-[9.5px] text-muted-foreground">
        ▸ eject
      </button>

      <p className="mt-auto pt-3 font-mono text-[8px] leading-snug text-muted-foreground">
        saves stay in your browser, never uploaded
      </p>
    </div>
  );
}
