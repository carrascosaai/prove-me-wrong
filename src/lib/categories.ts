export const CATEGORIES = [
  "Sports",
  "Crypto",
  "Tech",
  "Politics",
  "Economy",
  "Entertainment",
  "Science",
  "Climate",
  "Personal",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function normalizeCategory(value: string | null | undefined): Category {
  if (value && isCategory(value)) return value;
  return "Other";
}
