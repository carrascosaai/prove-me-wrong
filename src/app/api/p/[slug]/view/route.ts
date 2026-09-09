import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    await incrementViews(slug);
  } catch {
    // best-effort; never block the page
  }
  return NextResponse.json({ ok: true });
}
