"use server";

import { createSubmission, newSubmissionId, storeUpload } from "../../lib/organizer";
import { validate, type DraftErrors, type OrganizerContact, type RaceDraft, type Submission } from "../../lib/organizer-types";
import { getRace } from "../../lib/races";

export type SubmitResult = { ok: true; id: string } | { ok: false; errors: DraftErrors; message?: string };

const MAX_PHOTO = 8 * 1024 * 1024;
const MAX_GPX = 15 * 1024 * 1024;

/**
 * The form posts one JSON "payload" field plus the files: "photo-0".."photo-5"
 * and "gpx-<distance index>". Checked again here; the browser is not trusted.
 */
export async function submitRace(form: FormData): Promise<SubmitResult> {
  let payload: { kind: Submission["kind"]; claimSlug?: string; race: RaceDraft; organizer: OrganizerContact; claimNote: string };
  try {
    payload = JSON.parse(String(form.get("payload")));
  } catch {
    return { ok: false, errors: {}, message: "The form didn't arrive in one piece. Please try again." };
  }
  const { kind, race, organizer, claimNote } = payload;
  const errors = validate(race, organizer, kind, claimNote);

  const claimed = kind === "claim" && payload.claimSlug ? await getRace(payload.claimSlug) : null;
  if (kind === "claim" && !claimed) return { ok: false, errors, message: "We couldn't find the race you're claiming." };

  const photos = [...form.entries()].filter(([k, v]) => k.startsWith("photo-") && v instanceof File) as [string, File][];
  for (const [, f] of photos) {
    if (!f.type.startsWith("image/") || f.size > MAX_PHOTO) errors.photos = "Photos must be images under 8 MB.";
  }
  race.distances.forEach((_, i) => {
    const gpx = form.get(`gpx-${i}`);
    if (gpx instanceof File && (gpx.size > MAX_GPX || !/\.gpx$/i.test(gpx.name)))
      errors[`distances.${i}.gpx`] = "Upload a .gpx file under 15 MB.";
  });
  if (Object.keys(errors).length) return { ok: false, errors };

  const id = await newSubmissionId();
  race.photos = [];
  for (const [key, file] of photos.sort(([a], [b]) => a.localeCompare(b))) {
    race.photos.push(await storeUpload(id, file, key));
  }
  for (const [i, d] of race.distances.entries()) {
    const gpx = form.get(`gpx-${i}`);
    if (gpx instanceof File && gpx.size > 0) d.gpx_url = await storeUpload(id, gpx, `course-${i + 1}`);
  }

  await createSubmission({
    id,
    kind,
    claim: claimed ? { raceId: claimed.id, slug: claimed.slug, name: claimed.name } : undefined,
    status: "pending",
    submitted_at: new Date().toISOString(),
    claim_note: kind === "claim" ? claimNote.trim() : undefined,
    organizer: { ...organizer, name: organizer.name.trim(), email: organizer.email.trim() },
    race,
  });
  return { ok: true, id };
}
