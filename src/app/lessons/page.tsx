import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export default async function LessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const { data: exercises } = await supabase
    .from("lesson_exercises")
    .select("id, lesson_id");

  const { data: progress } = await supabase
    .from("lesson_exercise_progress")
    .select("exercise_id")
    .eq("user_id", user.id);

  const completedIds = new Set((progress ?? []).map((p) => p.exercise_id));
  const exercisesByLesson = new Map<string, string[]>();
  (exercises ?? []).forEach((e) => {
    const list = exercisesByLesson.get(e.lesson_id) ?? [];
    list.push(e.id);
    exercisesByLesson.set(e.lesson_id, list);
  });

  return (
    <>
      <AppHeader />
      <main className="fade-in-section mx-auto max-w-3xl p-6 pb-28 sm:p-8 sm:pb-28">
        <h1 className="font-display mb-8 text-2xl font-semibold text-text">
          Lessons
        </h1>
        <div className="flex flex-col gap-3">
          {(lessons ?? []).map((lesson) => {
            const ids = exercisesByLesson.get(lesson.id) ?? [];
            const total = ids.length;
            const done = ids.filter((id) => completedIds.has(id)).length;
            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="paper-grain rounded-2xl border border-border bg-bg-raised p-5 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)] transition hover:border-border-strong"
              >
                <p className="font-display text-lg font-medium text-text">
                  {lesson.title}
                </p>
                {lesson.description && (
                  <p className="mt-1 text-sm text-text-muted">
                    {lesson.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-text-faint">
                  {total === 0
                    ? "No exercises yet"
                    : `${done} / ${total} exercises complete`}
                </p>
              </Link>
            );
          })}
          {(lessons ?? []).length === 0 && (
            <p className="text-text-muted">
              No lesson topics yet. Seed content hasn&apos;t been added.
            </p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
