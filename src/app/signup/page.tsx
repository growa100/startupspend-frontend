"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PublicTopStrip } from "@/components/PublicTopStrip";

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "12345678",
  "qwerty123",
  "letmein123",
  "welcome123",
  "abc123456",
  "iloveyou1",
]);

function passwordIssue(pw: string): string | null {
  if (pw.length < 12) return "Use at least 12 characters.";
  if (COMMON_PASSWORDS.has(pw.toLowerCase()))
    return "That password is too common.";
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const issue = passwordIssue(password);
    if (issue) {
      setError(issue);
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setBusy(false);
    if (error) {
      setError(
        "We couldn't create your account. Check the email and try again.",
      );
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setConfirmSent(true);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setBusy(false);
    if (error) setError("Google sign-in is unavailable right now.");
  }

  return (
    <main className="min-h-screen bg-bone">
      <PublicTopStrip />
      <header className="border-b border-rule bg-white">
        <div
          className="mx-auto flex max-w-ft items-center justify-between px-6"
          style={{ height: "64px" }}
        >
          <Link
            href="/"
            className="font-display text-[22px] font-medium leading-none tracking-tight text-ink"
          >
            StartupSpend
          </Link>
          <Link
            href="/login"
            className="ui-sans text-[13px] text-ink hover:text-accent"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section
        className="ui-sans mx-auto max-w-md px-6"
        style={{ paddingTop: "64px", paddingBottom: "96px" }}
      >
        <p className="cat-label">Account</p>
        <h1
          className="font-display mt-3 text-ink"
          style={{
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.012em",
          }}
        >
          Create your account
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted">
          14 days of Pro on the house. No card.
        </p>

        {confirmSent ? (
          <p className="mt-8 border-l-2 border-ink pl-4 text-[14px]">
            Check <span className="font-medium">{email}</span> for a
            confirmation link.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="cat-label-muted">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="cat-label-muted">
                Password (12+ characters)
              </span>
              <input
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
              />
            </label>

            {error && (
              <p className="border-l-2 border-negative pl-3 text-[13px] text-negative">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "…" : "Create account"}
            </button>

            <hr className="hr-rule" />

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="btn-secondary"
            >
              Continue with Google
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
