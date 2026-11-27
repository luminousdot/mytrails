import { Column, EmptyState, Feedback, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizerShell } from "../../components/organizer/OrganizerShell";
import { PageIntro } from "../../components/organizer/PageIntro";
import { listSubmissions } from "../../lib/organizer";
import type { Submission } from "../../lib/organizer-types";

export const metadata: Metadata = { title: "Review queue" };

const statusTag: Record<Submission["status"], { tone: "warning" | "success" | "danger"; label: string }> = {
  pending: { tone: "warning", label: "Pending" },
  approved: { tone: "success", label: "Published" },
  rejected: { tone: "danger", label: "Rejected" },
};

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ReviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const all = await listSubmissions();
  const pending = all.filter((s) => s.status === "pending");
  const done = all.filter((s) => s.status !== "pending");

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[{ label: "All races", href: "/" }, { label: "Review queue" }]}
        title="Review queue"
        lead="New races and claims from organisers. Nothing is public until you approve it."
      />
      <Feedback
        tone="warning"
        title="No sign-in yet"
        description="This page only runs on a local dev server. It needs real accounts before the site is deployed."
      />
      <Queue title={`Waiting (${pending.length})`} items={pending} empty="Nothing waiting. New submissions show up here." />
      {done.length > 0 && <Queue title="Decided" items={done} />}
    </OrganizerShell>
  );
}

function Queue({ title, items, empty }: { title: string; items: Submission[]; empty?: string }) {
  return (
    <Column gap="12">
      <Text as="h2" textVariant="heading-strong-m">
        {title}
      </Text>
      {items.length === 0 ? (
        <Column background="surface" border radius="l" padding="32">
          <EmptyState icon="inbox" title="All clear" description={empty} />
        </Column>
      ) : (
        <Column as="ul" background="surface" border radius="l">
          {items.map((s, i) => (
            <Row as="li" key={s.id} borderTop={i > 0} paddingX="20" paddingY="16" gap="16" vertical="center" horizontal="between" s={{ direction: "column", horizontal: "start" }}>
              <Column gap="4" minWidth="0">
                <SmartLink href={`/review/${s.id}`}>
                  <Text textVariant="label-strong-m" onBackground="neutral-strong">
                    {s.race.name || "Untitled race"}
                  </Text>
                </SmartLink>
                <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                  {s.id} · {s.kind === "claim" ? `Claim of ${s.claim?.name}` : "New race"} · {s.organizer.name} ·{" "}
                  {when.format(new Date(s.submitted_at))}
                </Text>
              </Column>
              <Tag size="s" tone={statusTag[s.status].tone}>
                {statusTag[s.status].label}
              </Tag>
            </Row>
          ))}
        </Column>
      )}
    </Column>
  );
}
