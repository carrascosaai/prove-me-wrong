"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_SECRET } from "@/lib/env";
import {
  deleteCommentById,
  deletePredictionById,
  setCommentHidden,
  setPredictionHidden,
} from "@/lib/db";

function authed(key: string): boolean {
  return Boolean(ADMIN_SECRET) && key === ADMIN_SECRET;
}

export async function adminAction(formData: FormData): Promise<void> {
  const key = String(formData.get("key") ?? "");
  if (!authed(key)) return;

  const op = String(formData.get("op") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  if (kind === "prediction") {
    if (op === "hide") await setPredictionHidden(id, true);
    else if (op === "unhide") await setPredictionHidden(id, false);
    else if (op === "delete") await deletePredictionById(id);
  } else if (kind === "comment") {
    if (op === "hide") await setCommentHidden(id, true);
    else if (op === "unhide") await setCommentHidden(id, false);
    else if (op === "delete") await deleteCommentById(id);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/rankings");
}
