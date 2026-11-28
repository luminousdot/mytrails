import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizerShell } from "../../../../components/organizer/OrganizerShell";
import { ThanksBody } from "../../../../components/organizer/ThanksBody";
import { pageLang } from "../../../../i18n/server";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await pageLang(params);
  return { title: t.org.thanksTitle };
}

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
