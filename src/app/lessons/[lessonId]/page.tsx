import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import LessonRunner from "./LessonRunner";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: exercises } = await supabase
    .from("lesson_exercises")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const { data: progress } =
    exerciseIds.length > 0
      ? await supabase
          .from("lesson_exercise_progress")
          .select("*")
          .eq("user_id", user.id)
          .in("exercise_id", exerciseIds)
      : { data: [] };

  return (
    <LessonRunner
      lesson={lesson}
      exercises={exercises ?? []}
      initialProgress={progress ?? []}
    />
  );
}
