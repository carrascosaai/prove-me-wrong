import type { MetadataRoute } from "next";
import { listPredictions } from "@/lib/db";
import { RANKINGS } from "@/lib/rankings";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/feed",
    "/rankings",
    "/create",
    "/sponsors",
    "/legal/terms",
    "/legal/privacy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  const rankingRoutes: MetadataRoute.Sitemap = RANKINGS.map((r) => ({
    url: `${SITE_URL}/rankings/${r.type}`,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  let predictionRoutes: MetadataRoute.Sitemap = [];
  try {
    const items = await listPredictions({ limit: 500, status: "all" });
    predictionRoutes = items.map((p) => ({
      url: `${SITE_URL}/p/${p.slug}`,
      lastModified: p.resolved_at ?? p.created_at,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // ignore when DB unavailable at build
  }

  return [...staticRoutes, ...rankingRoutes, ...predictionRoutes];
}
