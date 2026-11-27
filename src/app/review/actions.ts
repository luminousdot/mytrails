"use server";

import { revalidatePath } from "next/cache";
import { reviewSubmission } from "../../lib/organizer";
import { getListedRace } from "../../lib/races";

export type ReviewResult = { ok: true; slug?: string } | { ok: false; message: string };

// Review has no sign-in yet, so it only exists on a local `next dev`.
const enabled = () => process.env.NODE_ENV !== "production";

export async function decide(id: string, decision: "approved" | "rejected", note: string): Promise<ReviewResult> {
  if (!enabled()) return { ok: false, message: "Review is only available in development." };
  if (decision === "rejected" && !note.trim()) return { ok: false, message: "Say why, so the organiser can fix it." };
  try {
    const s = await reviewSubmission(id, decision, note.trim(), getListedRace);
    revalidatePath("/");
    revalidatePath("/review");
    if (s.published_slug) revalidatePath(`/races/${s.published_slug}`);
    return { ok: true, slug: s.published_slug };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
  }
}
