"use client";

import { useEffect, useState } from "react";
import { createSongFromInspiration } from "@/app/songs/actions";
import {
  STRUCTURE_TEMPLATE_NAMES,
  type StructureTemplateName,
} from "@/lib/structureTemplates";

const MOODS = [
  "Happy/Upbeat",
  "Heartbreak",
  "Nostalgic",
  "Empowering",
  "Chill/Dreamy",
  "Angry/Rebellious",
];

const STYLES = ["Pop", "Folk/Acoustic", "Hip-Hop", "R&B", "Country", "Rock"];

const SEEN_KEY = "verseaid:inspirationStarterSeen";

type Result = { angle: string; openingLine: string; pov: string };

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              value === option
                ? "bg-accent font-medium text-bg shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "border border-border bg-bg-inset text-text-muted shadow-inner hover:border-border-strong hover:text-text"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InspirationStarterForm() {
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [template, setTemplate] = useState<StructureTemplateName>(
    STRUCTURE_TEMPLATE_NAMES[0]
  );
  const [showFirstUseNote, setShowFirstUseNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    // Must run client-side only (SSR has no localStorage), so this can't be
    // computed as a lazy useState initializer without a hydration mismatch.
    if (!localStorage.getItem(SEEN_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowFirstUseNote(true);
      localStorage.setItem(SEEN_KEY, "1");
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inspiration-starter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, mood, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-text">
        Inspiration Starter
      </h1>
      <p className="mb-4 text-sm text-text-muted">
        A spark to build from, not a finished song. You write everything
        else yourself.
      </p>

      {showFirstUseNote && (
        <div className="mb-6 rounded-xl border border-border bg-bg-raised p-3 text-sm text-accent">
          This gives you a spark to build from. VerseAid never writes your
          song for you.
        </div>
      )}

      {!result && (
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text">
              Topic or theme
            </span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. losing touch with an old friend"
              className="rounded-lg border border-border-strong bg-bg-inset px-3 py-2 text-text placeholder:text-text-faint outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>

          <PillGroup label="Mood" options={MOODS} value={mood} onChange={setMood} />
          <PillGroup label="Style" options={STYLES} value={style} onChange={setStyle} />
          <PillGroup
            label="Starting structure"
            options={STRUCTURE_TEMPLATE_NAMES}
            value={template}
            onChange={(v) => setTemplate(v as StructureTemplateName)}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-accent-hover active:translate-y-px disabled:opacity-50"
            >
              {loading ? "Getting you started..." : "Get me started"}
            </button>

            <form action={createSongFromInspiration}>
              <input type="hidden" name="title" value={topic || "Untitled Song"} />
              <input type="hidden" name="template" value={template} />
              <input type="hidden" name="mood" value={mood} />
              <input type="hidden" name="style" value={style} />
              <input type="hidden" name="angle" value="" />
              <input type="hidden" name="pov" value="" />
              <input type="hidden" name="openingLine" value="" />
              <button
                type="submit"
                className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 transition hover:text-text"
              >
                Skip and just create the song
              </button>
            </form>
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-5">
          <div className="paper-grain rounded-xl border border-border bg-bg-raised p-4 text-sm">
            <p className="mb-3">
              <span className="font-medium text-accent">
                Creative angle:{" "}
              </span>
              <span className="text-text-muted">{result.angle}</span>
            </p>
            <p className="mb-3">
              <span className="font-medium text-accent">
                Sample opening line{" "}
              </span>
              <span className="text-xs text-text-faint">
                (a starting point, not a first draft)
              </span>
              <br />
              <span className="italic text-text">
                &quot;{result.openingLine}&quot;
              </span>
            </p>
            <p>
              <span className="font-medium text-accent">
                Narrator / POV:{" "}
              </span>
              <span className="text-text-muted">{result.pov}</span>
            </p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full border border-border-strong bg-bg-raised px-5 py-2.5 text-sm font-medium text-text transition hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </button>

            <form action={createSongFromInspiration}>
              <input type="hidden" name="title" value={topic || "Untitled Song"} />
              <input type="hidden" name="template" value={template} />
              <input type="hidden" name="mood" value={mood} />
              <input type="hidden" name="style" value={style} />
              <input type="hidden" name="angle" value={result.angle} />
              <input type="hidden" name="pov" value={result.pov} />
              <input type="hidden" name="openingLine" value={result.openingLine} />
              <button
                type="submit"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-accent-hover active:translate-y-px"
              >
                Create Song
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
