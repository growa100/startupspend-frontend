import { AuthedShell } from "@/components/AuthedShell";
import { ConnectionsClient } from "./ConnectionsClient";

export const dynamic = "force-dynamic";

export default function ConnectionsPage() {
  return (
    <AuthedShell>
      <ConnectionsClient />
    </AuthedShell>
  );
}
