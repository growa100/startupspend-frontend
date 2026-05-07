import { createBrowserClient } from "@supabase/ssr";

// Hardcoded fallbacks. The Supabase anon key is designed to be public
// (it's embedded in every browser request the moment Supabase auth works
// at all — security comes from RLS, not key secrecy). The fallback is
// only used when Vercel hasn't inlined NEXT_PUBLIC_* into the bundle.
// To rotate, replace these strings AND the Vercel env vars.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://vujpmkpkeomchblaygxn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1anBta3BrZW9tY2hibGF5Z3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTgzOTYsImV4cCI6MjA5MzQ3NDM5Nn0.NGQoLubtwYjeYu4K00R2MgZXUabMtSWgG1Ej9KM569Y";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
