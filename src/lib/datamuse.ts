type DatamuseWord = { word: string };

async function fetchDatamuseRhymes(
  word: string,
  rel: "rel_rhy" | "rel_nry"
): Promise<string[]> {
  const res = await fetch(
    `https://api.datamuse.com/words?${rel}=${encodeURIComponent(word)}&max=50`
  );
  if (!res.ok) return [];
  const data = (await res.json()) as DatamuseWord[];
  return data.map((entry) => entry.word.toLowerCase());
}

export async function getRhymeSet(word: string): Promise<Set<string>> {
  let rhymes = await fetchDatamuseRhymes(word, "rel_rhy");
  if (rhymes.length === 0) {
    rhymes = await fetchDatamuseRhymes(word, "rel_nry");
  }
  return new Set(rhymes);
}
