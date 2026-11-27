import { Breadcrumbs, Column, Heading, Text } from "@once-ui-system/core";

/** Title block shared by the organiser pages. */
export function PageIntro({
  crumbs,
  title,
  lead,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  lead: React.ReactNode;
}) {
  return (
    <Column gap="16">
      <Breadcrumbs items={crumbs} />
      <Column gap="12">
        <Heading as="h1" textVariant="display-strong-s" wrap="balance">
          {title}
        </Heading>
        <Column maxWidth="40rem">
          <Text textVariant="body-default-l" onBackground="neutral-medium" wrap="pretty">
            {lead}
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
