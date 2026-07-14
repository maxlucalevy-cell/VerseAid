import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import SongEditor from "./SongEditor";

export default async function SongEditorPage({
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

  return <SongEditor song={song} initialSections={sections ?? []} />;
}
