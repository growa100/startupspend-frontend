import { AuthedShell } from "@/components/AuthedShell";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <AuthedShell>
      <SettingsClient />
    </AuthedShell>
  );
}
