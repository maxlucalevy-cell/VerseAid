function countWordSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z']/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  let normalized = cleaned.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  normalized = normalized.replace(/^y/, "");

  const vowelGroups = normalized.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? vowelGroups.length : 1;
}

export function countLineSyllables(line: string): number {
  const words = line.trim().split(/\s+/).filter(Boolean);
  return words.reduce((total, word) => total + countWordSyllables(word), 0);
}
