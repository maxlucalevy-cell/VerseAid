import { NextResponse } from "next/server";
import { getRhymeSet } from "@/lib/datamuse";
import { extractEndWord } from "@/lib/rhyme";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

async function generateContinuations(
  previousLine: string,
  targetRhymeWord: string | null,
  avoid: string[]
): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Line Sparks isn't configured yet — add ANTHROPIC_API_KEY to your environment."
    );
  }

  const rhymeInstruction = targetRhymeWord
    ? `The last word of each continuation must rhyme with "${targetRhymeWord}" (a near-rhyme is fine). Prioritize natural, conversational phrasing over forcing the rhyme.`
    : "";

  const avoidInstruction =
    avoid.length > 0
      ? `Do not reuse these previously suggested lines: ${avoid
          .map((l) => `"${l}"`)
          .join(", ")}.`
      : "";

  const prompt = `You are a songwriting coach helping a beginner continue a lyric line. You never write a finished, polished line — only rough, unfinished starting points the songwriter can rework in their own voice.

Previous line: "${previousLine}"

Generate exactly 4 short, rough single-line continuations that could follow this line in a song. ${rhymeInstruction} ${avoidInstruction}

Respond with ONLY a JSON array of 4 strings, no other text, no markdown formatting, no code fences.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "[]";
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  let body: { previousLine?: string; matchRhyme?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const previousLine = body.previousLine?.trim();
  const matchRhyme = Boolean(body.matchRhyme);

  if (!previousLine) {
    return NextResponse.json(
      { error: "previousLine is required" },
      { status: 400 }
    );
  }

  const targetRhymeWord = matchRhyme ? extractEndWord(previousLine) : null;

  try {
    const candidates = await generateContinuations(
      previousLine,
      targetRhymeWord,
      []
    );

    let rhymeSet: Set<string> | null = null;
    if (targetRhymeWord) {
      try {
        rhymeSet = await getRhymeSet(targetRhymeWord);
      } catch {
        rhymeSet = null; // Datamuse hiccup — skip validation rather than fail the request.
      }
    }

    const validate = (line: string) => {
      if (!rhymeSet) return true;
      const endWord = extractEndWord(line);
      return !!endWord && (endWord === targetRhymeWord || rhymeSet.has(endWord));
    };

    let valid = candidates.filter(validate);

    if (valid.length < 2) {
      const retryCandidates = await generateContinuations(
        previousLine,
        targetRhymeWord,
        candidates
      );
      valid = [...valid, ...retryCandidates.filter(validate)];
    }

    const options = (valid.length > 0 ? valid : candidates).slice(0, 3);

    return NextResponse.json({ options });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
