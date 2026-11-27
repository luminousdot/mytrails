"use client";

import { Button, Column, Feedback, Heading, Row, Text, Textarea, useToast } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { decide } from "../../app/review/actions";

export function ReviewActions({ id, kind }: { id: string; kind: "new" | "claim" }) {
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
      setError(result.message);
      return;
    }
    addToast({ tone: "success", message: decision === "approved" ? "Published to the calendar." : "Rejected." });
    router.refresh();
  }

  return (
    <Column as="section" background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
      <Column gap="4">
        <Heading as="h2" textVariant="heading-strong-m">
          Decision
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty">
          {kind === "claim"
            ? "Approving switches the listed page to these details and marks it as run by its organiser."
            : "Approving adds the race to the calendar with its own page."}
        </Text>
      </Column>
      {error && <Feedback tone="danger" title={error} />}
      <Textarea
        id="review-note"
        label="Note to the organiser"
        description="Needed when you reject, so they know what to fix."
        lines={3}
        value={note}
        onValueChange={setNote}
      />
      <Row gap="8" wrap>
        <Button onClick={() => run("approved")} loading={busy === "approved"} disabled={!!busy} prefixIcon="check">
          Approve and publish
        </Button>
        <Button
          variant="secondary"
          tone="danger"
          onClick={() => run("rejected")}
          loading={busy === "rejected"}
          disabled={!!busy}
        >
          Reject
        </Button>
      </Row>
    </Column>
  );
}
