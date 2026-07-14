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
      <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm text-text-muted">
        Write a line in this section first — Line Sparks suggests rough ways
        to continue it.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm">
      <p className="mb-2 text-text-muted">
        Continuing from:{" "}
        <span className="italic text-text">&quot;{lastLine}&quot;</span>
      </p>
      <label className="mb-3 flex items-center gap-2 text-text-muted">
        <input
          type="checkbox"
          checked={matchRhyme}
          onChange={(e) => onMatchRhymeChange(e.target.checked)}
          className="accent-accent"
        />
        Match rhyme on continuations
      </label>
      <button
        onClick={getSparks}
        disabled={loading}
        className="mb-3 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_4px_rgba(0,0,0,0.3)] transition hover:bg-accent-hover active:translate-y-px disabled:opacity-50"
      >
        {loading ? "Sparking..." : "Get Line Sparks"}
      </button>
      {error && <p className="text-danger">{error}</p>}
      {options && (
        <div>
          <p className="mb-2 text-xs text-text-faint">
            Rough starting points — edit these to make them yours, not
            answers to drop in as-is.
          </p>
          <div className="flex flex-col gap-2">
            {options.map((option, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg px-3 py-2"
              >
                <span className="text-text">{option}</span>
                <button
                  onClick={() => onInsertLine(option)}
                  className="shrink-0 text-xs font-medium text-accent transition hover:text-accent-hover"
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
