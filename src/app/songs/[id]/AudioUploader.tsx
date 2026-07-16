"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { detectKey, type KeyDetectionResult } from "@/lib/keyDetection";

export default function AudioUploader({
  songId,
  userId,
  onUploaded,
}: {
  songId: string;
  userId: string;
  onUploaded: (
    path: string,
    duration: number,
    detectedKey: KeyDetectionResult | null
  ) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const path = `${userId}/${songId}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("song-audio")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const duration = await new Promise<number>((resolve, reject) => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.addEventListener("loadedmetadata", () =>
          resolve(audio.duration)
        );
        audio.addEventListener("error", () =>
          reject(new Error("Could not read audio file"))
        );
      });

      // Key detection is best-effort: any failure (unsupported codec,
      // decode error, silence) leaves the key unset without touching the
      // upload, and the user can set it manually.
      let detectedKey: KeyDetectionResult | null = null;
      try {
        const audioContext = new AudioContext();
        try {
          const buffer = await audioContext.decodeAudioData(
            await file.arrayBuffer()
          );
          detectedKey = await detectKey(buffer);
        } finally {
          await audioContext.close();
        }
      } catch {
        detectedKey = null;
      }

      onUploaded(path, duration, detectedKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-dashed border-border-strong bg-bg-inset p-4 text-sm">
      <label className="flex cursor-pointer items-center gap-3 text-text-muted">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <span className="rounded-full bg-accent px-4 py-2 font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_4px_rgba(0,0,0,0.3)] transition hover:bg-accent-hover active:translate-y-px">
          {uploading ? "Uploading..." : "Upload Reference Audio"}
        </span>
        <span className="text-text-faint">
          Optional: one audio file per song
        </span>
      </label>
      {error && <p className="mt-2 text-danger">{error}</p>}
    </div>
  );
}
