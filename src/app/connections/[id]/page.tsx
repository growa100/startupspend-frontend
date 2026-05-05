import { AuthedShell } from "@/components/AuthedShell";
import { ConnectionDetailClient } from "./ConnectionDetailClient";

export const dynamic = "force-dynamic";

export default async function ConnectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthedShell>
      <ConnectionDetailClient id={id} />
    </AuthedShell>
  );
}
