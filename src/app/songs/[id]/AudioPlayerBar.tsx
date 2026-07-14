"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { formatTime } from "@/lib/time";

export type AudioPlayerHandle = {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
};

const SPEEDS = [0.75, 1, 1.25];

const AudioPlayerBar = forwardRef<
  AudioPlayerHandle,
  { src: string; onRemove: () => void }
>(function AudioPlayerBar({ src, onRemove }, ref) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  useImperativeHandle(ref, () => ({
    seekTo(time: number) {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        audioRef.current.play();
        setIsPlaying(true);
      }
    },
    getCurrentTime() {
      return audioRef.current?.currentTime ?? 0;
    },
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + seconds)
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg-raised px-4 py-3 shadow-[0_1px_0_rgba(245,240,232,0.06)_inset,0_-4px_20px_rgba(0,0,0,0.35)] sm:px-6">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="mx-auto flex max-w-3xl items-center gap-3 text-sm">
        <button
          onClick={() => skip(-5)}
          aria-label="Rewind 5 seconds"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-inset text-text-muted shadow-inner transition hover:text-text"
        >
          ⏪
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.4)] transition hover:bg-accent-hover active:translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => skip(5)}
          aria-label="Forward 5 seconds"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-inset text-text-muted shadow-inner transition hover:text-text"
        >
          ⏩
        </button>
        <span className="shrink-0 rounded-md border border-border bg-bg-inset px-2 py-1 font-mono text-xs tabular-nums text-accent">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = t;
            setCurrentTime(t);
          }}
          className="studio-range flex-1"
        />
        <span className="shrink-0 rounded-md border border-border bg-bg-inset px-2 py-1 font-mono text-xs tabular-nums text-text-faint">
          {formatTime(duration)}
        </span>
        <div className="flex shrink-0 gap-1 rounded-full border border-border-strong bg-bg-inset p-1 shadow-inner">
          {SPEEDS.map((speed) => (
            <button
              key={speed}
              onClick={() => setRate(speed)}
              className={`rounded-full px-2 py-1 text-xs transition ${
                rate === speed
                  ? "bg-accent text-bg shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 text-xs text-text-faint transition hover:text-danger"
        >
          Remove
        </button>
      </div>
    </div>
  );
});

export default AudioPlayerBar;
