import { ImageResponse } from "next/og";
import { getPredictionBySlug } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { googleFont } from "@/lib/ogFont";

export const alt = "Prediction on PROVE ME WRONG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPredictionBySlug(slug);

  const raw = p?.prediction ?? "Say it now. Prove it later.";
  const text = raw.length > 200 ? raw.slice(0, 197) + "…" : raw;
  const who = p ? `@${p.username}` : "Someone";
  const when = p ? formatDate(p.created_at) : "";
  const footer = `${who} predicted this${when ? ` on ${when}` : ""}.`;
  const statusText =
    p?.status === "correct"
      ? "VERDICT: CORRECT"
      : p?.status === "wrong"
        ? "VERDICT: WRONG"
        : "ACTIVE PREDICTION";
  const statusColor =
    p?.status === "correct"
      ? "#0f9d58"
      : p?.status === "wrong"
        ? "#e5322d"
        : "#2540ff";

  const glyphs = `PROVE ME WRONG. ${statusText} ${text} ${footer}`;
  const [bold, regular] = await Promise.all([
    googleFont("Inter", 800, glyphs),
    googleFont("Inter", 400, glyphs),
  ]);
  const fonts = [
    bold && { name: "Inter", data: bold, weight: 800 as const, style: "normal" as const },
    regular && {
      name: "Inter",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
  ].filter(Boolean) as {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 800;
    style: "normal";
  }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 72,
          fontFamily: fonts.length ? "Inter" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>
            PROVE ME WRONG<span style={{ color: "#2540ff" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              color: statusColor,
              border: `2px solid ${statusColor}`,
              borderRadius: 999,
              padding: "6px 18px",
            }}
          >
            {statusText}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: text.length > 120 ? 46 : 60,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1.5,
          }}
        >
          {text}
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#6b7280" }}>
          {footer}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
