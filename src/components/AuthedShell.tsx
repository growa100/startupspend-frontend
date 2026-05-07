import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileBottomNav } from "./MobileBottomNav";
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
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <TopStrip email={user.email} />
      <NavBar />
      <section className="mx-auto max-w-ft px-8 pb-32 md:pb-24">
        {children}
      </section>
      <MobileBottomNav />
    </main>
  );
}
