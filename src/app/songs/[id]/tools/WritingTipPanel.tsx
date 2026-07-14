"use client";

import { getWritingTip } from "@/lib/writingTips";

export default function WritingTipPanel({ label }: { label: string }) {
  const { title, tip } = getWritingTip(label);
  return (
    <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm">
      <p className="mb-1 font-medium text-accent">{title} tip</p>
      <p className="text-text-muted">{tip}</p>
    </div>
  );
}
