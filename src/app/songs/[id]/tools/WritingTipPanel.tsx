"use client";

import { getWritingTip } from "@/lib/writingTips";

export default function WritingTipPanel({ label }: { label: string }) {
  const { title, tip } = getWritingTip(label);
  return (
    <div className="rounded-lg bg-neutral-50 p-4 text-sm">
      <p className="mb-1 font-medium text-neutral-700">{title} tip</p>
      <p className="text-neutral-600">{tip}</p>
    </div>
  );
}
