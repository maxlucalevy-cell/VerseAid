"use client";

import { useState } from "react";
import type { LessonExercise } from "@/lib/types";

export default function ChoiceExercise({
  exercise,
  onAnswered,
}: {
  exercise: LessonExercise;
  onAnswered: (selected: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const options = exercise.options ?? [];
  const feedback = exercise.feedback ?? {};
  const correctId = exercise.is_mechanical
    ? (exercise.correct_or_stronger as string | null)
    : null;

  const handleSelect = (id: string) => {
    if (selectedId) return;
    setSelectedId(id);
    onAnswered(id);
  };

  return (
    <div>
      <p className="mb-4 text-lg font-medium">{exercise.prompt}</p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = correctId === option.id;
          const showIcon = selectedId !== null && correctId !== null && isSelected;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={selectedId !== null}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                isSelected
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200"
              } ${selectedId !== null && !isSelected ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{option.text}</span>
                {showIcon && <span>{isCorrect ? "✓" : "⚠"}</span>}
              </div>
              {isSelected && feedback[option.id] && (
                <p className="mt-2 text-neutral-600">{feedback[option.id]}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
