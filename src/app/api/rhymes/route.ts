import { NextResponse } from "next/server";
import { getRhymeSet } from "@/lib/datamuse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word")?.trim().toLowerCase();

  if (!word) {
    return NextResponse.json({ error: "Missing word" }, { status: 400 });
  }

  const rhymeSet = await getRhymeSet(word);
  return NextResponse.json({ word, rhymes: Array.from(rhymeSet) });
}
