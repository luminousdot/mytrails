"use server";

import { updateTag } from "next/cache";
import { PUBLISHED_TAG, reviewSubmission, SUBMISSIONS_TAG } from "../lib/organizer";
import { getListedRace } from "../lib/races";

export type ReviewResult =
  | { ok: true; slug?: string }
  | { ok: false; code: "devOnly" | "needNote" | "failed"; detail?: string };

// Review has no sign-in yet, so it only exists on a local `next dev`.
const enabled = () => process.env.NODE_ENV !== "production";

export async function decide(id: string, decision: "approved" | "rejected", note: string): Promise<ReviewResult> {
  if (!enabled()) return { ok: false, code: "devOnly" };
  if (decision === "rejected" && !note.trim()) return { ok: false, code: "needNote" };
  try {
    const s = await reviewSubmission(id, decision, note.trim(), getListedRace);
    updateTag(SUBMISSIONS_TAG);
    updateTag(PUBLISHED_TAG);
    return { ok: true, slug: s.published_slug };
  } catch (e) {
    return { ok: false, code: "failed", detail: e instanceof Error ? e.message : undefined };
  }
}
