import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import ReadView from "./ReadView";

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

  return { title: song ? `${song.title} | Read View` : "Read View" };
}

export default async function ReadViewPage({
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
    .select("*")
    .eq("song_id", id)
    .order("order_index", { ascending: true });

  return <ReadView song={song} sections={sections ?? []} />;
}
