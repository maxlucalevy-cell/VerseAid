"use client";

import { useEffect, useRef, useState } from "react";

export default function MetronomePanel({
  bpm,
  onBpmChange,
}: {
  bpm: number | null;
  onBpmChange: (bpm: number) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [taps, setTaps] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveBpm = bpm ?? 100;

  const playClick = () => {
    const ctx = (audioContextRef.current ??= new AudioContext());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  useEffect(() => {
    if (isPlaying) {
      playClick();
      intervalRef.current = setInterval(playClick, (60 / effectiveBpm) * 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, effectiveBpm]);

  const handleTap = () => {
    const now = Date.now();
    const recentTaps = [...taps, now].filter((t) => now - t < 3000);
    setTaps(recentTaps);

    if (recentTaps.length >= 2) {
      const intervals = recentTaps.slice(1).map((t, i) => t - recentTaps[i]);
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const detectedBpm = Math.round(60000 / avgInterval);
      onBpmChange(Math.min(300, Math.max(20, detectedBpm)));
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-neutral-200 p-4 text-sm">
      <p className="mb-3 text-neutral-500">
        No audio uploaded — use tap tempo or enter a BPM manually.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleTap}
          className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white"
        >
          Tap Tempo
        </button>
        <label className="flex items-center gap-2">
          <span className="text-neutral-500">BPM</span>
          <input
            type="number"
            min={20}
            max={300}
            value={bpm ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!Number.isNaN(value)) onBpmChange(value);
            }}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1"
          />
        </label>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className={`rounded-full px-4 py-2 font-medium ${
            isPlaying ? "bg-red-600 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {isPlaying ? "Stop" : "Start"} Metronome
        </button>
      </div>
    </div>
  );
}
