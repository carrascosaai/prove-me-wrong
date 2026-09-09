import "server-only";
import { headers } from "next/headers";
import { SITE_URL } from "./env";

/**
 * Absolute origin for the current request.
 *
 * Uses NEXT_PUBLIC_SITE_URL when set (the correct value in production).
 * Otherwise falls back to the request Host header, so local dev on any port
 * and Vercel preview deploys produce working share links with zero config.
 *
 * Only call this from dynamic routes (prediction pages, route handlers) — it
 * reads headers and would opt a static page into dynamic rendering.
 */
export async function siteUrl(): Promise<string> {
  // SITE_URL already resolves explicit env + Vercel URLs. Only fall back to
  // the request host when none of those are available (bare local dev).
  if (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL
  ) {
    return SITE_URL;
  }
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ??
        (host.startsWith("localhost") || host.startsWith("127.")
          ? "http"
          : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() unavailable (static context) — fall through
  }
  return SITE_URL;
}
