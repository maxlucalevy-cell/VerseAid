import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

export async function POST(request: Request) {
  let body: { phrase?: string; line?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phrase = body.phrase?.trim();
  const line = body.line?.trim();
  if (!phrase) {
    return NextResponse.json({ error: "phrase is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Alternative suggestions aren't configured yet — add ANTHROPIC_API_KEY to your environment.",
      },
      { status: 500 }
    );
  }

  const lineContext = line ? ` It appears in the line: "${line}".` : "";

  const prompt = `You are a songwriting coach. A songwriter's lyric uses the phrase "${phrase}", which appears very often in songwriting.${lineContext}

Offer exactly ONE rough alternative phrasing — an unpolished starting point that conveys a similar feeling through a more specific or surprising image. It should read like a sketch the writer will rework in their own voice, never a finished, polished line. Do not explain or add commentary.

Respond with ONLY the alternative phrasing as plain text.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${text}`);
    }

    const data = await res.json();
    const alternative: string = (data.content?.[0]?.text ?? "")
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!alternative) {
      throw new Error("No suggestion generated — try again.");
    }

    return NextResponse.json({ alternative });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
