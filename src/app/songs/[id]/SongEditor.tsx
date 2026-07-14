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
import AudioUploader from "./AudioUploader";
import AudioPlayerBar, { type AudioPlayerHandle } from "./AudioPlayerBar";
import MetronomePanel from "./MetronomePanel";
import { formatTime } from "@/lib/time";

const AUDIO_BUCKET = "song-audio";

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
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);

  const [title, setTitle] = useState(song.title);
  const [status, setStatus] = useState<SongStatus>(song.status);
  const [sections, setSections] = useState(initialSections);
  const [rhymeSchemes, setRhymeSchemes] = useState<Record<string, string>>({});
  const [activeTool, setActiveTool] = useState<Record<string, ToolName | undefined>>(
    {}
  );
  const [audioPath, setAudioPath] = useState(song.audio_url);
  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [bpm, setBpm] = useState(song.bpm);

  useEffect(() => {
    if (!audioPath) return;
    supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(audioPath, 3600)
      .then(({ data }) => {
        if (data) setSignedAudioUrl(data.signedUrl);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPath]);

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

  const handleAudioUploaded = async (path: string, duration: number) => {
    setAudioPath(path);
    await supabase
      .from("songs")
      .update({ audio_url: path, audio_duration: duration })
      .eq("id", song.id);
  };

  const handleRemoveAudio = async () => {
    if (!audioPath) return;
    if (!confirm("Remove this song's reference audio?")) return;
    await supabase.storage.from(AUDIO_BUCKET).remove([audioPath]);
    await supabase
      .from("songs")
      .update({ audio_url: null, audio_duration: null })
      .eq("id", song.id);
    setAudioPath(null);
  };

  const handleBpmChange = (value: number) => {
    setBpm(value);
    debounce("bpm", () => {
      supabase.from("songs").update({ bpm: value }).eq("id", song.id).then();
    });
  };

  const handleMarkSectionStart = async (sectionId: string) => {
    const time = audioPlayerRef.current?.getCurrentTime() ?? 0;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, start_time: time } : s))
    );
    await supabase
      .from("sections")
      .update({ start_time: time })
      .eq("id", sectionId);
  };

  const handlePlayFromSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.start_time != null) {
      audioPlayerRef.current?.seekTo(section.start_time);
    }
  };

  return (
    <main
      className={`fade-in-section mx-auto max-w-3xl p-6 sm:p-8 ${audioPath ? "pb-28" : ""}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 transition hover:text-text"
        >
          ← Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/songs/${song.id}/read`}
            className="rounded-full border border-border-strong bg-bg-raised px-4 py-1.5 text-sm text-text transition hover:border-accent hover:text-accent"
          >
            Read View
          </Link>
          <button
            onClick={handleStatusToggle}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              status === "finished"
                ? "bg-accent text-bg shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "border border-border-strong bg-bg-inset text-text-muted shadow-inner hover:text-text"
            }`}
          >
            {status}
          </button>
          <button
            onClick={handleDeleteSong}
            className="text-sm text-text-faint transition hover:text-danger"
          >
            Delete Song
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="font-display mb-8 w-full border-b border-border-strong bg-transparent pb-2 text-3xl font-semibold text-text outline-none transition focus:border-accent"
      />

      {(song.inspiration_angle || song.inspiration_pov) && (
        <div className="paper-grain mb-8 rounded-2xl border border-border bg-bg-raised p-4 text-sm text-text-muted">
          <p className="mb-1 font-medium text-accent">Inspiration Starter</p>
          {song.inspiration_angle && <p>Angle: {song.inspiration_angle}</p>}
          {song.inspiration_pov && <p>POV: {song.inspiration_pov}</p>}
        </div>
      )}

      {!audioPath && (
        <>
          <AudioUploader
            songId={song.id}
            userId={song.user_id}
            onUploaded={handleAudioUploaded}
          />
          <MetronomePanel bpm={bpm} onBpmChange={handleBpmChange} />
        </>
      )}

      <div className="flex flex-col gap-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="paper-grain rounded-2xl border border-border bg-bg-raised p-5 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  value={section.label}
                  onChange={(e) =>
                    updateSectionField(section.id, "label", e.target.value)
                  }
                  className="font-display text-lg font-medium text-text outline-none"
                />
                {rhymeSchemes[section.id] && (
                  <span className="rounded-full border border-border-strong bg-bg-inset px-2 py-0.5 text-xs font-medium text-accent">
                    {rhymeSchemes[section.id]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-text-faint">
                <button
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="transition hover:text-text disabled:opacity-30"
                  aria-label="Move section up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  className="transition hover:text-text disabled:opacity-30"
                  aria-label="Move section down"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="transition hover:text-danger"
                >
                  Remove
                </button>
              </div>
            </div>
            {audioPath && (
              <div className="mb-2 flex items-center gap-3 text-xs text-text-faint">
                <button
                  onClick={() => handleMarkSectionStart(section.id)}
                  className="transition hover:text-text"
                >
                  Mark start
                  {section.start_time != null
                    ? ` (${formatTime(section.start_time)})`
                    : ""}
                </button>
                {section.start_time != null && (
                  <button
                    onClick={() => handlePlayFromSection(section.id)}
                    className="text-accent transition hover:text-accent-hover"
                  >
                    ▶ Play from here
                  </button>
                )}
              </div>
            )}
            <div className="mb-3 flex gap-3 rounded-xl border border-border-strong bg-bg-inset p-3">
              <textarea
                value={section.content}
                onChange={(e) =>
                  updateSectionField(section.id, "content", e.target.value)
                }
                onBlur={(e) => handleContentBlur(section.id, e.target.value)}
                rows={Math.max(4, section.content.split("\n").length)}
                wrap="off"
                placeholder="Write your lyrics..."
                className="flex-1 resize-none overflow-x-auto bg-transparent font-mono text-sm leading-6 text-text outline-none placeholder:text-text-faint"
              />
              <div className="flex flex-col items-end text-xs leading-6 text-text-faint select-none">
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
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    activeTool[section.id] === tool.name
                      ? "bg-accent text-bg shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                      : "border border-border bg-bg-inset text-text-muted shadow-inner hover:border-border-strong hover:text-text"
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
        className="mt-6 rounded-full border border-dashed border-border-strong px-5 py-2.5 text-sm font-medium text-text-muted transition hover:border-accent hover:text-accent"
      >
        + Add Section
      </button>

      {audioPath && signedAudioUrl && (
        <AudioPlayerBar
          ref={audioPlayerRef}
          src={signedAudioUrl}
          onRemove={handleRemoveAudio}
        />
      )}
    </main>
  );
}
