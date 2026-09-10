function get(key: string): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

/**
 * Canonical site origin, resolved at build/start time.
 * Priority: explicit env → Vercel production URL → Vercel deployment URL →
 * localhost. So on Vercel it is correct with zero configuration; set
 * NEXT_PUBLIC_SITE_URL only to pin a custom domain.
 */
function resolveSiteUrl(): string {
  const explicit = get("NEXT_PUBLIC_SITE_URL");
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelProd = get("VERCEL_PROJECT_PRODUCTION_URL");
  if (vercelProd) return `https://${vercelProd}`;
  const vercelUrl = get("VERCEL_URL");
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SUPABASE_URL = get("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = get("SUPABASE_SERVICE_ROLE_KEY");

/** True when a real database is configured. Otherwise the app uses an
 *  in-memory demo store so the UI is still fully browsable. */
export const HAS_DB = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const HAS_DB_WRITE = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY,
);

export const ADSENSE_CLIENT = get("NEXT_PUBLIC_ADSENSE_CLIENT");
export const ADMIN_SECRET = get("ADMIN_SECRET");
