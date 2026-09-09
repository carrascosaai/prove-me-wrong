import "server-only";

type FontWeight = 400 | 700 | 800;

const cache = new Map<string, ArrayBuffer | null>();

/**
 * Fetch a Google font as a TTF usable by Satori / next/og.
 * The css2 endpoint serves TTF (not woff2) to clients without a modern
 * User-Agent, which a server-side fetch is. Returns null on any failure so
 * the caller can fall back to Satori's built-in font.
 */
export async function googleFont(
  family: string,
  weight: FontWeight,
  text: string,
): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}:${text}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    )}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }).then((r) => r.text());
    const src = css.match(
      /src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/,
    );
    if (!src) throw new Error("no ttf in css");
    const font = await fetch(src[1]).then((r) => r.arrayBuffer());
    cache.set(key, font);
    return font;
  } catch {
    cache.set(key, null);
    return null;
  }
}
