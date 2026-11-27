"use client";

import { Button, Column, Feedback, Heading, Row, Text, Textarea, useToast } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { decide } from "../../server/review-actions";

export function ReviewActions({ id, kind }: { id: string; kind: "new" | "claim" }) {
  const { t } = useI18n();
  const router = useRouter();
  const { addToast } = useToast();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<null | "approved" | "rejected">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(decision: "approved" | "rejected") {
    setBusy(decision);
    setError(null);
    const result = await decide(id, decision, note);
    setBusy(null);
    if (!result.ok) {
      setError(result.code === "failed" && result.detail ? `${t.review.failed} ${result.detail}` : t.review[result.code]);
      return;
    }
    addToast({ tone: "success", message: decision === "approved" ? t.review.toastPublished : t.review.toastRejected });
    router.refresh();
  }

  return (
    <Column as="section" background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
      <Column gap="4">
        <Heading as="h2" textVariant="heading-strong-m">
          {t.review.decision}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty">
          {kind === "claim"
            ? t.review.approveClaim
            : t.review.approveNew}
        </Text>
      </Column>
      {error && <Feedback tone="danger" title={error} />}
      <Textarea
        id="review-note"
        label={t.review.note}
        description={t.review.noteHelp}
        lines={3}
        value={note}
        onValueChange={setNote}
      />
      <Row gap="8" wrap>
        <Button onClick={() => run("approved")} loading={busy === "approved"} disabled={!!busy} prefixIcon="check">
          {t.review.approve}
        </Button>
        <Button
          variant="secondary"
          tone="danger"
          onClick={() => run("rejected")}
          loading={busy === "rejected"}
          disabled={!!busy}
        >
          {t.review.reject}
        </Button>
      </Row>
    </Column>
  );
}
