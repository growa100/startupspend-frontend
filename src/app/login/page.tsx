"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PublicTopStrip } from "@/components/PublicTopStrip";

type Mode = "password" | "magic";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const next = searchParams.get("next") ?? "/dashboard";

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      setError("Email or password is incorrect.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function submitMagic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) {
      setError("We couldn't send the link. Try again.");
      return;
    }
    setMagicSent(true);
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
            href="/signup"
            className="ui-sans text-[13px] text-ink hover:text-accent"
          >
            Create an account
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
          Sign in
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted">
          Enter your email to continue.
        </p>

        {magicSent ? (
          <p className="mt-8 border-l-2 border-ink pl-4 text-[14px]">
            We sent a sign-in link to{" "}
            <span className="font-medium">{email}</span>. Open it on this
            device to continue.
          </p>
        ) : (
          <form
            onSubmit={mode === "password" ? submitPassword : submitMagic}
            className="mt-8 flex flex-col gap-4"
          >
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

            {mode === "password" && (
              <label className="flex flex-col gap-1.5">
                <span className="cat-label-muted">Password</span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                />
              </label>
            )}

            {error && (
              <p className="border-l-2 border-negative pl-3 text-[13px] text-negative">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary">
              {busy
                ? "…"
                : mode === "password"
                  ? "Sign in"
                  : "Send sign-in link"}
            </button>

            <button
              type="button"
              onClick={() =>
                setMode(mode === "password" ? "magic" : "password")
              }
              className="text-left text-[13px] text-accent underline-offset-4 hover:underline"
            >
              {mode === "password"
                ? "Or send me a magic link"
                : "Use a password instead"}
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
