import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lessons</h1>
        <Link href="/dashboard" className="text-sm text-neutral-500 underline">
          Back to Library
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {(lessons ?? []).map((lesson) => {
          const ids = exercisesByLesson.get(lesson.id) ?? [];
          const total = ids.length;
          const done = ids.filter((id) => completedIds.has(id)).length;
          return (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400"
            >
              <p className="text-lg font-medium">{lesson.title}</p>
              {lesson.description && (
                <p className="mt-1 text-sm text-neutral-500">
                  {lesson.description}
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-400">
                {total === 0
                  ? "No exercises yet"
                  : `${done} / ${total} exercises complete`}
              </p>
            </Link>
          );
        })}
        {(lessons ?? []).length === 0 && (
          <p className="text-neutral-500">
            No lesson topics yet — seed content hasn&apos;t been added.
          </p>
        )}
      </div>
    </main>
  );
}
