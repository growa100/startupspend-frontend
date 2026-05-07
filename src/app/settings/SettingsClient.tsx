"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/SectionHeader";

export function SettingsClient() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setEmail(data.user?.email ?? null),
    );
  }, [supabase]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPwd) {
      setMsg({ kind: "err", text: "Passwords don't match." });
      return;
    }
    if (password.length < 12) {
      setMsg({ kind: "err", text: "Use at least 12 characters." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMsg({ kind: "err", text: error.message });
    else {
      setPassword("");
      setConfirmPwd("");
      setMsg({ kind: "ok", text: "Password updated." });
    }
  }

  async function deleteAccount() {
    const ok = window.confirm(
      "Delete your account? This cannot be undone. OK to proceed.",
    );
    if (!ok) return;
    setMsg({
      kind: "err",
      text: "Account deletion needs a backend endpoint. For now, email support@startupspend.cloud.",
    });
  }

  return (
    <div className="ui-sans">
      <SectionHeader eyebrow="Account" title="Settings" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="card">
          <p className="cat-label">Identity</p>
          <p
            className="mt-3"
            style={{ fontSize: 14, color: "var(--text-primary)" }}
          >
            {email ?? "—"}
          </p>
          <p
            className="mt-1"
            style={{ fontSize: 12, color: "var(--text-muted)" }}
          >
            Changing your email is a follow-up.
          </p>
        </section>

        <section className="card">
          <p className="cat-label">Password</p>
          <form onSubmit={changePassword} className="mt-3 flex flex-col gap-3">
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="field-input"
            />
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Confirm"
              className="field-input"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-primary self-start"
            >
              {busy ? "…" : "Update"}
            </button>
            {msg && (
              <p
                className="pl-3"
                style={{
                  borderLeft: `2px solid ${msg.kind === "err" ? "var(--negative)" : "var(--positive)"}`,
                  color:
                    msg.kind === "err"
                      ? "var(--negative)"
                      : "var(--positive)",
                  fontSize: 13,
                }}
              >
                {msg.text}
              </p>
            )}
          </form>
        </section>
      </div>

      <section className="card mt-4">
        <p className="cat-label">Danger</p>
        <button
          onClick={deleteAccount}
          className="btn-secondary mt-3"
          style={{ borderColor: "var(--negative)", color: "var(--negative)" }}
        >
          Delete account
        </button>
      </section>
    </div>
  );
}
