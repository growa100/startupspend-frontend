import { AuthedShell } from "@/components/AuthedShell";
import { ResourcesClient } from "./ResourcesClient";

export const dynamic = "force-dynamic";

export default function ResourcesPage() {
  return (
    <AuthedShell>
      <ResourcesClient />
    </AuthedShell>
  );
}
