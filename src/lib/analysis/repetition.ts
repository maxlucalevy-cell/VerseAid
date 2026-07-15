import type { RepeatedLineFlag, RepeatedWordFlag } from "@/lib/types";

export type AnalyzableSection = { label: string; content: string };

// Chorus/hook/refrain sections repeat by design, so they're excluded from
// repetition counts — flagging intentional repetition would just be noise.
const CHORUS_LIKE = /chorus|hook|refrain/i;

export function isChorusLike(label: string): boolean {
  return CHORUS_LIKE.test(label);
}

// Function words that repeat naturally in any lyric and carry no imagery of
// their own. Repetition of these is never worth surfacing.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "nor", "so", "yet", "if", "then",
  "than", "as", "at", "by", "for", "from", "in", "into", "of", "off", "on",
  "onto", "out", "over", "to", "up", "with", "without", "about", "against",
  "between", "through", "under", "after", "before", "down", "during",
  "i", "me", "my", "mine", "myself", "we", "us", "our", "ours", "you",
  "your", "yours", "he", "him", "his", "she", "her", "hers", "it", "its",
  "they", "them", "their", "theirs", "this", "that", "these", "those",
  "who", "whom", "whose", "which", "what", "where", "when", "why", "how",
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "having", "do", "does", "did", "doing", "will", "would", "shall",
  "should", "can", "could", "may", "might", "must", "ought",
  "not", "no", "yes", "all", "any", "both", "each", "few", "more", "most",
  "some", "such", "only", "just", "too", "very", "now", "here", "there",
  "again", "once", "ever", "never", "always", "still",
  "oh", "ooh", "yeah", "hey", "la", "na", "mmm", "whoa", "uh",
  "i'm", "i'll", "i've", "i'd", "you're", "you'll", "you've", "you'd",
  "he's", "she's", "it's", "we're", "we'll", "we've", "they're", "they've",
  "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't",
  "shouldn't", "isn't", "aren't", "wasn't", "weren't", "ain't", "gonna",
  "gotta", "wanna", "cause", "'cause", "em", "'em",
]);

function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .match(/[a-z]+(?:'[a-z]+)?/g) ?? []
  );
}

export function detectRepeatedWords(
  sections: AnalyzableSection[],
  threshold = 4
): RepeatedWordFlag[] {
  const counts = new Map<string, { count: number; sections: Set<string> }>();

  for (const section of sections) {
    const inChorus = isChorusLike(section.label);
    for (const word of tokenize(section.content)) {
      if (word.length < 3 || STOPWORDS.has(word)) continue;
      let entry = counts.get(word);
      if (!entry) {
        entry = { count: 0, sections: new Set() };
        counts.set(word, entry);
      }
      // Every section is listed so the writer can see the word's full spread,
      // but only non-chorus occurrences count toward the threshold.
      entry.sections.add(section.label);
      if (!inChorus) entry.count += 1;
    }
  }

  return [...counts.entries()]
    .filter(([, entry]) => entry.count >= threshold)
    .map(([word, entry]) => ({
      word,
      count: entry.count,
      sections: [...entry.sections],
    }))
    .sort((a, b) => b.count - a.count);
}

function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectRepeatedLines(
  sections: AnalyzableSection[],
  minCount = 2
): RepeatedLineFlag[] {
  const lines = new Map<
    string,
    { display: string; count: number; sections: Set<string> }
  >();

  for (const section of sections) {
    if (isChorusLike(section.label)) continue;
    for (const raw of section.content.split("\n")) {
      const normalized = normalizeLine(raw);
      // Short interjection lines ("oh yeah") repeat naturally; only flag
      // lines substantial enough that repetition is likely accidental.
      if (normalized.split(" ").length < 3) continue;
      let entry = lines.get(normalized);
      if (!entry) {
        entry = { display: raw.trim(), count: 0, sections: new Set() };
        lines.set(normalized, entry);
      }
      entry.count += 1;
      entry.sections.add(section.label);
    }
  }

  return [...lines.values()]
    .filter((entry) => entry.count >= minCount)
    .map((entry) => ({
      line: entry.display,
      count: entry.count,
      sections: [...entry.sections],
    }))
    .sort((a, b) => b.count - a.count);
}
