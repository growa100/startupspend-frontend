import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // During build with no env vars, return a stub that throws on use rather
    // than at construction time. This lets pages prerender as a static shell.
    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          );
        },
      },
    ) as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(url, anonKey);
}
