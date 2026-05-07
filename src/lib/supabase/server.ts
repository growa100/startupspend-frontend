import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://vujpmkpkeomchblaygxn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1anBta3BrZW9tY2hibGF5Z3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTgzOTYsImV4cCI6MjA5MzQ3NDM5Nn0.NGQoLubtwYjeYu4K00R2MgZXUabMtSWgG1Ej9KM569Y";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component; safe to ignore — middleware refreshes.
        }
      },
    },
  });
}
