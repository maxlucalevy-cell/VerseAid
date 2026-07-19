"use client";

import { useEffect, useRef, useState } from "react";
import {
  detectKey,
  CONFIDENT_KEY_THRESHOLD,
  type KeyDetectionResult,
} from "@/lib/keyDetection";
import { detectBpm, type BpmDetectionResult } from "@/lib/bpmDetection";

type ToolState =
  | { status: "empty" }
  | { status: "analyzing"; fileName: string }
  | {
      status: "done";
      fileName: string;
      result: KeyDetectionResult | null;
      bpm: BpmDetectionResult | null;
    };

export default function KeyFinderTool() {
  const [state, setState] = useState<ToolState>({ status: "empty" });
  // Client-side octave correction for the displayed BPM: beat detectors
  // often land on double or half the felt tempo, so the user can halve or
  // double the number without re-analyzing.
  const [bpmMultiplier, setBpmMultiplier] = useState(1);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Revoke the last object URL on unmount; swaps are revoked in place.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Allow re-selecting the same file later.
    e.target.value = "";

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setObjectUrl(url);
    setBpmMultiplier(1);
    setState({ status: "analyzing", fileName: file.name });

    // Same best-effort contract as the song editor's upload analysis: any
    // decode or analysis failure just means "nothing found", never an error
    // that takes down the page. Key and BPM fail independently, so one can
    // still come back when the other doesn't.
    let result: KeyDetectionResult | null = null;
    let bpm: BpmDetectionResult | null = null;
    try {
      const audioContext = new AudioContext();
      try {
        const buffer = await audioContext.decodeAudioData(
          await file.arrayBuffer()
        );
        [result, bpm] = await Promise.all([
          detectKey(buffer).catch(() => null),
          detectBpm(buffer),
        ]);
      } finally {
        await audioContext.close();
      }
    } catch {
      result = null;
      bpm = null;
    }

    setState({ status: "done", fileName: file.name, result, bpm });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-dashed border-border-strong bg-bg-inset p-4 text-sm">
        <label className="flex cursor-pointer items-center gap-3 text-text-muted">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={state.status === "analyzing"}
            className="hidden"
          />
          <span className="rounded-full bg-accent px-4 py-2 font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_4px_rgba(0,0,0,0.3)] transition hover:bg-accent-hover active:translate-y-px">
            {state.status === "analyzing"
              ? "Listening..."
              : state.status === "done"
                ? "Try Another File"
                : "Choose Audio File"}
          </span>
          <span className="text-text-faint">
            Analyzed on your device, never uploaded
          </span>
        </label>
      </div>

      {state.status !== "empty" && (
        <div className="paper-grain rounded-2xl border border-border bg-bg-raised p-5 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)]">
          <p className="font-display mb-3 text-lg font-medium text-text">
            {state.fileName}
          </p>

          {objectUrl && (
            <audio controls src={objectUrl} className="mb-4 w-full" />
          )}

          {state.status === "analyzing" && (
            <p className="text-sm text-text-muted">
              Listening for a key...
            </p>
          )}

          {state.status === "done" && (state.result || state.bpm) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-muted">
              {state.result && (
                <span className="rounded-md border border-border bg-bg-inset px-2 py-1 font-mono text-xs text-accent">
                  Key: {state.result.key}
                  {state.result.confidence < CONFIDENT_KEY_THRESHOLD &&
                    " (estimated)"}
                </span>
              )}
              {state.bpm && (
                <span className="flex items-center gap-2">
                  <span className="rounded-md border border-border bg-bg-inset px-2 py-1 font-mono text-xs text-accent">
                    BPM: {Math.round(state.bpm.bpm * bpmMultiplier)}
                  </span>
                  <span className="flex gap-1">
                    <button
                      onClick={() =>
                        setBpmMultiplier((m) => (m === 0.5 ? 1 : 0.5))
                      }
                      title="Sounds like half time? Halve the number."
                      className={`rounded-full border px-2 py-0.5 text-xs transition ${
                        bpmMultiplier === 0.5
                          ? "border-accent bg-accent text-bg"
                          : "border-border bg-bg-inset text-text-muted shadow-inner hover:border-border-strong hover:text-text"
                      }`}
                    >
                      ½×
                    </button>
                    <button
                      onClick={() =>
                        setBpmMultiplier((m) => (m === 2 ? 1 : 2))
                      }
                      title="Sounds like double time? Double the number."
                      className={`rounded-full border px-2 py-0.5 text-xs transition ${
                        bpmMultiplier === 2
                          ? "border-accent bg-accent text-bg"
                          : "border-border bg-bg-inset text-text-muted shadow-inner hover:border-border-strong hover:text-text"
                      }`}
                    >
                      2×
                    </button>
                  </span>
                  <span className="text-xs text-text-faint">
                    tempo detectors sometimes hear half or double time
                  </span>
                </span>
              )}
            </div>
          )}

          {state.status === "done" && !state.result && !state.bpm && (
            <p className="text-sm text-text-muted">
              Couldn&apos;t settle on a key or tempo for this one. That can
              happen with unsupported formats, very short clips, or ambiguous
              material. Another file might read more clearly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
