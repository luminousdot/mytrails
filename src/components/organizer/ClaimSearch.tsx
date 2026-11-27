"use client";

import { Button, Column, Icon, Input, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { fold } from "../../lib/race-utils";

type Option = { slug: string; name: string; meta: string; claimed: boolean };

export function ClaimSearch({ races }: { races: Option[] }) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const t = fold(q.trim());
    if (t.length < 2) return [];
    return races.filter((r) => fold(`${r.name} ${r.meta}`).includes(t)).slice(0, 8);
  }, [q, races]);

  return (
    <Column gap="12">
      <Input
        id="claim-search"
        label="Race name or town"
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
        value={q}
        onValueChange={setQ}
      />
      {q.trim().length >= 2 && (
        <Column as="ul" border radius="m" aria-live="polite">
          {hits.length === 0 ? (
            <Row as="li" padding="16" gap="12" vertical="center" horizontal="between" wrap>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                No listed race matches “{q.trim()}”.
              </Text>
              <Button href="/organizers/new" size="s" variant="secondary" prefixIcon="plus">
                Add it as a new race
              </Button>
            </Row>
          ) : (
            hits.map((r, i) => (
              <Row as="li" key={r.slug} borderTop={i > 0} paddingX="16" paddingY="12" gap="12" vertical="center" horizontal="between">
                <Column gap="2" minWidth="0">
                  <SmartLink href={`/races/${r.slug}`}>
                    <Text textVariant="label-strong-m" onBackground="neutral-strong">
                      {r.name}
                    </Text>
                  </SmartLink>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {r.meta}
                  </Text>
                </Column>
                {r.claimed ? (
                  <Tag size="s" tone="success" prefixIcon="check">
                    Run by its organiser
                  </Tag>
                ) : (
                  <Button href={`/organizers/claim/${r.slug}`} size="s" variant="secondary">
                    Claim
                  </Button>
                )}
              </Row>
            ))
          )}
        </Column>
      )}
    </Column>
  );
}
