import { Column, EmptyState, Feedback, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizerShell } from "../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../components/organizer/PageIntro";
import { listSubmissions } from "../../../lib/organizer";
import type { Submission } from "../../../lib/organizer-types";
import { fill, intlLocale, localePath, type Dictionary, type Locale } from "../../../i18n";
import { pageLang } from "../../../i18n/server";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await pageLang(params);
  return { title: t.review.title };
}

const statusTag: Record<Submission["status"], { tone: "warning" | "success" | "danger"; label: keyof Dictionary["review"] }> = {
  pending: { tone: "warning", label: "pending" },
  approved: { tone: "success", label: "published" },
  rejected: { tone: "danger", label: "rejected" },
};

export default async function ReviewPage({ params }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const { lang, t } = await pageLang(params);
  const all = await listSubmissions();
  const pending = all.filter((s) => s.status === "pending");
  const done = all.filter((s) => s.status !== "pending");

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[{ label: t.common.allRaces, href: localePath(lang, "/") }, { label: t.review.title }]}
        title={t.review.title}
        lead={t.review.lead}
      />
      <Feedback
        tone="warning"
        title={t.review.noAuthTitle}
        description={t.review.noAuthText}
      />
      <Queue lang={lang} t={t} title={fill(t.review.waiting, { n: pending.length })} items={pending} empty={t.review.emptyText} />
      {done.length > 0 && <Queue lang={lang} t={t} title={t.review.decided} items={done} />}
    </OrganizerShell>
  );
}

function Queue({
  lang,
  t,
  title,
  items,
  empty,
}: {
  lang: Locale;
  t: Dictionary;
  title: string;
  items: Submission[];
  empty?: string;
}) {
  const when = new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Column gap="12">
      <Text as="h2" textVariant="heading-strong-m">
        {title}
      </Text>
      {items.length === 0 ? (
        <Column background="surface" border radius="l" padding="32">
          <EmptyState icon="inbox" title={t.review.allClear} description={empty} />
        </Column>
      ) : (
        <Column as="ul" background="surface" border radius="l">
          {items.map((s, i) => (
            <Row as="li" key={s.id} borderTop={i > 0} paddingX="20" paddingY="16" gap="16" vertical="center" horizontal="between" s={{ direction: "column", horizontal: "start" }}>
              <Column gap="4" minWidth="0">
                <SmartLink href={localePath(lang, `/review/${s.id}`)}>
                  <Text textVariant="label-strong-m" onBackground="neutral-strong">
                    {s.race.name || t.review.untitled}
                  </Text>
                </SmartLink>
                <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                  {s.id} · {s.kind === "claim" ? fill(t.review.claimOf, { name: s.claim?.name ?? "" }) : t.review.newRace} ·{" "}
                  {s.organizer.name} ·{" "}
                  {when.format(new Date(s.submitted_at))}
                </Text>
              </Column>
              <Tag size="s" tone={statusTag[s.status].tone}>
                {t.review[statusTag[s.status].label] as string}
              </Tag>
            </Row>
          ))}
        </Column>
      )}
    </Column>
  );
}
