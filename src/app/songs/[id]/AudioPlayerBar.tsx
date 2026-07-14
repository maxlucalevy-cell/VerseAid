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
    <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 px-6 py-3 backdrop-blur">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="mx-auto flex max-w-3xl items-center gap-3 text-sm">
        <button onClick={() => skip(-5)} aria-label="Rewind 5 seconds">
          ⏪
        </button>
        <button
          onClick={togglePlay}
          className="rounded-full bg-neutral-900 px-3 py-1.5 text-white"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={() => skip(5)} aria-label="Forward 5 seconds">
          ⏩
        </button>
        <span className="text-neutral-400 tabular-nums">
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
          className="flex-1"
        />
        <span className="text-neutral-400 tabular-nums">
          {formatTime(duration)}
        </span>
        <div className="flex gap-1">
          {SPEEDS.map((speed) => (
            <button
              key={speed}
              onClick={() => setRate(speed)}
              className={`rounded-full px-2 py-1 text-xs ${
                rate === speed
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-neutral-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
});

export default AudioPlayerBar;
