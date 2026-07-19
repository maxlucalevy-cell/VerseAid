"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FastForward, Pause, Play, Rewind } from "lucide-react";
import { formatTime } from "@/lib/time";
import { ALL_KEYS, CONFIDENT_KEY_THRESHOLD } from "@/lib/keyDetection";

export type AudioPlayerHandle = {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
};

const SPEEDS = [0.75, 1, 1.25];

const AudioPlayerBar = forwardRef<
  AudioPlayerHandle,
  {
    src: string;
    onRemove: () => void;
    detectedKey: string | null;
    keyConfidence: number | null;
    userKey: string | null;
    onUserKeyChange: (key: string | null) => void;
  }
>(function AudioPlayerBar(
  { src, onRemove, detectedKey, keyConfidence, userKey, onUserKeyChange },
  ref
) {
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
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-raised px-4 pt-3 shadow-[0_1px_0_rgba(245,240,232,0.06)_inset,0_-4px_20px_rgba(0,0,0,0.35)] sm:px-6"
      style={{
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <button
          onClick={() => skip(-5)}
          disabled={!duration}
          aria-label="Rewind 5 seconds"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-inset text-text-muted shadow-inner transition hover:text-text hover:bg-bg-raised active:scale-95 active:text-accent disabled:opacity-40 disabled:pointer-events-none"
        >
          <Rewind size={18} strokeWidth={2} />
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.4)] transition hover:bg-accent-hover active:translate-y-px active:scale-95 active:shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        >
          {isPlaying ? (
            <Pause size={20} strokeWidth={2} fill="currentColor" />
          ) : (
            <Play size={20} strokeWidth={2} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        <button
          onClick={() => skip(5)}
          disabled={!duration}
          aria-label="Forward 5 seconds"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-inset text-text-muted shadow-inner transition hover:text-text hover:bg-bg-raised active:scale-95 active:text-accent disabled:opacity-40 disabled:pointer-events-none"
        >
          <FastForward size={18} strokeWidth={2} />
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
          className="studio-range min-w-[120px] flex-1"
        />
        <span className="shrink-0 rounded-md border border-border bg-bg-inset px-2 py-1 font-mono text-xs tabular-nums text-text-faint">
          {formatTime(duration)}
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-bg-inset px-2 py-1 text-xs">
          <span className="text-text-faint">Key:</span>
          <select
            value={userKey ?? detectedKey ?? ""}
            onChange={(e) => onUserKeyChange(e.target.value || null)}
            aria-label="Song key"
            className="cursor-pointer bg-transparent font-mono text-accent outline-none"
          >
            <option value="">{detectedKey ? "Auto-detected" : "Not set"}</option>
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {!userKey &&
            detectedKey &&
            (keyConfidence ?? 0) < CONFIDENT_KEY_THRESHOLD && (
              <span className="text-text-faint">(estimated)</span>
            )}
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
