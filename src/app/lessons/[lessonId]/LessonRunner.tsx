"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type {
  Lesson,
  LessonExercise,
  LessonExerciseProgress,
} from "@/lib/types";
import ChoiceExercise from "./ChoiceExercise";
import FillInBlankExercise from "./FillInBlankExercise";
import ReorderExercise from "./ReorderExercise";

export default function LessonRunner({
  lesson,
  exercises,
  initialProgress,
}: {
  lesson: Lesson;
  exercises: LessonExercise[];
  initialProgress: LessonExerciseProgress[];
}) {
  const supabase = createClient();
  const [completedIds, setCompletedIds] = useState(
    () => new Set(initialProgress.map((p) => p.exercise_id))
  );
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnfinished = exercises.findIndex((e) => !completedIds.has(e.id));
    return firstUnfinished === -1 ? exercises.length : firstUnfinished;
  });
  const [answered, setAnswered] = useState(false);

  const current = exercises[currentIndex];

  const handleAnswered = async (selected: unknown) => {
    setAnswered(true);
    setCompletedIds((prev) => new Set(prev).add(current.id));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("lesson_exercise_progress").upsert(
      {
        user_id: user.id,
        exercise_id: current.id,
        selected_option: selected,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,exercise_id" }
    );
  };

  const handleNext = () => {
    setAnswered(false);
    setCurrentIndex((i) => i + 1);
  };

  if (exercises.length === 0) {
    return (
      <main className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-neutral-500">
          No exercises yet for {lesson.title}.
        </p>
        <Link href="/lessons" className="mt-4 inline-block underline">
          Back to Topics
        </Link>
      </main>
    );
  }

  if (currentIndex >= exercises.length) {
    return (
      <main className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Topic complete!</h1>
        <p className="mb-6 text-neutral-500">
          You&apos;ve been through every exercise in {lesson.title}.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setAnswered(false);
            }}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Review from the start
          </button>
          <Link
            href="/lessons"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium"
          >
            Back to Topics
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between text-sm text-neutral-500">
        <Link href="/lessons" className="underline">
          ← Topics
        </Link>
        <span>
          Exercise {currentIndex + 1} of {exercises.length}
        </span>
      </div>

      <div key={current.id}>
        {(current.exercise_type === "multiple_choice" ||
          current.exercise_type === "compare_judge" ||
          current.exercise_type === "spot_pattern") && (
          <ChoiceExercise exercise={current} onAnswered={handleAnswered} />
        )}
        {current.exercise_type === "fill_in_blank" && (
          <FillInBlankExercise exercise={current} onAnswered={handleAnswered} />
        )}
        {current.exercise_type === "reorder" && (
          <ReorderExercise exercise={current} onAnswered={handleAnswered} />
        )}
      </div>

      {answered && (
        <button
          onClick={handleNext}
          className="mt-6 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          {currentIndex + 1 < exercises.length ? "Next Exercise" : "Finish Topic"}
        </button>
      )}
    </main>
  );
}
