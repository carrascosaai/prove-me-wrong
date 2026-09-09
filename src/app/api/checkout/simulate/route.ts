import { NextResponse } from "next/server";
import { markPredictionPro } from "@/lib/db";
import { STRIPE_LIVE } from "@/lib/env";

export async function POST(req: Request) {
  // Only allowed while real payments are off — prevents free upgrades in prod.
  if (STRIPE_LIVE) {
    return NextResponse.json(
      { error: "Simulation disabled while payments are live" },
      { status: 403 },
    );
  }
  let slug = "";
  try {
    const body = (await req.json()) as { slug?: string };
    slug = String(body.slug ?? "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  await markPredictionPro(slug);
  return NextResponse.json({ ok: true });
}
