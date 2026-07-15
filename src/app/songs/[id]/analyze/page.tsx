import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import AnalyzeView from "./AnalyzeView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: song } = await supabase
    .from("songs")
    .select("title")
    .eq("id", id)
    .single();

  return { title: song ? `${song.title} — Analyze` : "Analyze" };
}

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single();

  if (!song) notFound();

  const { data: sections } = await supabase
    .from("sections")
    .select("label, content")
    .eq("song_id", id)
    .order("order_index", { ascending: true });

  const { data: latestResult } = await supabase
    .from("analysis_results")
    .select("*")
    .eq("song_id", id)
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AnalyzeView
      song={song}
      sections={sections ?? []}
      initialResult={latestResult}
    />
  );
}
