"use client";

/** A prediction the visitor created, remembered in this browser only. */
export interface MineEntry {
  slug: string;
  prediction: string;
  token: string;
  ts: number;
}

const KEY = "pmw:mine";

export function readMine(): MineEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as MineEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function rememberMine(entry: MineEntry): void {
  try {
    const all = readMine().filter((e) => e.slug !== entry.slug);
    all.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200)));
  } catch {
    // ignore
  }
}

export function forgetMine(slug: string): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(readMine().filter((e) => e.slug !== slug)),
    );
  } catch {
    // ignore
  }
}
