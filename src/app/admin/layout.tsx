import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopStrip } from "@/components/TopStrip";
import { NavBar } from "@/components/NavBar";
import { AdminShell } from "@/components/AdminShell";
import { API_BASE } from "@/lib/api";

/**
 * Shared admin layout — gates server-side on is_admin.
 *
 * 1. If no session, redirect to /login.
 * 2. Otherwise fetch GET /me with the user's bearer token. The /me
 *    endpoint returns {id, email, is_admin}, with is_admin pulled from
 *    public.user_profiles by the backend.
 * 3. If is_admin is false, redirect to /dashboard before any admin UI
 *    paints.
 *
 * <AdminShell /> still does its own client-side /me check as a defense-
 * in-depth — useful if a session expires mid-page-life.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) redirect("/login");

  let isAdmin = false;
  try {
    const resp = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (resp.ok) {
      const me: { is_admin?: boolean } = await resp.json();
      isAdmin = Boolean(me.is_admin);
    }
  } catch {
    // Backend unreachable — fall through to non-admin redirect.
  }

  if (!isAdmin) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-bone">
      <TopStrip email={user.email} />
      <NavBar />
      <AdminShell>{children}</AdminShell>
    </main>
  );
}
