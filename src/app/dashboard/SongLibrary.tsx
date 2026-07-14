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
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/songs/new"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New Song
        </Link>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs..."
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm"
        />
        <div className="flex gap-1 text-sm">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 capitalize ${
                statusFilter === s
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {songs.length === 0 ? (
        <p className="text-neutral-500">
          {initialSongs.length === 0
            ? "No songs yet. Start your first one."
            : "No songs match your search."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {songs.map((song) => (
            <li
              key={song.id}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4"
            >
              <Link href={`/songs/${song.id}`} className="flex-1">
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-neutral-500">
                  {song.status === "finished" ? "Finished" : "Draft"} ·
                  Edited {new Date(song.last_edited_at).toLocaleDateString()}
                </p>
              </Link>
              <form
                action={async () => {
                  await deleteSong(song.id);
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-neutral-400 hover:text-red-600"
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
