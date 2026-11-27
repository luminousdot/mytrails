import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizerShell } from "../../../components/organizer/OrganizerShell";
import { ThanksBody } from "../../../components/organizer/ThanksBody";

export const metadata: Metadata = { title: "Sent for review" };

export default function ThanksPage() {
  return (
    <OrganizerShell>
      {/* The reference number comes from the address, which needs a Suspense boundary. */}
      <Suspense>
        <ThanksBody />
      </Suspense>
    </OrganizerShell>
  );
}
