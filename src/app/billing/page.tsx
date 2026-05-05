import { AuthedShell } from "@/components/AuthedShell";
import { BillingClient } from "./BillingClient";

export const dynamic = "force-dynamic";

export default function BillingPage() {
  return (
    <AuthedShell>
      <BillingClient />
    </AuthedShell>
  );
}
