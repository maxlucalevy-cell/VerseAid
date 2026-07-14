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
    <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm">
      <div className="mb-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Word to rhyme..."
          className="flex-1 rounded-full border border-border-strong bg-bg px-3 py-1.5 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          onClick={search}
          disabled={loading}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_4px_rgba(0,0,0,0.3)] transition hover:bg-accent-hover active:translate-y-px disabled:opacity-50"
        >
          {loading ? "Searching..." : "Find Rhymes"}
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      {results &&
        (results.length === 0 ? (
          <p className="text-text-faint">
            No rhymes found for &quot;{query}&quot;.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.map((word) => (
              <span
                key={word}
                className="rounded-full border border-border bg-bg px-2.5 py-1 text-text-muted"
              >
                {word}
              </span>
            ))}
          </div>
        ))}
    </div>
  );
}
