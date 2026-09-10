import { NextResponse } from "next/server";
import { trackHit } from "@/lib/db";

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
  let path = "/";
  let referrer: string | null = null;
  try {
    const body = (await req.json()) as { path?: string; referrer?: string };
    path = (body.path || "/").slice(0, 200);
    referrer = body.referrer || null;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // collapse dynamic segments so paths group nicely
  path = path
    .replace(/^\/p\/[^/]+\/manage.*/, "/p/[slug]/manage")
    .replace(/^\/p\/[^/]+.*/, "/p/[slug]")
    .replace(/^\/rankings\/[^/]+/, "/rankings/[type]")
    .split("?")[0];

  const ownHost = req.headers.get("host")?.split(":")[0] ?? "";
  try {
    await trackHit(path, referrerLabel(referrer, ownHost));
  } catch {
    // analytics must never break a page
  }
  return NextResponse.json({ ok: true });
}
