"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  addComment,
  createPrediction,
  ipHash,
  rateCheck,
  resolvePrediction,
  vote,
  voterHash,
} from "@/lib/db";
import { isCategory } from "@/lib/categories";
import { containsBlockedTerm, isBot } from "@/lib/moderation";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0"
  );
}

async function clientHash(): Promise<string> {
  const h = await headers();
  const ua = h.get("user-agent") || "unknown";
  return voterHash(await clientIp(), ua);
}

export type CreateState = { error?: string };

export async function createPredictionAction(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  // Honeypot — a filled hidden field means a bot. Pretend it worked.
  if (isBot(formData.get("website"))) {
    return { error: "Something went wrong. Try again." };
  }

  const prediction = String(formData.get("prediction") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const resolutionDate = String(formData.get("resolution_date") ?? "").trim();
  const evidence = String(formData.get("evidence_url") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const confidence = Number(formData.get("confidence") ?? 50);

  if (prediction.length < 8) {
    return { error: "Your prediction is too short. Be specific." };
  }
  if (prediction.length > 280) {
    return { error: "Keep the prediction under 280 characters." };
  }
  if (!isCategory(category)) {
    return { error: "Pick a category." };
  }
  const when = new Date(resolutionDate);
  if (Number.isNaN(when.getTime())) {
    return { error: "Pick a valid resolution date." };
  }
  if (when.getTime() < Date.now() + 60 * 60 * 1000) {
    return { error: "The resolution date must be in the future." };
  }
  if (when.getTime() > Date.now() + 20 * 365 * 86400_000) {
    return { error: "That resolution date is too far out (max 20 years)." };
  }
  if (username.length < 2 || username.length > 40) {
    return { error: "Username must be 2–40 characters." };
  }
  if (evidence && !/^https?:\/\/.+/i.test(evidence)) {
    return { error: "Evidence must be a valid http(s) URL." };
  }
  if (containsBlockedTerm(prediction, username)) {
    return { error: "That contains language we don't allow. Reword it." };
  }

  const bucket = `create:${ipHash(await clientIp())}`;
  if (!(await rateCheck(bucket, 6, 3600))) {
    return { error: "You're posting too fast. Try again in a bit." };
  }

  const created = await createPrediction({
    prediction,
    category,
    resolution_date: when.toISOString(),
    evidence_url: evidence || null,
    username: username.replace(/^@/, ""),
    confidence: Number.isFinite(confidence) ? confidence : 50,
  });

  revalidatePath("/");
  revalidatePath("/feed");
  redirect(
    `/p/${created.slug}?created=1&token=${encodeURIComponent(created.manage_token)}`,
  );
}

export type CommentState = { error?: string; ok?: boolean };

export async function addCommentAction(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  if (isBot(formData.get("website"))) return { ok: true };

  const slug = String(formData.get("slug") ?? "");
  const username = String(formData.get("username") ?? "").trim() || "anon";
  const body = String(formData.get("body") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (body.length < 2) return { error: "Say something." };
  if (body.length > 1000) return { error: "Comment too long." };
  if (url && !/^https?:\/\/.+/i.test(url)) {
    return { error: "Evidence link must be a valid http(s) URL." };
  }
  if (containsBlockedTerm(body, username)) {
    return { error: "That contains language we don't allow." };
  }

  const bucket = `comment:${ipHash(await clientIp())}`;
  if (!(await rateCheck(bucket, 20, 3600))) {
    return { error: "Slow down — too many comments. Try again later." };
  }

  const c = await addComment(slug, {
    username: username.replace(/^@/, ""),
    body,
    url: url || null,
  });
  if (!c) return { error: "Could not post that." };
  revalidatePath(`/p/${slug}`);
  return { ok: true };
}

export type VoteState = {
  agree: number;
  doubt: number;
  voted?: "agree" | "doubt";
} | null;

export async function voteAction(
  prev: VoteState,
  formData: FormData,
): Promise<VoteState> {
  const slug = String(formData.get("slug") ?? "");
  const choice = String(formData.get("choice") ?? "");
  if (choice !== "agree" && choice !== "doubt") return prev;

  const bucket = `vote:${ipHash(await clientIp())}`;
  if (!(await rateCheck(bucket, 120, 3600))) return prev;

  const res = await vote(slug, choice, await clientHash());
  revalidatePath(`/p/${slug}`);
  return res ? { ...res, voted: choice } : prev;
}

export type ResolveState = { error?: string };

export async function resolveAction(
  _prev: ResolveState,
  formData: FormData,
): Promise<ResolveState> {
  const slug = String(formData.get("slug") ?? "");
  const token = String(formData.get("token") ?? "");
  const verdict = String(formData.get("verdict") ?? "");
  if (verdict !== "correct" && verdict !== "wrong") {
    return { error: "Choose a verdict." };
  }
  const updated = await resolvePrediction(slug, token, verdict);
  if (!updated) return { error: "Invalid or expired manage link." };
  revalidatePath(`/p/${slug}`);
  revalidatePath("/rankings");
  redirect(`/p/${slug}`);
}
