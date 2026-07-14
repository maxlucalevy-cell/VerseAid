type WritingTip = { title: string; tip: string };

const TIP_RULES: { pattern: RegExp; tip: WritingTip }[] = [
  {
    pattern: /pre[\s-]?chorus/i,
    tip: {
      title: "Pre-Chorus",
      tip: "Build tension here. A shift in rhythm, a question left unanswered, or a rising phrase can make the chorus land harder when it finally arrives.",
    },
  },
  {
    pattern: /chorus|hook|refrain/i,
    tip: {
      title: "Chorus / Hook",
      tip: "This is the part listeners remember most. Favor simple, repeatable phrasing that says the song's core idea in as few words as possible — this isn't the place for your most complex line.",
    },
  },
  {
    pattern: /verse/i,
    tip: {
      title: "Verse",
      tip: "Verses carry the story forward. Use concrete, specific details here so the chorus's bigger emotional statement has something real to land on.",
    },
  },
  {
    pattern: /bridge/i,
    tip: {
      title: "Bridge",
      tip: "The bridge should contrast with everything before it — a new angle, a shift in perspective, or the emotional peak the rest of the song hasn't shown yet.",
    },
  },
  {
    pattern: /intro/i,
    tip: {
      title: "Intro",
      tip: "Set the tone without giving away the payoff. Many listeners decide whether to keep listening in the first few seconds.",
    },
  },
  {
    pattern: /outro|tag/i,
    tip: {
      title: "Outro",
      tip: "Give the song a sense of resolution, or let it trail off deliberately. Repeating the hook here can help cement it in the listener's memory.",
    },
  },
];

const DEFAULT_TIP: WritingTip = {
  title: "Section",
  tip: "Every section should earn its place. Ask what job this section does that the others don't — a new detail, a shift in energy, or a different point of view.",
};

export function getWritingTip(label: string): WritingTip {
  const match = TIP_RULES.find((rule) => rule.pattern.test(label));
  return match ? match.tip : DEFAULT_TIP;
}
