"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    <main
      className="ui-sans flex min-h-screen flex-col items-center"
      style={{
        background: "#f4f4f5",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "32px 40px",
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center"
          style={{
            color: "#111111",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "-0.01em",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: "#2563eb",
              borderRadius: 2,
            }}
          />
          StartupSpend
        </Link>

        <h1
          style={{
            marginTop: 28,
            fontSize: 22,
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.012em",
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 14,
            color: "#71717a",
          }}
        >
          14 days of Pro on the house. No card.
        </p>

        {confirmSent ? (
          <p
            style={{
              marginTop: 24,
              padding: "12px 14px",
              borderRadius: 6,
              background: "#f4f4f5",
              fontSize: 14,
              color: "#374151",
            }}
          >
            Check{" "}
            <span style={{ fontWeight: 600, color: "#111111" }}>{email}</span>{" "}
            for a confirmation link.
          </p>
        ) : (
          <form
            onSubmit={submit}
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <Field label="Email">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@startup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="light-input"
              />
            </Field>

            <Field label="Password (12+ characters)">
              <input
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="light-input"
              />
            </Field>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#dc2626",
                  borderLeft: "2px solid #dc2626",
                  paddingLeft: 10,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 6,
                width: "100%",
                height: 40,
                background: "#2563eb",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 6,
                border: "none",
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.7 : 1,
                transition: "background 150ms ease",
              }}
            >
              {busy ? "…" : "Create account"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#a1a1aa" }}>or</span>
              <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              style={{
                width: "100%",
                height: 40,
                background: "#ffffff",
                color: "#111111",
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Continue with Google
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: 28,
            fontSize: 14,
            color: "#71717a",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#2563eb", fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </div>

      <p
        style={{
          marginTop: 32,
          fontSize: 13,
          color: "#a1a1aa",
        }}
      >
        StartupSpend · Cloud cost intelligence for founders
      </p>

      <style jsx global>{`
        .light-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px 12px;
          font-family: var(--font-inter), "Inter", ui-sans-serif, system-ui,
            sans-serif;
          font-size: 14px;
          color: #111111;
          background: #ffffff;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .light-input::placeholder {
          color: #a1a1aa;
        }
        .light-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          fontWeight: 500,
          color: "#374151",
        }}
      >
        <span>{label}</span>
        {right}
      </span>
      {children}
    </label>
  );
}
