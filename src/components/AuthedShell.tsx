import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "./NavBar";
import { TopStrip } from "./TopStrip";

export async function AuthedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="min-h-screen bg-bone">
      <TopStrip email={user.email} />
      <NavBar />
      <section className="mx-auto max-w-ft px-6 pb-24">{children}</section>
    </main>
  );
}
