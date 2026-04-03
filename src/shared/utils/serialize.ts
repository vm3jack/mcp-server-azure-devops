import { encode } from '@toon-format/toon';

/**
 * Removes null and undefined values from an object recursively,
 * then serializes using TOON (Token-Oriented Object Notation) to minimize token usage.
 * TOON reduces tokens by 40-50% for uniform arrays (list_* responses) vs JSON.
 * Falls back to compact JSON for non-serializable data.
 */
export function serialize(data: unknown): string {
  const cleaned = JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value === null || value === undefined) return undefined;
      return value;
    }),
  );
  try {
    return encode(cleaned);
  } catch {
    return JSON.stringify(cleaned);
  }
}
