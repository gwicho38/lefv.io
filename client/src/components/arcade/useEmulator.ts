import { useEffect, useRef, useState } from "react";
import type { Cartridge } from "@/lib/cartridges";

type Status = "idle" | "loading" | "running" | "error";

// EmulatorJS runs Game Boy Color through gambatte, which it calls "gb"; there
// is no "gbc" core, and asking for one 404s.
const CORES: Readonly<Record<string, string>> = { gbc: "gb" };

// Upstream's build, not a vendored copy: the repo ships source only, so the
// minified bundle and the cores exist solely on the CDN.
const EJS_DATA = "https://cdn.emulatorjs.org/stable/data/";

// EmulatorJS reads these globals when its loader runs; it has no module API.
interface EmulatorGlobals {
  EJS_player?: string;
  EJS_core?: string;
  EJS_gameUrl?: string;
  EJS_gameName?: string;
  EJS_pathtodata?: string;
  EJS_startOnLoaded?: boolean;
  EJS_emulator?: {
    callEvent?: (name: string) => void;
    started?: boolean;
    gameManager?: { simulateInput: (player: number, button: number, value: number) => void };
  };
}

// EmulatorJS keeps one instance on window, so a switch must tear the old one
// down before the loader builds the next.
function teardown(globals: EmulatorGlobals, container: HTMLElement | null) {
  try {
    globals.EJS_emulator?.callEvent?.("exit");
  } catch {
    // an instance that never finished booting has nothing to exit
  }
  delete globals.EJS_emulator;
  document.querySelectorAll("script[data-ejs]").forEach(node => node.remove());
  container?.replaceChildren();
}

// EmulatorJS binds one key per button, so WASD is driven straight at the input
// layer rather than through a second binding.
const WASD: Readonly<Record<string, number>> = { w: 4, s: 5, a: 6, d: 7 };

export function useEmulator(cartridge: Cartridge | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!cartridge) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const globals = window as unknown as EmulatorGlobals;
    teardown(globals, containerRef.current);
    globals.EJS_player = "#emulator";
    globals.EJS_core = CORES[cartridge.system] ?? cartridge.system;
    globals.EJS_gameUrl = cartridge.rom;
    globals.EJS_gameName = cartridge.title;
    globals.EJS_pathtodata = EJS_DATA;
    globals.EJS_startOnLoaded = true;

    // loader.js declares globals, so a classic re-run throws "already declared".
    // A module gets its own scope, and a unique URL forces a fresh evaluation.
    const script = document.createElement("script");
    script.type = "module";
    script.src = `${EJS_DATA}loader.js?cartridge=${encodeURIComponent(cartridge.id)}`;
    script.dataset.ejs = cartridge.id;
    script.onload = () => setStatus("running");
    script.onerror = () => setStatus("error");
    document.body.appendChild(script);

    const onKey = (event: KeyboardEvent) => {
      const button = WASD[event.key.toLowerCase()];
      if (button === undefined || event.repeat) return;
      const emulator = globals.EJS_emulator;
      if (!emulator?.started || !emulator.gameManager) return;
      event.preventDefault();
      emulator.gameManager.simulateInput(0, button, event.type === "keydown" ? 1 : 0);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      teardown(globals, containerRef.current);
    };
  }, [cartridge]);

  return { containerRef, status };
}
