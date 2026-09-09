import { ImageResponse } from "next/og";
import { googleFont } from "@/lib/ogFont";

export const alt = "PROVE ME WRONG — Say it now. Prove it later.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const glyphs = "PROVE ME WRONG. Say it now. Prove it later.";
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
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#ffffff",
          padding: 90,
          fontFamily: fonts.length ? "Inter" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          PROVE ME WRONG<span style={{ color: "#2540ff" }}>.</span>
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 40, color: "#6b7280" }}>
          Say it now. Prove it later.
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
