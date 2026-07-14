"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  STRUCTURE_TEMPLATES,
  type StructureTemplateName,
} from "@/lib/structureTemplates";

export async function createSong(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim() || "Untitled Song";
  const templateName = formData.get("template") as StructureTemplateName;
  const sectionLabels =
    STRUCTURE_TEMPLATES[templateName] ?? STRUCTURE_TEMPLATES.Custom;

  const { data: song, error } = await supabase
    .from("songs")
    .insert({ user_id: user.id, title, structure_template: templateName })
    .select()
    .single();

  if (error || !song) {
    throw new Error(error?.message ?? "Failed to create song");
  }

  const sectionsToInsert = sectionLabels.map((label, index) => ({
    song_id: song.id,
    order_index: index,
    label,
    content: "",
  }));

  const { error: sectionsError } = await supabase
    .from("sections")
    .insert(sectionsToInsert);

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  redirect(`/songs/${song.id}`);
}

export async function createSongFromInspiration(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim() || "Untitled Song";
  const templateName = formData.get("template") as StructureTemplateName;
  const mood = (formData.get("mood") as string)?.trim();
  const style = (formData.get("style") as string)?.trim();
  const angle = (formData.get("angle") as string)?.trim();
  const pov = (formData.get("pov") as string)?.trim();
  const openingLine = (formData.get("openingLine") as string)?.trim();

  const sectionLabels =
    STRUCTURE_TEMPLATES[templateName] ?? STRUCTURE_TEMPLATES.Custom;

  const { data: song, error } = await supabase
    .from("songs")
    .insert({
      user_id: user.id,
      title,
      structure_template: templateName,
      mood_tags: mood ? [mood] : [],
      genre_tags: style ? [style] : [],
      inspiration_angle: angle || null,
      inspiration_pov: pov || null,
    })
    .select()
    .single();

  if (error || !song) {
    throw new Error(error?.message ?? "Failed to create song");
  }

  const sectionsToInsert = sectionLabels.map((label, index) => ({
    song_id: song.id,
    order_index: index,
    label,
    content: index === 0 ? openingLine || "" : "",
  }));

  const { error: sectionsError } = await supabase
    .from("sections")
    .insert(sectionsToInsert);

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  redirect(`/songs/${song.id}`);
}

export async function deleteSong(songId: string) {
  const supabase = await createClient();
  await supabase.from("songs").delete().eq("id", songId);
  redirect("/dashboard");
}
