"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { deleteSong } from "@/app/songs/actions";
import { countLineSyllables } from "@/lib/syllables";
import { computeRhymeScheme } from "@/lib/rhyme";
import type { Song, Section, SongStatus } from "@/lib/types";
import WritingTipPanel from "./tools/WritingTipPanel";
import RhymeFinderPanel from "./tools/RhymeFinderPanel";
import LineSparksPanel from "./tools/LineSparksPanel";
import MatchMeterPanel from "./tools/MatchMeterPanel";
import RevisionHistoryPanel from "./tools/RevisionHistoryPanel";

type ToolName = "tip" | "rhyme" | "sparks" | "meter" | "history";

const TOOLS: { name: ToolName; label: string }[] = [
  { name: "tip", label: "Writing Tip" },
  { name: "rhyme", label: "Rhyme Finder" },
  { name: "sparks", label: "Line Sparks" },
  { name: "meter", label: "Match Meter" },
  { name: "history", label: "Revision History" },
];

function useDebounce(delay = 600) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  return useCallback(
    (key: string, fn: () => void) => {
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.set(key, setTimeout(fn, delay));
    },
    [delay]
  );
}

export default function SongEditor({
  song,
  initialSections,
}: {
  song: Song;
  initialSections: Section[];
}) {
  const supabase = createClient();
  const debounce = useDebounce();
  const lastSnapshotContent = useRef<Record<string, string>>({});

  const [title, setTitle] = useState(song.title);
  const [status, setStatus] = useState<SongStatus>(song.status);
  const [sections, setSections] = useState(initialSections);
  const [rhymeSchemes, setRhymeSchemes] = useState<Record<string, string>>({});
  const [activeTool, setActiveTool] = useState<Record<string, ToolName | undefined>>(
    {}
  );

  const recomputeRhymeScheme = useCallback((sectionId: string, content: string) => {
    computeRhymeScheme(content.split("\n")).then((scheme) => {
      setRhymeSchemes((prev) => ({ ...prev, [sectionId]: scheme }));
    });
  }, []);

  useEffect(() => {
    initialSections.forEach((s) => {
      recomputeRhymeScheme(s.id, s.content);
      lastSnapshotContent.current[s.id] = s.content;
    });
    // Only run once on mount; later changes are handled by updateSectionField.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debounce("title", () => {
      supabase
        .from("songs")
        .update({ title: value, last_edited_at: new Date().toISOString() })
        .eq("id", song.id)
        .then();
    });
  };

  const handleStatusToggle = async () => {
    const next: SongStatus = status === "draft" ? "finished" : "draft";
    setStatus(next);
    await supabase
      .from("songs")
      .update({ status: next, last_edited_at: new Date().toISOString() })
      .eq("id", song.id);
  };

  const handleDeleteSong = async () => {
    if (!confirm("Delete this song? This cannot be undone.")) return;
    await deleteSong(song.id);
  };

  const updateSectionField = (
    id: string,
    field: "label" | "content",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    debounce(`section-${field}-${id}`, () => {
      supabase.from("sections").update({ [field]: value }).eq("id", id).then();
    });
    if (field === "content") {
      debounce(`rhyme-${id}`, () => recomputeRhymeScheme(id, value));
    }
  };

  const addSection = async () => {
    const nextIndex =
      sections.length > 0
        ? Math.max(...sections.map((s) => s.order_index)) + 1
        : 0;
    const { data, error } = await supabase
      .from("sections")
      .insert({
        song_id: song.id,
        order_index: nextIndex,
        label: "New Section",
        content: "",
      })
      .select()
      .single();

    if (!error && data) {
      setSections((prev) => [...prev, data]);
      lastSnapshotContent.current[data.id] = data.content;
    }
  };

  const deleteSection = async (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    delete lastSnapshotContent.current[id];
    await supabase.from("sections").delete().eq("id", id);
  };

  const moveSection = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const current = sections[index];
    const target = sections[targetIndex];
    const updatedCurrent = { ...current, order_index: target.order_index };
    const updatedTarget = { ...target, order_index: current.order_index };

    const reordered = [...sections];
    reordered[index] = updatedTarget;
    reordered[targetIndex] = updatedCurrent;
    setSections(reordered);

    await Promise.all([
      supabase
        .from("sections")
        .update({ order_index: updatedCurrent.order_index })
        .eq("id", updatedCurrent.id),
      supabase
        .from("sections")
        .update({ order_index: updatedTarget.order_index })
        .eq("id", updatedTarget.id),
    ]);
  };

  const toggleTool = (sectionId: string, tool: ToolName) => {
    setActiveTool((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === tool ? undefined : tool,
    }));
  };

  const handleContentBlur = async (sectionId: string, content: string) => {
    if (lastSnapshotContent.current[sectionId] === content) return;
    lastSnapshotContent.current[sectionId] = content;

    await supabase
      .from("section_revisions")
      .insert({ section_id: sectionId, content_snapshot: content });

    const { data: revisions } = await supabase
      .from("section_revisions")
      .select("id")
      .eq("section_id", sectionId)
      .order("saved_at", { ascending: false });

    if (revisions && revisions.length > 20) {
      const idsToDelete = revisions.slice(20).map((r) => r.id);
      await supabase.from("section_revisions").delete().in("id", idsToDelete);
    }
  };

  const handleRestoreRevision = async (sectionId: string, content: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.content !== content) {
      await supabase.from("section_revisions").insert({
        section_id: sectionId,
        content_snapshot: section.content,
      });
    }
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content } : s))
    );
    lastSnapshotContent.current[sectionId] = content;
    await supabase.from("sections").update({ content }).eq("id", sectionId);
    recomputeRhymeScheme(sectionId, content);
  };

  const handleSetTargetMeterRef = async (
    sectionId: string,
    targetId: string | null
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, target_meter_ref: targetId } : s
      )
    );
    await supabase
      .from("sections")
      .update({ target_meter_ref: targetId })
      .eq("id", sectionId);
  };

  const handleInsertLine = (sectionId: string, line: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const newContent = section.content ? `${section.content}\n${line}` : line;
    updateSectionField(sectionId, "content", newContent);
  };

  const handleMatchRhymeChange = async (sectionId: string, value: boolean) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, match_rhyme_on_continuations: value } : s
      )
    );
    await supabase
      .from("sections")
      .update({ match_rhyme_on_continuations: value })
      .eq("id", sectionId);
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-neutral-500 underline">
          ← Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStatusToggle}
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm capitalize"
          >
            {status}
          </button>
          <button
            onClick={handleDeleteSong}
            className="text-sm text-neutral-400 hover:text-red-600"
          >
            Delete Song
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="mb-8 w-full border-b border-neutral-200 pb-2 text-3xl font-semibold outline-none"
      />

      <div className="flex flex-col gap-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="rounded-2xl border border-neutral-200 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  value={section.label}
                  onChange={(e) =>
                    updateSectionField(section.id, "label", e.target.value)
                  }
                  className="text-lg font-medium outline-none"
                />
                {rhymeSchemes[section.id] && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                    {rhymeSchemes[section.id]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <button
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="disabled:opacity-30"
                  aria-label="Move section up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  className="disabled:opacity-30"
                  aria-label="Move section down"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="mb-3 flex gap-3 rounded-lg border border-neutral-200 p-3">
              <textarea
                value={section.content}
                onChange={(e) =>
                  updateSectionField(section.id, "content", e.target.value)
                }
                onBlur={(e) => handleContentBlur(section.id, e.target.value)}
                rows={Math.max(4, section.content.split("\n").length)}
                wrap="off"
                placeholder="Write your lyrics..."
                className="flex-1 resize-none overflow-x-auto font-mono text-sm leading-6 outline-none"
              />
              <div className="flex flex-col items-end text-xs leading-6 text-neutral-400 select-none">
                {section.content.split("\n").map((line, i) => (
                  <div key={i}>{line.trim() ? countLineSyllables(line) : ""}</div>
                ))}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => toggleTool(section.id, tool.name)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    activeTool[section.id] === tool.name
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>

            {activeTool[section.id] === "tip" && (
              <WritingTipPanel label={section.label} />
            )}
            {activeTool[section.id] === "rhyme" && (
              <RhymeFinderPanel sectionContent={section.content} />
            )}
            {activeTool[section.id] === "sparks" && (
              <LineSparksPanel
                sectionContent={section.content}
                matchRhyme={section.match_rhyme_on_continuations}
                onMatchRhymeChange={(value) =>
                  handleMatchRhymeChange(section.id, value)
                }
                onInsertLine={(line) => handleInsertLine(section.id, line)}
              />
            )}
            {activeTool[section.id] === "meter" && (
              <MatchMeterPanel
                section={section}
                allSections={sections}
                onSetTargetRef={(targetId) =>
                  handleSetTargetMeterRef(section.id, targetId)
                }
              />
            )}
            {activeTool[section.id] === "history" && (
              <RevisionHistoryPanel
                sectionId={section.id}
                onRestore={(content) =>
                  handleRestoreRevision(section.id, content)
                }
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addSection}
        className="mt-6 rounded-full border border-dashed border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:border-neutral-400"
      >
        + Add Section
      </button>
    </main>
  );
}
