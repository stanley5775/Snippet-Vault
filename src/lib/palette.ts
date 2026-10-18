const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Returns the valid hex colors from a JSON array, or null if it isn't a JSON array. */
export function parsePalette(content: string): string[] | null {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return null;
  }
  if (!Array.isArray(data)) return null;
  return data
    .filter((c): c is string => typeof c === 'string' && HEX.test(c.trim()))
    .map((c) => c.trim());
}
