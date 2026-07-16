"use client";

import { useState } from "react";
import type { LessonExercise } from "@/lib/types";

export default function FillInBlankExercise({
  exercise,
  onAnswered,
}: {
  exercise: LessonExercise;
  onAnswered: (selected: string) => void;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const feedback = exercise.feedback as unknown as {
    example: string;
    reasoning: string;
  };

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    setSubmitted(true);
    onAnswered(value.trim());
  };

  return (
    <div>
      <p className="font-display mb-4 text-lg font-medium text-text">
        {exercise.prompt}
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        rows={2}
        placeholder="Type your answer..."
        className="w-full rounded-xl border border-border-strong bg-bg-inset p-3 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-70"
      />
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_4px_rgba(0,0,0,0.3)] transition hover:bg-accent-hover active:translate-y-px disabled:opacity-40"
        >
          Show Feedback
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-border bg-bg-inset p-4 text-sm">
          <p className="mb-2 text-text-muted">
            There&apos;s no single right answer here. Yours doesn&apos;t
            need to match this, it just needs to do the same job:
          </p>
          <p className="mb-2 italic text-text">
            &quot;{feedback.example}&quot;
          </p>
          <p className="text-text-muted">{feedback.reasoning}</p>
        </div>
      )}
    </div>
  );
}
