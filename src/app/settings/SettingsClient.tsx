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

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <section className="border-t border-rule pt-6">
          <p className="cat-label-muted">Identity</p>
          <p className="mt-3 text-[14px] text-ink">{email ?? "—"}</p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Changing your email is a follow-up.
          </p>
        </section>

        <section className="border-t border-rule pt-6">
          <p className="cat-label-muted">Password</p>
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
                className={
                  msg.kind === "err"
                    ? "border-l-2 border-negative pl-3 text-[13px] text-negative"
                    : "border-l-2 border-positive pl-3 text-[13px] text-positive"
                }
              >
                {msg.text}
              </p>
            )}
          </form>
        </section>
      </div>

      <section className="mt-12 border-t border-rule pt-6">
        <p className="cat-label-muted">Danger</p>
        <button onClick={deleteAccount} className="btn-secondary mt-3 border-negative text-negative hover:bg-rule">
          Delete account
        </button>
      </section>
    </div>
  );
}
