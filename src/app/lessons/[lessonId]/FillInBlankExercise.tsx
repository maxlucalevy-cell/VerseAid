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
      <p className="mb-4 text-lg font-medium">{exercise.prompt}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        rows={2}
        placeholder="Type your answer..."
        className="w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none disabled:bg-neutral-50"
      />
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="mt-3 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Show Feedback
        </button>
      ) : (
        <div className="mt-3 rounded-lg bg-neutral-50 p-4 text-sm">
          <p className="mb-2 text-neutral-500">
            There&apos;s no single right answer here — yours doesn&apos;t
            need to match this, just needs to do the same job:
          </p>
          <p className="mb-2 italic text-neutral-700">
            &quot;{feedback.example}&quot;
          </p>
          <p className="text-neutral-600">{feedback.reasoning}</p>
        </div>
      )}
    </div>
  );
}
