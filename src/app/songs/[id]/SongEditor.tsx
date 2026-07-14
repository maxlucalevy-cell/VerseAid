"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { deleteSong } from "@/app/songs/actions";
import type { Song, Section, SongStatus } from "@/lib/types";

function useDebounce(delay = 600) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  return useCallback(
    (key: string, fn: () => void) => {
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.set(key, setTimeout(fn, delay));
    },
    [delay]
  );
}

export default function SongEditor({
  song,
  initialSections,
}: {
  song: Song;
  initialSections: Section[];
}) {
  const supabase = createClient();
  const debounce = useDebounce();

  const [title, setTitle] = useState(song.title);
  const [status, setStatus] = useState<SongStatus>(song.status);
  const [sections, setSections] = useState(initialSections);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debounce("title", () => {
      supabase
        .from("songs")
        .update({ title: value, last_edited_at: new Date().toISOString() })
        .eq("id", song.id)
        .then();
    });
  };

  const handleStatusToggle = async () => {
    const next: SongStatus = status === "draft" ? "finished" : "draft";
    setStatus(next);
    await supabase
      .from("songs")
      .update({ status: next, last_edited_at: new Date().toISOString() })
      .eq("id", song.id);
  };

  const handleDeleteSong = async () => {
    if (!confirm("Delete this song? This cannot be undone.")) return;
    await deleteSong(song.id);
  };

  const updateSectionField = (
    id: string,
    field: "label" | "content",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    debounce(`section-${field}-${id}`, () => {
      supabase.from("sections").update({ [field]: value }).eq("id", id).then();
    });
  };

  const addSection = async () => {
    const nextIndex =
      sections.length > 0
        ? Math.max(...sections.map((s) => s.order_index)) + 1
        : 0;
    const { data, error } = await supabase
      .from("sections")
      .insert({
        song_id: song.id,
        order_index: nextIndex,
        label: "New Section",
        content: "",
      })
      .select()
      .single();

    if (!error && data) {
      setSections((prev) => [...prev, data]);
    }
  };

  const deleteSection = async (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("sections").delete().eq("id", id);
  };

  const moveSection = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const current = sections[index];
    const target = sections[targetIndex];
    const updatedCurrent = { ...current, order_index: target.order_index };
    const updatedTarget = { ...target, order_index: current.order_index };

    const reordered = [...sections];
    reordered[index] = updatedTarget;
    reordered[targetIndex] = updatedCurrent;
    setSections(reordered);

    await Promise.all([
      supabase
        .from("sections")
        .update({ order_index: updatedCurrent.order_index })
        .eq("id", updatedCurrent.id),
      supabase
        .from("sections")
        .update({ order_index: updatedTarget.order_index })
        .eq("id", updatedTarget.id),
    ]);
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-neutral-500 underline">
          ← Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStatusToggle}
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm capitalize"
          >
            {status}
          </button>
          <button
            onClick={handleDeleteSong}
            className="text-sm text-neutral-400 hover:text-red-600"
          >
            Delete Song
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="mb-8 w-full border-b border-neutral-200 pb-2 text-3xl font-semibold outline-none"
      />

      <div className="flex flex-col gap-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="rounded-2xl border border-neutral-200 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <input
                value={section.label}
                onChange={(e) =>
                  updateSectionField(section.id, "label", e.target.value)
                }
                className="text-lg font-medium outline-none"
              />
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <button
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="disabled:opacity-30"
                  aria-label="Move section up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  className="disabled:opacity-30"
                  aria-label="Move section down"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            <textarea
              value={section.content}
              onChange={(e) =>
                updateSectionField(section.id, "content", e.target.value)
              }
              rows={6}
              placeholder="Write your lyrics..."
              className="w-full resize-none rounded-lg border border-neutral-200 p-3 font-mono text-sm outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addSection}
        className="mt-6 rounded-full border border-dashed border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:border-neutral-400"
      >
        + Add Section
      </button>
    </main>
  );
}
