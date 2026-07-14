"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Song } from "@/lib/types";
import { deleteSong } from "@/app/songs/actions";

const STATUS_FILTERS = ["all", "draft", "finished"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function SongLibrary({
  initialSongs,
}: {
  initialSongs: Song[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const songs = useMemo(() => {
    return initialSongs.filter((song) => {
      const matchesQuery = song.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || song.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [initialSongs, query, statusFilter]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/songs/new"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-accent-hover active:translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        >
          New Song
        </Link>
        <Link
          href="/songs/inspiration"
          className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 transition hover:text-text"
        >
          Inspiration Starter
        </Link>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs..."
          className="rounded-full border border-border-strong bg-bg-inset px-4 py-2 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <div className="flex gap-1.5 text-sm">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 capitalize transition ${
                statusFilter === s
                  ? "bg-accent font-medium text-bg shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                  : "border border-border bg-bg-inset text-text-muted shadow-inner hover:border-border-strong hover:text-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {songs.length === 0 ? (
        <p className="text-text-muted">
          {initialSongs.length === 0
            ? "No songs yet. Start your first one."
            : "No songs match your search."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {songs.map((song) => (
            <li
              key={song.id}
              className="paper-grain flex items-center justify-between rounded-2xl border border-border bg-bg-raised p-4 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)]"
            >
              <Link href={`/songs/${song.id}`} className="flex-1">
                <p className="font-display font-medium text-text">
                  {song.title}
                </p>
                <p className="text-sm text-text-muted">
                  {song.status === "finished" ? "Finished" : "Draft"} · Edited{" "}
                  {new Date(song.last_edited_at).toLocaleDateString()}
                </p>
              </Link>
              <form
                action={async () => {
                  await deleteSong(song.id);
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-text-faint transition hover:text-danger"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
