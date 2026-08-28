import { useCallback, useEffect, useRef, useState } from "react";
import type { Station } from "@/lib/stations";

export type Transport = "stopped" | "loading" | "playing" | "paused" | "error";

const BARS = 12;
const SILENT = new Array(BARS).fill(0);

export function useRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);
  const [station, setStation] = useState<Station | null>(null);
  const [transport, setTransport] = useState<Transport>("stopped");
  const [levels, setLevels] = useState<number[]>(SILENT);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // Almost no station sends CORS, so Web Audio cannot read the samples. The
  // meter animates while sound is playing rather than claiming to measure it.
  useEffect(() => {
    if (transport !== "playing") {
      setLevels(SILENT);
      return;
    }
    let phase = 0;
    const tick = () => {
      phase += 0.08;
      setLevels(Array.from({ length: BARS }, (_, i) =>
        0.25 + 0.35 * Math.abs(Math.sin(phase + i * 0.7)) + 0.2 * Math.abs(Math.sin(phase * 1.7 + i)),
      ));
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frameRef.current);
  }, [transport]);

  // Called straight from the click so the browser still sees a user gesture;
  // starting playback from an effect loses it and trips the autoplay policy.
  const tuneTo = useCallback((next: Station) => {
    const audio = audioRef.current;
    if (!audio) return;
    setStation(next);
    setTransport("loading");
    audio.src = next.url;
    audio.play().then(
      () => setTransport("playing"),
      () => setTransport("error"),
    );
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !station) return;
    // A live stream has no resume point, so restart rather than continue.
    audio.src = station.url;
    setTransport("loading");
    audio.play().then(() => setTransport("playing"), () => setTransport("error"));
  }, [station]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setTransport("paused");
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setTransport("stopped");
  }, []);

  return { station, transport, levels, tuneTo, play, pause, stop };
}
