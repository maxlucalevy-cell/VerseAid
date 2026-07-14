"use client";

import { useState } from "react";
import Link from "next/link";
import type { Song, Section } from "@/lib/types";
import { formatSongAsText, sanitizeFilename } from "@/lib/songExport";

export default function ReadView({
  song,
  sections,
}: {
  song: Song;
  sections: Section[];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatSongAsText(song.title, sections));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const text = formatSongAsText(song.title, sections);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(song.title)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <main className="fade-in-section mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/songs/${song.id}`}
          className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 hover:text-text"
        >
          ← Back to Editor
        </Link>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            onClick={handleCopy}
            className="rounded-full border border-border-strong bg-bg-raised px-4 py-1.5 font-medium text-text transition hover:border-accent hover:text-accent"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={handleExportTxt}
            className="rounded-full border border-border-strong bg-bg-raised px-4 py-1.5 font-medium text-text transition hover:border-accent hover:text-accent"
          >
            Export as .txt
          </button>
          <button
            onClick={handleExportPdf}
            className="rounded-full bg-accent px-4 py-1.5 font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_4px_rgba(0,0,0,0.3)] transition hover:bg-accent-hover active:translate-y-px"
          >
            Export as PDF
          </button>
        </div>
      </div>

      <article className="read-view-print">
        <h1 className="font-display mb-8 text-3xl font-semibold text-text">
          {song.title}
        </h1>
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                {section.label}
              </h2>
              {section.content.trim() ? (
                <div className="whitespace-pre-line text-lg leading-relaxed text-text">
                  {section.content}
                </div>
              ) : (
                <p className="section-empty italic text-text-faint">
                  (empty)
                </p>
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
