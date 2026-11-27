import { Column } from "@once-ui-system/core";
import { TopBar } from "../TopBar";

/** Top bar and the page column for organiser and review pages. */
export function OrganizerShell({ children, width = "m" }: { children: React.ReactNode; width?: "m" | "l" }) {
  return (
    <>
      <TopBar />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingTop="32" paddingBottom="80" s={{ paddingX: "16" }}>
        <Column maxWidth={width} gap="32">
          {children}
        </Column>
      </Column>
    </>
  );
}
