import type { ClicheFlag } from "@/lib/types";
import type { AnalyzableSection } from "./repetition";

// Curated list of stock songwriting phrases. Each pattern allows minor
// variation (inflection, an intervening word or two) so "broke my heart"
// and "breaking hearts" both match "broken heart". Detection is purely
// deterministic — flagging a phrase is awareness, never a verdict; plenty
// of great songs lean into familiar phrases on purpose.
type ClicheEntry = { phrase: string; pattern: RegExp };

const CLICHES: ClicheEntry[] = [
  { phrase: "broken heart", pattern: /\b(?:break(?:s|ing)?|broke|broken)\s+(?:\w+\s+)?hearts?\b/gi },
  { phrase: "shining star", pattern: /\bshin(?:ing|e|es)\s+(?:\w+\s+)?stars?\b/gi },
  { phrase: "tears fall like rain", pattern: /\btears?\s+(?:\w+\s+)?(?:fall(?:s|ing)?\s+)?like\s+(?:the\s+)?rain\b/gi },
  { phrase: "burning like fire", pattern: /\bburn(?:s|ing)?\s+(?:\w+\s+)?like\s+(?:a\s+|the\s+)?fire\b/gi },
  { phrase: "you complete me", pattern: /\byou\s+complete\s+me\b/gi },
  { phrase: "heart of gold", pattern: /\bhearts?\s+of\s+gold\b/gi },
  { phrase: "light of my life", pattern: /\blight\s+(?:of|up)\s+my\s+life\b/gi },
  { phrase: "take my breath away", pattern: /\btak(?:e|es|ing)\s+my\s+breath\s+away\b/gi },
  { phrase: "head over heels", pattern: /\bhead\s+over\s+heels\b/gi },
  { phrase: "love is blind", pattern: /\blove\s+is\s+blind\b/gi },
  { phrase: "more than words can say", pattern: /\bmore\s+than\s+words\s+(?:can|could)\s+(?:ever\s+)?say\b/gi },
  { phrase: "hold me tight", pattern: /\bhold\s+(?:me|you)\s+tight\b/gi },
  { phrase: "through thick and thin", pattern: /\bthrough\s+thick\s+and\s+thin\b/gi },
  { phrase: "till the end of time", pattern: /\b(?:till|til|until)\s+the\s+end\s+of\s+time\b/gi },
  { phrase: "my one and only", pattern: /\bmy\s+one\s+and\s+only\b/gi },
  { phrase: "angel in disguise", pattern: /\bangel\s+in\s+disguise\b/gi },
  { phrase: "free as a bird", pattern: /\b(?:free|fly(?:ing)?)\s+(?:as|like)\s+a\s+bird\b/gi },
  { phrase: "dancing in the rain", pattern: /\bdanc(?:e|es|ing)\s+in\s+the\s+rain\b/gi },
  { phrase: "heart on my sleeve", pattern: /\bhearts?\s+on\s+(?:my|your)\s+sleeves?\b/gi },
  { phrase: "moth to a flame", pattern: /\bmoth\s+to\s+(?:a|the)\s+flame\b/gi },
  { phrase: "ships in the night", pattern: /\bships?\s+(?:passing\s+)?in\s+the\s+night\b/gi },
  { phrase: "stars align", pattern: /\bstars\s+(?:align(?:ed|ing)?|aligned)\b/gi },
  { phrase: "against all odds", pattern: /\bagainst\s+all\s+(?:the\s+)?odds\b/gi },
  { phrase: "meant to be", pattern: /\bmeant\s+to\s+be\b/gi },
  { phrase: "soul on fire", pattern: /\bsouls?\s+(?:is\s+|was\s+)?on\s+fire\b/gi },
  { phrase: "empty inside", pattern: /\b(?:empty|dead|hollow)\s+inside\b/gi },
  { phrase: "piece of my heart", pattern: /\bpieces?\s+of\s+my\s+heart\b/gi },
  { phrase: "to the moon and back", pattern: /\bto\s+the\s+moon\s+and\s+back\b/gi },
  { phrase: "time stands still", pattern: /\btime\s+(?:stands?|stood)\s+still\b/gi },
  { phrase: "chasing dreams", pattern: /\bchas(?:e|es|ing)\s+(?:my\s+|your\s+|our\s+|their\s+)?dreams?\b/gi },
];

export function detectCliches(sections: AnalyzableSection[]): ClicheFlag[] {
  const flags: ClicheFlag[] = [];

  for (const entry of CLICHES) {
    let matchedText: string | null = null;
    let count = 0;
    const sectionLabels = new Set<string>();

    for (const section of sections) {
      const matches = section.content.match(entry.pattern);
      if (matches && matches.length > 0) {
        matchedText ??= matches[0];
        count += matches.length;
        sectionLabels.add(section.label);
      }
    }

    if (matchedText) {
      flags.push({
        phrase: entry.phrase,
        matched_text: matchedText,
        count,
        sections: [...sectionLabels],
      });
    }
  }

  return flags.sort((a, b) => b.count - a.count);
}
