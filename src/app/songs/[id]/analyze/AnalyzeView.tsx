"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnalysisResult, ClicheFlag, Song } from "@/lib/types";

type SectionSnippet = { label: string; content: string };

type SuggestionState = {
  loading?: boolean;
  text?: string;
  error?: string;
};

function formatAnalyzedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReportCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="paper-grain rounded-2xl border border-border bg-bg-raised p-5 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)]">
      <h2 className="font-display text-lg font-medium text-text">{title}</h2>
      <p className="mt-1 mb-4 text-xs text-text-faint">{subtitle}</p>
      {children}
    </section>
  );
}

export default function AnalyzeView({
  song,
  sections,
  initialResult,
}: {
  song: Song;
  sections: SectionSnippet[];
  initialResult: AnalysisResult | null;
}) {
  const [result, setResult] = useState<AnalysisResult | null>(initialResult);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [craftError, setCraftError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    Record<string, SuggestionState>
  >({});

  const runAnalysis = async () => {
    setRunning(true);
    setError(null);
    setCraftError(null);
    setSuggestions({});
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ songId: song.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data.result);
      if (data.craftError) setCraftError(data.craftError);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  const findLineFor = (flag: ClicheFlag): string | null => {
    const needle = flag.matched_text.toLowerCase();
    for (const section of sections) {
      for (const line of section.content.split("\n")) {
        if (line.toLowerCase().includes(needle)) return line.trim();
      }
    }
    return null;
  };

  const suggestAlternative = async (flag: ClicheFlag) => {
    setSuggestions((prev) => ({ ...prev, [flag.phrase]: { loading: true } }));
    try {
      const res = await fetch("/api/cliche-alternative", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phrase: flag.matched_text,
          line: findLineFor(flag),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suggestion failed");
      setSuggestions((prev) => ({
        ...prev,
        [flag.phrase]: { text: data.alternative },
      }));
    } catch (e) {
      setSuggestions((prev) => ({
        ...prev,
        [flag.phrase]: {
          error: e instanceof Error ? e.message : "Suggestion failed",
        },
      }));
    }
  };

  const craft = result?.craft_analysis ?? null;
  const repCliche = result?.repetition_cliche_analysis ?? null;
  const nothingFlagged =
    repCliche &&
    repCliche.repeated_words.length === 0 &&
    repCliche.repeated_lines.length === 0 &&
    repCliche.cliches.length === 0;

  return (
    <main className="fade-in-section mx-auto max-w-3xl p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/songs/${song.id}`}
          className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 transition hover:text-text"
        >
          ← Back to Editor
        </Link>
        <button
          onClick={runAnalysis}
          disabled={running}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-accent-hover active:translate-y-px disabled:opacity-60"
        >
          {running ? "Analyzing..." : result ? "Re-run Analysis" : "Run Analysis"}
        </button>
      </div>

      <h1 className="font-display mb-1 text-2xl font-semibold text-text">
        Analyze — {song.title}
      </h1>
      {result && (
        <p className="mb-8 text-xs text-text-faint">
          Last analyzed {formatAnalyzedAt(result.analyzed_at)}
        </p>
      )}

      {error && (
        <p className="mb-6 rounded-xl border border-danger/40 bg-bg-raised p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {!result && !error && (
        <p className="mt-4 text-sm text-text-muted">
          Run an analysis to get a coach&rsquo;s read on your song — what&rsquo;s
          working, what&rsquo;s worth a second look, and any repetition or
          familiar phrasing worth being aware of. Observations, not grades.
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <ReportCard
            title="Craft Analysis"
            subtitle="A coach's read on what's working and what's worth your attention — never a rewrite."
          >
            {craft ? (
              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <p className="mb-2 font-medium text-accent">Strengths</p>
                  <ul className="flex flex-col gap-1.5 text-text-muted">
                    {craft.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium text-text">Observations</p>
                  <ul className="flex flex-col gap-1.5 text-text-muted">
                    {craft.observations.map((o, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-text-faint">•</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Craft Analysis didn&rsquo;t run this time
                {craftError ? ` — ${craftError}` : "."}
              </p>
            )}
          </ReportCard>

          <ReportCard
            title="Clichés & Repetition"
            subtitle="Deterministic checks, no AI involved. These are observations, not corrections — repetition and familiar phrases can be deliberate choices. The call is always yours."
          >
            {nothingFlagged ? (
              <p className="text-sm text-text-muted">
                Nothing flagged — no heavy word repetition, no repeated lines
                outside your chorus, and no stock phrases from our reference
                list.
              </p>
            ) : (
              <div className="flex flex-col gap-5 text-sm">
                {repCliche!.repeated_words.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-text">Repeated words</p>
                    <ul className="flex flex-col gap-2 text-text-muted">
                      {repCliche!.repeated_words.map((flag) => (
                        <li key={flag.word}>
                          <span className="rounded-md border border-border bg-bg-inset px-1.5 py-0.5 font-mono text-xs text-accent">
                            {flag.word}
                          </span>{" "}
                          shows up {flag.count} times outside your chorus (in{" "}
                          {flag.sections.join(", ")}) — sometimes that&rsquo;s a
                          deliberate motif, sometimes it&rsquo;s worth varying.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {repCliche!.repeated_lines.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-text">Repeated lines</p>
                    <ul className="flex flex-col gap-2 text-text-muted">
                      {repCliche!.repeated_lines.map((flag) => (
                        <li key={flag.line}>
                          <span className="rounded-md border border-border bg-bg-inset px-1.5 py-0.5 font-mono text-xs text-text">
                            &ldquo;{flag.line}&rdquo;
                          </span>{" "}
                          appears {flag.count} times outside your designated
                          chorus ({flag.sections.join(", ")}) — worth checking
                          it&rsquo;s repeating by design rather than by
                          accident.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {repCliche!.cliches.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-text">
                      Familiar phrases
                    </p>
                    <ul className="flex flex-col gap-3 text-text-muted">
                      {repCliche!.cliches.map((flag) => {
                        const suggestion = suggestions[flag.phrase];
                        return (
                          <li key={flag.phrase}>
                            <span className="rounded-md border border-border bg-bg-inset px-1.5 py-0.5 font-mono text-xs text-text">
                              &ldquo;{flag.matched_text}&rdquo;
                            </span>{" "}
                            (in {flag.sections.join(", ")}) — this phrase
                            appears often in songwriting. Worth checking if
                            it&rsquo;s landing fresh here, or if a more
                            specific image could hit harder.
                            <div className="mt-1.5">
                              {!suggestion?.text && (
                                <button
                                  onClick={() => suggestAlternative(flag)}
                                  disabled={suggestion?.loading}
                                  className="text-xs text-accent underline decoration-border-strong underline-offset-2 transition hover:text-accent-hover disabled:opacity-60"
                                >
                                  {suggestion?.loading
                                    ? "Thinking..."
                                    : "Suggest an alternative (AI, optional)"}
                                </button>
                              )}
                              {suggestion?.text && (
                                <p className="mt-1 rounded-xl border border-border bg-bg-inset p-3 text-xs">
                                  <span className="text-text-faint">
                                    A rough starting point, not a rewrite to
                                    accept:{" "}
                                  </span>
                                  <span className="text-text">
                                    {suggestion.text}
                                  </span>
                                </p>
                              )}
                              {suggestion?.error && (
                                <p className="mt-1 text-xs text-danger">
                                  {suggestion.error}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </ReportCard>
        </div>
      )}
    </main>
  );
}
