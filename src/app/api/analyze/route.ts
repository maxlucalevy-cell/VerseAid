import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  detectRepeatedLines,
  detectRepeatedWords,
  type AnalyzableSection,
} from "@/lib/analysis/repetition";
import { detectCliches } from "@/lib/analysis/cliches";
import type { CraftAnalysis, RepetitionClicheAnalysis } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

async function generateCraftAnalysis(
  title: string,
  sections: AnalyzableSection[]
): Promise<CraftAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Craft Analysis isn't configured yet. Add ANTHROPIC_API_KEY to your environment."
    );
  }

  const lyrics = sections
    .map((s) => `[${s.label}]\n${s.content || "(empty)"}`)
    .join("\n\n");

  const prompt = `You are a songwriting coach reviewing a beginner's song. You never rewrite lyrics and never prescribe fixes. You surface strengths and observations, always leaving every decision to the writer.

Song title: "${title}"

Lyrics by section:
${lyrics}

Respond with ONLY a JSON object, no markdown, no code fences:
{"strengths": ["...", "..."], "observations": ["...", "..."]}

Give 3-5 strengths and 3-5 observations, each one short sentence. Each strength names something specific working well (an image, a structural choice, a rhyme, the voice). Each observation points to something worth the writer's attention, framed as awareness rather than correction: "worth checking whether X lands the way you intend", never "you should change X". No scores, no grades.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "{}";
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return {
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.filter((s: unknown): s is string => typeof s === "string")
      : [],
    observations: Array.isArray(parsed.observations)
      ? parsed.observations.filter((s: unknown): s is string => typeof s === "string")
      : [],
  };
}

export async function POST(request: Request) {
  let body: { songId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const songId = body.songId;
  if (!songId) {
    return NextResponse.json({ error: "songId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // RLS scopes both queries to the signed-in user's songs.
  const { data: song } = await supabase
    .from("songs")
    .select("id, title")
    .eq("id", songId)
    .single();
  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  const { data: sections } = await supabase
    .from("sections")
    .select("label, content")
    .eq("song_id", songId)
    .order("order_index", { ascending: true });

  const analyzable: AnalyzableSection[] = sections ?? [];

  const repetitionCliche: RepetitionClicheAnalysis = {
    repeated_words: detectRepeatedWords(analyzable),
    repeated_lines: detectRepeatedLines(analyzable),
    cliches: detectCliches(analyzable),
  };

  // The repetition/cliché report is deterministic and always produced; a
  // Craft Analysis failure (missing key, API hiccup) shouldn't discard it.
  let craft: CraftAnalysis | null = null;
  let craftError: string | null = null;
  try {
    craft = await generateCraftAnalysis(song.title, analyzable);
  } catch (error) {
    craftError = error instanceof Error ? error.message : "Unknown error";
  }

  const { data: result, error: insertError } = await supabase
    .from("analysis_results")
    .insert({
      song_id: songId,
      craft_analysis: craft,
      repetition_cliche_analysis: repetitionCliche,
      analyzed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (insertError || !result) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save analysis" },
      { status: 500 }
    );
  }

  return NextResponse.json({ result, craftError });
}
