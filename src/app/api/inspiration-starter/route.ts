import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

type InspirationResult = {
  angle: string;
  openingLine: string;
  pov: string;
};

async function generateInspiration(
  topic: string,
  mood: string,
  style: string
): Promise<InspirationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Inspiration Starter isn't configured yet — add ANTHROPIC_API_KEY to your environment."
    );
  }

  const prompt = `You are a songwriting coach, not a ghostwriter. You never write a finished or near-finished song — only a small spark the songwriter builds from themselves. Given a topic, mood, and style, produce ONLY three things:

1. A single sentence describing a creative angle or theme for the song (a concept, not lyrics).
2. Exactly ONE sample opening line for Verse 1. Just one line — never a full verse, never more than one line, never a chorus or any other section.
3. A suggested narrator archetype and point of view (e.g. "direct address to a specific person", "storyteller observing from a distance", "internal monologue to oneself").

Topic: "${topic}"
Mood: ${mood}
Style: ${style}

Respond with ONLY a JSON object of the form {"angle": "...", "openingLine": "...", "pov": "..."}, no other text, no markdown formatting, no code fences.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Couldn't parse a response — try again.");
  }

  const obj = parsed as Record<string, unknown>;
  return {
    angle: typeof obj.angle === "string" ? obj.angle : "",
    openingLine: typeof obj.openingLine === "string" ? obj.openingLine : "",
    pov: typeof obj.pov === "string" ? obj.pov : "",
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rate = checkRateLimit(
    `inspiration-starter:${user.id}`,
    8,
    60 * 60 * 1000
  );
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          "You've hit the hourly limit for Inspiration Starter regenerations. Try again later, or just create the song and write it yourself from here.",
      },
      { status: 429 }
    );
  }

  let body: { topic?: string; mood?: string; style?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  const mood = body.mood?.trim();
  const style = body.style?.trim();

  if (!topic || !mood || !style) {
    return NextResponse.json(
      { error: "topic, mood, and style are required" },
      { status: 400 }
    );
  }

  try {
    const result = await generateInspiration(topic, mood, style);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
