/**
 * Removes null and undefined values from an object recursively,
 * then serializes to compact JSON to minimize token usage.
 */
export function serialize(data: unknown): string {
  return JSON.stringify(data, (_, value) => {
    if (value === null || value === undefined) return undefined;
    return value;
  });
}
