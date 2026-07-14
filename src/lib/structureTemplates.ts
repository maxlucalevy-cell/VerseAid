export const STRUCTURE_TEMPLATES = {
  "Pop (Verse-Chorus)": [
    "Verse 1",
    "Chorus",
    "Verse 2",
    "Chorus",
    "Bridge",
    "Chorus",
  ],
  "Folk/Ballad": ["Verse 1", "Verse 2", "Verse 3", "Verse 4"],
  Custom: ["Verse 1"],
} as const;

export type StructureTemplateName = keyof typeof STRUCTURE_TEMPLATES;

export const STRUCTURE_TEMPLATE_NAMES = Object.keys(
  STRUCTURE_TEMPLATES
) as StructureTemplateName[];
