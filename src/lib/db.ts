import "server-only";
import { createHash } from "crypto";
import { HAS_DB, HAS_DB_WRITE } from "./env";
import { supabaseAdmin, supabaseRead } from "./supabase";
import { demo } from "./demoStore";
import { newSlug, newToken } from "./slug";
import { normalizeCategory } from "./categories";
import type {
  Comment,
  Prediction,
  PredictionStatus,
  PredictionWithToken,
  RankingType,
  UserStat,
} from "./types";

const PUBLIC_COLUMNS =
  "id,slug,prediction,category,resolution_date,evidence_url,username,confidence,status,is_pro,is_sponsored,sponsor_name,views,agree_count,doubt_count,created_at,resolved_at";

export function voterHash(ip: string, ua: string): string {
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 32);
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function strip(p: PredictionWithToken): Prediction {
  const { manage_token, ...rest } = p;
  void manage_token;
  return rest;
}

export interface CreateInput {
  prediction: string;
  category: string;
  resolution_date: string;
  evidence_url?: string | null;
  username: string;
  confidence: number;
}

export interface ListOptions {
  sort?: "new" | "popular" | "soon" | "confident";
  category?: string | null;
  status?: PredictionStatus | "all";
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export async function listPredictions(
  opts: ListOptions = {},
): Promise<Prediction[]> {
  const { sort = "new", category = null, status = "all", limit = 30 } = opts;

  if (HAS_DB) {
    let q = supabaseRead().from("pmw_predictions").select(PUBLIC_COLUMNS);
    if (category) q = q.eq("category", category);
    if (status !== "all") q = q.eq("status", status);
    if (sort === "soon") {
      q = q.eq("status", "active").gte("resolution_date", new Date().toISOString());
      q = q.order("resolution_date", { ascending: true });
    } else if (sort === "popular") {
      q = q.order("views", { ascending: false });
    } else if (sort === "confident") {
      q = q.order("confidence", { ascending: false });
    } else {
      q = q.order("created_at", { ascending: false });
    }
    const { data, error } = await q.limit(limit);
    if (error) {
      console.error("listPredictions:", error.message);
      return [];
    }
    return (data ?? []) as Prediction[];
  }

  let items = demo().predictions.map(strip);
  if (category) items = items.filter((p) => p.category === category);
  if (status !== "all") items = items.filter((p) => p.status === status);
  if (sort === "soon") {
    const now = Date.now();
    items = items
      .filter((p) => p.status === "active" && new Date(p.resolution_date).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.resolution_date).getTime() -
          new Date(b.resolution_date).getTime(),
      );
  } else if (sort === "popular") {
    items = items.sort((a, b) => b.views - a.views);
  } else if (sort === "confident") {
    items = items.sort((a, b) => b.confidence - a.confidence);
  } else {
    items = items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return items.slice(0, limit);
}

export async function getPredictionBySlug(
  slug: string,
): Promise<Prediction | null> {
  if (HAS_DB) {
    const { data, error } = await supabaseRead()
      .from("pmw_predictions")
      .select(PUBLIC_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      console.error("getPredictionBySlug:", error.message);
      return null;
    }
    return (data as Prediction) ?? null;
  }
  return demo().predictions.map(strip).find((p) => p.slug === slug) ?? null;
}

export async function listCommentsByPredictionId(
  predictionId: string,
): Promise<Comment[]> {
  if (HAS_DB) {
    const { data, error } = await supabaseRead()
      .from("pmw_comments")
      .select("*")
      .eq("prediction_id", predictionId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("listComments:", error.message);
      return [];
    }
    return (data ?? []) as Comment[];
  }
  return demo()
    .comments.filter((c) => c.prediction_id === predictionId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export async function listComments(slug: string): Promise<Comment[]> {
  const p = await getPredictionBySlug(slug);
  if (!p) return [];
  return listCommentsByPredictionId(p.id);
}

// ─────────────────────────────────────────────────────────────
// Rankings
// ─────────────────────────────────────────────────────────────

export async function getPredictionRanking(
  type: Extract<RankingType, "confident" | "controversial" | "popular">,
): Promise<Prediction[]> {
  const all = await listPredictions({ limit: 500, status: "all" });
  if (type === "confident") {
    return [...all]
      .filter((p) => p.status === "active")
      .sort((a, b) => b.confidence - a.confidence || b.views - a.views)
      .slice(0, 25);
  }
  if (type === "popular") {
    return [...all].sort((a, b) => b.views - a.views).slice(0, 25);
  }
  // controversial: high engagement and a close agree/doubt split
  const score = (p: Prediction) => {
    const total = p.agree_count + p.doubt_count;
    if (total === 0) return 0;
    const balance = 1 - Math.abs(p.agree_count - p.doubt_count) / total;
    return total * (0.35 + 0.65 * balance);
  };
  return [...all].sort((a, b) => score(b) - score(a)).slice(0, 25);
}

export async function getUserRanking(
  type: Extract<RankingType, "accurate" | "wrong">,
): Promise<UserStat[]> {
  const all = await listPredictions({ limit: 1000, status: "all" });
  const map = new Map<string, UserStat>();
  for (const p of all) {
    const s =
      map.get(p.username) ??
      {
        username: p.username,
        total: 0,
        correct: 0,
        wrong: 0,
        resolved: 0,
        accuracy: 0,
      };
    s.total += 1;
    if (p.status === "correct") s.correct += 1;
    if (p.status === "wrong") s.wrong += 1;
    if (p.status !== "active") s.resolved += 1;
    map.set(p.username, s);
  }
  const stats = [...map.values()].map((s) => ({
    ...s,
    accuracy: s.resolved > 0 ? s.correct / s.resolved : 0,
  }));
  if (type === "accurate") {
    return stats
      .filter((s) => s.resolved >= 1)
      .sort((a, b) => b.accuracy - a.accuracy || b.resolved - a.resolved)
      .slice(0, 25);
  }
  return stats
    .filter((s) => s.wrong >= 1)
    .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy)
    .slice(0, 25);
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

export async function createPrediction(
  input: CreateInput,
): Promise<PredictionWithToken> {
  const slug = newSlug();
  const manage_token = newToken();
  const row = {
    slug,
    prediction: input.prediction.trim().slice(0, 280),
    category: normalizeCategory(input.category),
    resolution_date: input.resolution_date,
    evidence_url: input.evidence_url?.trim() || null,
    username: input.username.trim().slice(0, 40),
    confidence: Math.min(100, Math.max(1, Math.round(input.confidence))),
  };

  if (HAS_DB_WRITE) {
    const { data, error } = await supabaseAdmin()
      .from("pmw_predictions")
      .insert({ ...row, manage_token_hash: tokenHash(manage_token) })
      .select(PUBLIC_COLUMNS)
      .single();
    if (error) throw error;
    // Plaintext token is returned to the caller once and never stored.
    return { ...(data as Prediction), manage_token };
  }

  const now = new Date().toISOString();
  const created: PredictionWithToken = {
    id: `demo-${demo().predictions.length + 1}-${slug}`,
    ...row,
    manage_token,
    status: "active",
    is_pro: false,
    is_sponsored: false,
    sponsor_name: null,
    views: 0,
    agree_count: 0,
    doubt_count: 0,
    created_at: now,
    resolved_at: null,
  };
  demo().predictions.unshift(created);
  return created;
}

export async function resolvePrediction(
  slug: string,
  token: string,
  status: Exclude<PredictionStatus, "active">,
): Promise<Prediction | null> {
  if (HAS_DB_WRITE) {
    const { data, error } = await supabaseAdmin()
      .from("pmw_predictions")
      .update({ status, resolved_at: new Date().toISOString() })
      .eq("slug", slug)
      .eq("manage_token_hash", tokenHash(token))
      .select(PUBLIC_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return (data as Prediction) ?? null;
  }
  const p = demo().predictions.find(
    (x) => x.slug === slug && x.manage_token === token,
  );
  if (!p) return null;
  p.status = status;
  p.resolved_at = new Date().toISOString();
  return strip(p);
}

export async function verifyManageToken(
  slug: string,
  token: string,
): Promise<Prediction | null> {
  if (HAS_DB_WRITE) {
    const { data, error } = await supabaseAdmin()
      .from("pmw_predictions")
      .select(PUBLIC_COLUMNS)
      .eq("slug", slug)
      .eq("manage_token_hash", tokenHash(token))
      .maybeSingle();
    if (error) throw error;
    return (data as Prediction) ?? null;
  }
  const p = demo().predictions.find(
    (x) => x.slug === slug && x.manage_token === token,
  );
  return p ? strip(p) : null;
}

export async function incrementViews(slug: string): Promise<void> {
  if (HAS_DB_WRITE) {
    await supabaseAdmin().rpc("pmw_increment_views", { p_slug: slug });
    return;
  }
  const p = demo().predictions.find((x) => x.slug === slug);
  if (p) p.views += 1;
}

export async function addComment(
  slug: string,
  input: { username: string; body: string; url?: string | null },
): Promise<Comment | null> {
  const p = await getPredictionBySlug(slug);
  if (!p) return null;
  const row = {
    prediction_id: p.id,
    username: input.username.trim().slice(0, 40) || "anon",
    body: input.body.trim().slice(0, 1000),
    url: input.url?.trim() || null,
  };
  if (!row.body) return null;

  if (HAS_DB_WRITE) {
    const { data, error } = await supabaseAdmin()
      .from("pmw_comments")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return data as Comment;
  }
  const c: Comment = {
    id: `c-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...row,
  };
  demo().comments.push(c);
  return c;
}

export async function vote(
  slug: string,
  choice: "agree" | "doubt",
  hash: string,
): Promise<{ agree: number; doubt: number } | null> {
  const p = await getPredictionBySlug(slug);
  if (!p) return null;

  if (HAS_DB_WRITE) {
    const admin = supabaseAdmin();
    const { error: insErr } = await admin
      .from("pmw_votes")
      .insert({ prediction_id: p.id, vote: choice, voter_hash: hash });
    if (insErr && insErr.code !== "23505") throw insErr; // ignore duplicate
    if (insErr) {
      return { agree: p.agree_count, doubt: p.doubt_count }; // already voted
    }
    const column = choice === "agree" ? "agree_count" : "doubt_count";
    await admin.rpc("pmw_bump_vote_count", { p_slug: slug, p_column: column });
    const fresh = await getPredictionBySlug(slug);
    return fresh
      ? { agree: fresh.agree_count, doubt: fresh.doubt_count }
      : null;
  }

  const key = `${slug}:${hash}`;
  const d = demo();
  const target = d.predictions.find((x) => x.slug === slug);
  if (!target) return null;
  if (!d.votes.has(key)) {
    d.votes.add(key);
    if (choice === "agree") target.agree_count += 1;
    else target.doubt_count += 1;
  }
  return { agree: target.agree_count, doubt: target.doubt_count };
}

export async function markPredictionPro(slug: string): Promise<void> {
  if (HAS_DB_WRITE) {
    await supabaseAdmin()
      .from("pmw_predictions")
      .update({ is_pro: true })
      .eq("slug", slug);
    return;
  }
  const p = demo().predictions.find((x) => x.slug === slug);
  if (p) p.is_pro = true;
}
