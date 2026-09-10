import { NextResponse } from "next/server";
import { incrementViews, trackHit } from "@/lib/db";

/** Referrer → a short, groupable label (t.co, x.com, google.com, direct…). */
function referrerLabel(raw: string | null, ownHost: string): string {
  if (!raw) return "direct";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (!host || host === ownHost) return "direct";
    return host;
  } catch {
    return "direct";
  }
}

export async function POST(req: Request) {
  let rawPath = "/";
  let referrer: string | null = null;
  try {
    const body = (await req.json()) as { path?: string; referrer?: string };
    rawPath = (body.path || "/").split("?")[0].slice(0, 200);
    referrer = body.referrer || null;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // bump the per-prediction view counter for /p/<slug> (not the manage page)
  const slugMatch = rawPath.match(/^\/p\/([a-z0-9]{4,32})$/);

  // collapse dynamic segments so analytics paths group nicely
  const path = rawPath
    .replace(/^\/p\/[^/]+\/manage.*/, "/p/[slug]/manage")
    .replace(/^\/p\/[^/]+.*/, "/p/[slug]")
    .replace(/^\/rankings\/[^/]+/, "/rankings/[type]");

  const ownHost = req.headers.get("host")?.split(":")[0] ?? "";
  try {
    await Promise.all([
      trackHit(path, referrerLabel(referrer, ownHost)),
      slugMatch ? incrementViews(slugMatch[1]) : Promise.resolve(),
    ]);
  } catch {
    // analytics must never break a page
  }
  return NextResponse.json({ ok: true });
}
