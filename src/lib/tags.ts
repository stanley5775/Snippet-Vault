export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  for (const raw of tags) {
    const tag = raw.trim().replace(/^#+/, '').toLowerCase().replace(/\s+/g, '-');
    if (tag) seen.add(tag);
  }
  return [...seen];
}
