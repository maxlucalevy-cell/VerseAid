"use client";

import { useState } from "react";
import { extractEndWord } from "@/lib/rhyme";

export default function RhymeFinderPanel({
  sectionContent,
}: {
  sectionContent: string;
}) {
  const lastLine =
    sectionContent
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .pop() ?? "";
  const [query, setQuery] = useState(extractEndWord(lastLine) ?? "");
  const [results, setResults] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const word = query.trim();
    if (!word) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rhymes?word=${encodeURIComponent(word)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      setResults(data.rhymes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-neutral-50 p-4 text-sm">
      <div className="mb-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Word to rhyme..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm outline-none"
        />
        <button
          onClick={search}
          disabled={loading}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Searching..." : "Find Rhymes"}
        </button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {results &&
        (results.length === 0 ? (
          <p className="text-neutral-500">
            No rhymes found for &quot;{query}&quot;.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.map((word) => (
              <span
                key={word}
                className="rounded-full bg-white px-2.5 py-1 text-neutral-700 shadow-sm"
              >
                {word}
              </span>
            ))}
          </div>
        ))}
    </div>
  );
}
