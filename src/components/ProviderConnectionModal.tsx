"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiPost, type Provider } from "@/lib/api";
import { ProviderBadge } from "@/components/ProviderBadge";
import { formatProviderName } from "@/lib/providerColors";
import { fieldHelpFor } from "@/lib/providerHelp";
import { guideForProvider, type GuideStep } from "@/lib/providerGuide";

type View = "form" | "guide";

export function ProviderConnectionModal({
  provider,
  onClose,
  onAdded,
}: {
  provider: Provider;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [view, setView] = useState<View>("form");
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCreds = useMemo(
    () =>
      Object.fromEntries(provider.credential_fields.map((f) => [f.name, ""])),
    [provider],
  );

  useEffect(() => {
    setCreds(initialCreds);
    setError(null);
    setView("form");
  }, [initialCreds]);

  // ESC to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/connections", {
        provider: provider.name,
        credentials: creds,
      });
      onAdded();
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Connect ${formatProviderName(provider.name)}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Sliding stage */}
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          {/* Form view */}
          <div
            style={{
              position: view === "guide" ? "absolute" : "relative",
              inset: 0,
              transform: view === "form" ? "translateX(0)" : "translateX(-100%)",
              opacity: view === "form" ? 1 : 0,
              transition: "transform 250ms ease-out, opacity 200ms ease-out",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
            }}
            aria-hidden={view !== "form"}
          >
            <FormHeader provider={provider} onClose={onClose} />
            <div
              style={{
                overflowY: "auto",
                padding: "20px 24px 24px",
                flex: 1,
              }}
            >
              <form
                id="connect-form"
                onSubmit={submit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {provider.credential_fields.map((f) => {
                  const help = fieldHelpFor(provider.name, f.name);
                  return (
                    <label
                      key={f.name}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <span
                        className="ui-sans"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {f.label}
                      </span>
                      <input
                        required
                        type={f.secret ? "password" : "text"}
                        placeholder={f.placeholder}
                        value={creds[f.name] ?? ""}
                        onChange={(e) =>
                          setCreds((prev) => ({
                            ...prev,
                            [f.name]: e.target.value,
                          }))
                        }
                        className="field-input"
                        style={{
                          fontFamily: f.secret
                            ? "var(--font-jetbrains-mono)"
                            : undefined,
                        }}
                      />
                      {help && (
                        <span
                          className="ui-sans"
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                          }}
                        >
                          {help}
                        </span>
                      )}
                    </label>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setView("guide")}
                  className="ui-sans"
                  style={{
                    marginTop: 4,
                    width: "100%",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "border-color 150ms ease, color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--border-focus)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  <BookIcon />
                  How to get your API key
                  <span aria-hidden>→</span>
                </button>

                {error && (
                  <p
                    className="ui-sans"
                    style={{
                      fontSize: 13,
                      color: "var(--negative)",
                      borderLeft: "2px solid var(--negative)",
                      paddingLeft: 10,
                    }}
                  >
                    {error}
                  </p>
                )}
              </form>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg-elevated)",
              }}
            >
              <button
                type="submit"
                form="connect-form"
                disabled={busy}
                style={{
                  width: "100%",
                  height: 40,
                  background: "var(--brand)",
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
                {busy ? "Connecting…" : "Connect"}
              </button>
            </div>
          </div>

          {/* Guide view */}
          <div
            style={{
              position: view === "form" ? "absolute" : "relative",
              inset: 0,
              transform: view === "guide" ? "translateX(0)" : "translateX(100%)",
              opacity: view === "guide" ? 1 : 0,
              transition: "transform 250ms ease-out, opacity 200ms ease-out",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
            }}
            aria-hidden={view !== "guide"}
          >
            <GuideHeader
              provider={provider}
              onBack={() => setView("form")}
              onClose={onClose}
            />
            <div
              style={{
                overflowY: "auto",
                padding: "20px 24px 28px",
                flex: 1,
              }}
            >
              <GuideSteps provider={provider} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormHeader({
  provider,
  onClose,
}: {
  provider: Provider;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid var(--border)",
        position: "relative",
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <ProviderBadge provider={provider.name} size="lg" />
        <div style={{ minWidth: 0 }}>
          <p
            className="ui-sans"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Connect
          </p>
          <h2
            className="ui-sans"
            style={{
              marginTop: 2,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.012em",
            }}
          >
            {formatProviderName(provider.name)}
          </h2>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <p
        className="ui-sans"
        style={{
          marginTop: 10,
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        Read-only access. We never write to your account.
      </p>
    </div>
  );
}

function GuideHeader({
  provider,
  onBack,
  onClose,
}: {
  provider: Provider;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid var(--border)",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="ui-sans"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          fontSize: 13,
          color: "var(--brand)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontWeight: 500,
        }}
      >
        ← Back
      </button>
      <h2
        className="ui-sans"
        style={{
          marginTop: 8,
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.012em",
        }}
      >
        How to get your {formatProviderName(provider.name)} API key
      </h2>
      <CloseButton onClose={onClose} />
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 28,
        height: 28,
        border: "none",
        background: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        borderRadius: 4,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 150ms ease, background 150ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--text-primary)";
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--bg-subtle)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--text-muted)";
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

/* =================================================================
 * GUIDE STEPS
 * ================================================================= */

function GuideSteps({ provider }: { provider: Provider }) {
  const steps = guideForProvider(provider.name);
  return (
    <ol style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {steps.map((step, i) => (
        <Step key={i} index={i + 1} step={step} />
      ))}
    </ol>
  );
}

function Step({ index, step }: { index: number; step: GuideStep }) {
  const num = String(index).padStart(2, "0");
  return (
    <li
      style={{
        display: "flex",
        gap: 14,
        listStyle: "none",
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--brand)",
          letterSpacing: "0.04em",
          flexShrink: 0,
          width: 28,
        }}
      >
        {num}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="ui-sans"
          style={{
            fontSize: 14,
            color: "var(--text-primary)",
            lineHeight: 1.5,
          }}
        >
          {step.text}
        </p>
        {step.visual && (
          <div style={{ marginTop: 10 }}>
            <Visual visual={step.visual} />
          </div>
        )}
      </div>
    </li>
  );
}

function Visual({ visual }: { visual: NonNullable<GuideStep["visual"]> }) {
  if (visual.kind === "link") {
    return <LinkVisual url={visual.url} label={visual.label} />;
  }
  if (visual.kind === "code") {
    return <CodeVisual code={visual.code} />;
  }
  if (visual.kind === "mockButton") {
    return <MockButton label={visual.label} />;
  }
  if (visual.kind === "mockInput") {
    return <MockInput value={visual.value} placeholder={visual.placeholder} />;
  }
  if (visual.kind === "mockSelect") {
    return <MockSelect options={visual.options} />;
  }
  if (visual.kind === "note") {
    return (
      <p
        className="ui-sans"
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}
      >
        {visual.text}
      </p>
    );
  }
  return null;
}

function LinkVisual({ url, label }: { url: string; label?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="ui-sans"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: "var(--bg-subtle)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        fontSize: 12,
        textDecoration: "none",
        maxWidth: "100%",
        overflow: "hidden",
        transition: "border-color 150ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--brand)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--border)";
      }}
    >
      <span
        className="mono"
        style={{
          color: "var(--text-secondary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label ?? prettyUrl(url)}
      </span>
      <ExternalIcon />
    </a>
  );
}

function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.host + u.pathname;
  } catch {
    return url;
  }
}

function CodeVisual({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }
  return (
    <div
      style={{
        position: "relative",
        background: "#000000",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "12px 14px",
      }}
    >
      <pre
        className="mono"
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: "#ffffff",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          paddingRight: 60,
        }}
      >
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="ui-sans"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 500,
          color: copied ? "var(--positive)" : "#a1a1aa",
          background: "transparent",
          border: "1px solid #333333",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function MockButton({ label }: { label: string }) {
  return (
    <span
      className="ui-sans"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 12px",
        background: "var(--brand)",
        color: "#ffffff",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 6,
        boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </span>
  );
}

function MockInput({
  value,
  placeholder,
}: {
  value: string;
  placeholder?: string;
}) {
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        background: "var(--bg-subtle)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        fontSize: 12,
        borderRadius: 4,
        minWidth: 200,
      }}
      aria-label={placeholder}
    >
      {value}
    </span>
  );
}

function MockSelect({
  options,
}: {
  options: { label: string; selected?: boolean }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {options.map((o) => (
        <span
          key={o.label}
          className="ui-sans"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            background: o.selected
              ? "rgba(37,99,235,0.08)"
              : "var(--bg-subtle)",
            border: `1px solid ${o.selected ? "var(--brand)" : "var(--border)"}`,
            color: o.selected ? "var(--brand)" : "var(--text-secondary)",
            fontSize: 13,
            fontWeight: o.selected ? 600 : 400,
            borderRadius: 4,
            width: "fit-content",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: `1px solid ${o.selected ? "var(--brand)" : "var(--border-focus)"}`,
              background: o.selected ? "var(--brand)" : "transparent",
              boxShadow: o.selected
                ? "inset 0 0 0 2px var(--bg-elevated)"
                : "none",
            }}
          />
          {o.label}
        </span>
      ))}
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0, color: "var(--text-muted)" }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
