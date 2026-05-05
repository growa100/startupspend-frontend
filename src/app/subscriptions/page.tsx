import { AuthedShell } from "@/components/AuthedShell";
import { SubscriptionsClient } from "./SubscriptionsClient";

export const dynamic = "force-dynamic";

export default function SubscriptionsPage() {
  return (
    <AuthedShell>
      <SubscriptionsClient />
    </AuthedShell>
  );
}
