import { AuthedShell } from "@/components/AuthedShell";
import { HistoryClient } from "./HistoryClient";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  return (
    <AuthedShell>
      <HistoryClient />
    </AuthedShell>
  );
}
