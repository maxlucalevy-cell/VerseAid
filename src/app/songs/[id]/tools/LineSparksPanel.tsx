"use client";

import { useState } from "react";

export default function LineSparksPanel({
  sectionContent,
  matchRhyme,
  onMatchRhymeChange,
  onInsertLine,
}: {
  sectionContent: string;
  matchRhyme: boolean;
  onMatchRhymeChange: (value: boolean) => void;
  onInsertLine: (line: string) => void;
}) {
  const lastLine =
    sectionContent
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .pop() ?? "";
  const [options, setOptions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSparks = async () => {
    setLoading(true);
    setError(null);
    setOptions(null);
    try {
      const res = await fetch("/api/line-sparks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ previousLine: lastLine, matchRhyme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Line Sparks failed");
      setOptions(data.options);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Line Sparks failed");
    } finally {
      setLoading(false);
    }
  };

  if (!lastLine) {
    return (
      <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">
        Write a line in this section first — Line Sparks suggests rough ways
        to continue it.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-neutral-50 p-4 text-sm">
      <p className="mb-2 text-neutral-500">
        Continuing from:{" "}
        <span className="italic text-neutral-700">&quot;{lastLine}&quot;</span>
      </p>
      <label className="mb-3 flex items-center gap-2 text-neutral-600">
        <input
          type="checkbox"
          checked={matchRhyme}
          onChange={(e) => onMatchRhymeChange(e.target.checked)}
        />
        Match rhyme on continuations
      </label>
      <button
        onClick={getSparks}
        disabled={loading}
        className="mb-3 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Sparking..." : "Get Line Sparks"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
      {options && (
        <div>
          <p className="mb-2 text-xs text-neutral-500">
            Rough starting points — edit these to make them yours, not
            answers to drop in as-is.
          </p>
          <div className="flex flex-col gap-2">
            {options.map((option, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 shadow-sm"
              >
                <span className="text-neutral-700">{option}</span>
                <button
                  onClick={() => onInsertLine(option)}
                  className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Insert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
