"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AudioUploader({
  songId,
  userId,
  onUploaded,
}: {
  songId: string;
  userId: string;
  onUploaded: (path: string, duration: number) => void;
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

      onUploaded(path, duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-dashed border-neutral-300 p-4 text-sm">
      <label className="flex cursor-pointer items-center gap-3 text-neutral-600">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <span className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white">
          {uploading ? "Uploading..." : "Upload Reference Audio"}
        </span>
        <span className="text-neutral-400">
          Optional — one audio file per song
        </span>
      </label>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
