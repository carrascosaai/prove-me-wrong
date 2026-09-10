/**
 * Minimal content guard. Not a profanity filter — a hot-takes site tolerates
 * "damn" and "shit". This blocks only unambiguous slurs and a honeypot.
 * Keep the list short and specific; expand only for real incidents.
 */

const BLOCKED = [
  // racial / ethnic slurs
  "nigger",
  "nigga",
  "chink",
  "spic",
  "kike",
  "gook",
  "wetback",
  "coon",
  // anti-LGBT slurs
  "faggot",
  "faggy",
  "tranny",
  "dyke",
  // ableist slur
  "retard",
];

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]/g, ""); // collapse separators / leet padding
}

export function containsBlockedTerm(
  ...parts: (string | null | undefined)[]
): boolean {
  const hay = normalize(parts.filter(Boolean).join(" "));
  return BLOCKED.some((term) => hay.includes(term));
}

/** True when a hidden honeypot field was filled — i.e. it's a bot. */
export function isBot(honeypot: FormDataEntryValue | null): boolean {
  return typeof honeypot === "string" && honeypot.trim().length > 0;
}
