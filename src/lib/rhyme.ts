export function extractEndWord(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const words = trimmed.split(/\s+/);
  const last = words[words.length - 1];
  const cleaned = last.toLowerCase().replace(/[^a-z']/g, "");
  return cleaned || null;
}

async function fetchRhymeSet(word: string): Promise<Set<string>> {
  try {
    const res = await fetch(`/api/rhymes?word=${encodeURIComponent(word)}`);
    if (!res.ok) return new Set();
    const data = (await res.json()) as { rhymes: string[] };
    return new Set(data.rhymes);
  } catch {
    return new Set();
  }
}

/** Groups line-ending words by rhyme sound, returning a scheme string like "AABB". */
export async function computeRhymeScheme(lines: string[]): Promise<string> {
  const endWords = lines
    .map(extractEndWord)
    .filter((w): w is string => w !== null);

  if (endWords.length === 0) return "";

  const uniqueWords = Array.from(new Set(endWords));
  const rhymeSets = new Map<string, Set<string>>();
  await Promise.all(
    uniqueWords.map(async (word) => {
      rhymeSets.set(word, await fetchRhymeSet(word));
    })
  );

  const groups: { anchor: string; letter: string }[] = [];
  const letters: string[] = [];

  for (const word of endWords) {
    const match = groups.find(
      (g) =>
        g.anchor === word ||
        rhymeSets.get(g.anchor)?.has(word) ||
        rhymeSets.get(word)?.has(g.anchor)
    );
    if (match) {
      letters.push(match.letter);
    } else {
      const nextLetter = String.fromCharCode(65 + groups.length);
      groups.push({ anchor: word, letter: nextLetter });
      letters.push(nextLetter);
    }
  }

  return letters.join("");
}
