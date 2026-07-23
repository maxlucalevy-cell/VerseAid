"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Music2 } from "lucide-react";
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
        initialSongs.length === 0 ? (
          <div className="paper-grain flex flex-col items-center gap-4 rounded-2xl border border-border bg-bg-raised p-10 text-center shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-bg-inset text-accent shadow-inner">
              <Music2 size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-text">
                Start your first song
              </h2>
              <p className="mx-auto mt-1 max-w-xs text-sm text-text-muted">
                Every song in your library starts as a rough draft. Give one a
                title and take it from there.
              </p>
            </div>
            <Link
              href="/songs/new"
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-accent-hover active:translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
            >
              New Song
            </Link>
          </div>
        ) : (
          <p className="text-text-muted">No songs match your search.</p>
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {songs.map((song) => (
            <li
              key={song.id}
              className="paper-grain relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-bg-raised p-4 pl-5 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_1px_0_rgba(245,240,232,0.06)_inset,0_8px_24px_rgba(0,0,0,0.35)]"
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-[3px] ${
                  song.status === "finished" ? "bg-accent" : "bg-border-strong"
                }`}
              />
              <Link href={`/songs/${song.id}`} className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-medium text-text">
                    {song.title}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      song.status === "finished"
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-border bg-bg-inset text-text-muted"
                    }`}
                  >
                    {song.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-text-muted">
                  Edited {new Date(song.last_edited_at).toLocaleDateString()}
                </p>
                {(song.mood_tags.length > 0 || song.genre_tags.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {song.mood_tags.map((tag) => (
                      <span
                        key={`mood-${tag}`}
                        className="rounded-full border border-accent/30 px-2 py-0.5 text-xs text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                    {song.genre_tags.map((tag) => (
                      <span
                        key={`genre-${tag}`}
                        className="rounded-full border border-border bg-bg-inset px-2 py-0.5 text-xs text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
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
