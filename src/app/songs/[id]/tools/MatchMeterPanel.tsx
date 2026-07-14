"use client";

import { countLineSyllables } from "@/lib/syllables";
import type { Section } from "@/lib/types";

export default function MatchMeterPanel({
  section,
  allSections,
  onSetTargetRef,
}: {
  section: Section;
  allSections: Section[];
  onSetTargetRef: (targetId: string | null) => void;
}) {
  const otherSections = allSections.filter((s) => s.id !== section.id);
  const target =
    allSections.find((s) => s.id === section.target_meter_ref) ?? null;

  const currentLines = section.content.split("\n");
  const targetLines = target ? target.content.split("\n") : [];
  const targetCounts = targetLines.map((line) =>
    line.trim() ? countLineSyllables(line) : null
  );

  return (
    <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-text-muted">Match meter against:</span>
        <select
          value={section.target_meter_ref ?? ""}
          onChange={(e) => onSetTargetRef(e.target.value || null)}
          className="rounded-full border border-border-strong bg-bg px-2 py-1 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">None</option>
          {otherSections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {!target && (
        <p className="text-text-faint">
          Pick a section above to compare this section&apos;s syllable
          pattern line by line.
        </p>
      )}

      {target && (
        <div className="flex flex-col gap-1">
          {currentLines.map((line, i) => {
            if (!line.trim()) return null;
            const count = countLineSyllables(line);
            const targetCount = targetCounts[i] ?? null;
            const diverges = targetCount !== null && targetCount !== count;
            return (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg px-2 py-1 ${
                  diverges ? "bg-accent/15 text-accent" : "text-text-muted"
                }`}
              >
                <span className="truncate">{line}</span>
                <span className="shrink-0 pl-3 text-xs">
                  {count}
                  {targetCount !== null ? ` / ${targetCount}` : ""}
                  {diverges ? " ⚠" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
