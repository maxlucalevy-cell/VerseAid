"use client";

import { useState } from "react";
import type { ExerciseOption, LessonExercise } from "@/lib/types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ReorderExercise({
  exercise,
  onAnswered,
}: {
  exercise: LessonExercise;
  onAnswered: (selected: string[]) => void;
}) {
  const [items, setItems] = useState<ExerciseOption[]>(() =>
    shuffle(exercise.options ?? [])
  );
  const [submitted, setSubmitted] = useState(false);
  const correctOrder = exercise.correct_or_stronger as string[] | null;
  const feedback = exercise.feedback as unknown as {
    match: string;
    mismatch: string;
  };

  const move = (index: number, direction: -1 | 1) => {
    if (submitted) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    onAnswered(items.map((i) => i.id));
  };

  const isMatch =
    correctOrder != null &&
    items.length === correctOrder.length &&
    items.every((item, i) => item.id === correctOrder[i]);

  return (
    <div>
      <p className="mb-4 text-lg font-medium">{exercise.prompt}</p>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm"
          >
            <span>{item.text}</span>
            {!submitted && (
              <div className="flex gap-2 text-neutral-400">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-3 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Check Order
        </button>
      ) : (
        <div className="mt-3 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
          <p>{exercise.is_mechanical && !isMatch ? feedback.mismatch : feedback.match}</p>
        </div>
      )}
    </div>
  );
}
