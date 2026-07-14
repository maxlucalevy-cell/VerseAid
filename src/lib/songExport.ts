export function formatSongAsText(
  title: string,
  sections: { label: string; content: string }[]
): string {
  const sectionBlocks = sections.map((section) => {
    const body = section.content.trim() || "(empty)";
    return `${section.label}\n${body}`;
  });
  return `${title}\n\n${sectionBlocks.join("\n\n")}`;
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "song";
}
