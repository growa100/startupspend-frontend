"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type FlatSubscription,
} from "@/lib/api";
import { MoneyText } from "@/components/MoneyText";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

type State =
  | { status: "loading" }
  | { status: "ready"; data: FlatSubscription[] }
  | { status: "error"; message: string };

const CATEGORIES = [
  "subscription",
  "compute",
  "storage",
  "ai_api",
  "ads_spend",
  "other",
];

export function SubscriptionsClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [category, setCategory] = useState("subscription");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<FlatSubscription | null>(null);

  async function refresh() {
    try {
      const data = await apiGet<FlatSubscription[]>("/flat-subscriptions");
      setState({ status: "ready", data });
    } catch (e) {
      setState({ status: "error", message: (e as ApiError).detail });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiPost("/flat-subscriptions", {
        name,
        monthly_amount_usd: amount,
        billing_day: Number(day),
        category,
      });
      setName("");
      setAmount("");
      setDay("1");
      setCategory("subscription");
      refresh();
    } catch (e) {
      setErr((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this subscription?")) return;
    await apiDelete(`/flat-subscriptions/${id}`);
    refresh();
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await apiPatch(`/flat-subscriptions/${editing.id}`, {
        name: editing.name,
        monthly_amount_usd: editing.monthly_amount_usd,
        billing_day: editing.billing_day,
        category: editing.category,
      });
      setEditing(null);
      refresh();
    } catch (e) {
      setErr((e as ApiError).detail);
    }
  }

  return (
    <div className="ui-sans">
      <SectionHeader
        eyebrow="Manual"
        title="Flat subscriptions"
        meta={
          state.status === "ready" ? `${state.data.length} tracked` : undefined
        }
      />

      <p
        className="mb-6 max-w-2xl"
        style={{ fontSize: 14, color: "var(--text-muted)" }}
      >
        Monthly tools without a billing API. Vercel Pro, GitHub Team, ChatGPT
        Plus — anything you want included in projections.
      </p>

      <form
        onSubmit={add}
        className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-12"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="GitHub Team"
          className="field-input sm:col-span-4"
        />
        <input
          required
          inputMode="decimal"
          pattern="^\d+(\.\d{1,2})?$"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="29.00"
          className="field-input tabular sm:col-span-2"
        />
        <input
          required
          type="number"
          min={1}
          max={28}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="day"
          className="field-input tabular sm:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field-input sm:col-span-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary sm:col-span-2"
        >
          {busy ? "…" : "Add"}
        </button>
        {err && (
          <p
            className="pl-3 sm:col-span-12"
            style={{
              borderLeft: "2px solid var(--negative)",
              color: "var(--negative)",
              fontSize: 13,
            }}
          >
            {err}
          </p>
        )}
      </form>

      <div className="mt-8">
        {state.status === "loading" && (
          <div
            className="space-y-3 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-baseline justify-between pb-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <SkeletonLine className="h-4 w-40" />
                <SkeletonLine className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {state.status === "error" && (
          <p
            className="pl-3"
            style={{
              borderLeft: "2px solid var(--negative)",
              color: "var(--negative)",
              fontSize: 13,
            }}
          >
            {state.message}
          </p>
        )}

        {state.status === "ready" && state.data.length === 0 && (
          <EmptyState title="No subscriptions added. Add your fixed monthly costs here." />
        )}

        {state.status === "ready" && state.data.length > 0 && (
          <div className="card -mx-0 overflow-x-auto" style={{ padding: 0 }}>
            <table className="w-full min-w-[640px]" style={{ fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th
                    className="px-5 py-3 text-left"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    Name
                  </th>
                  <th
                    className="px-5 py-3 text-right"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    Amount/mo
                  </th>
                  <th
                    className="px-5 py-3 text-right"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    Day
                  </th>
                  <th
                    className="px-5 py-3 text-left"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    Category
                  </th>
                  <th
                    className="px-5 py-3 text-right"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.data.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderTop: "1px solid #1a1a1a",
                    }}
                  >
                    <td
                      className="px-5 py-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {s.name}
                    </td>
                    <td
                      className="mono px-5 py-3 text-right"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <MoneyText value={s.monthly_amount_usd} />
                    </td>
                    <td
                      className="mono px-5 py-3 text-right"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {s.billing_day}
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {s.category}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setEditing({ ...s })}
                        className="mr-4 hover:underline"
                        style={{ fontSize: 12, color: "var(--brand)" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="hover:underline"
                        style={{ fontSize: 12, color: "var(--text-muted)" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-md p-6"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                color: "var(--text-primary)",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.012em",
              }}
            >
              Edit subscription
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
              className="mt-6 flex flex-col gap-3"
            >
              <input
                required
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                className="field-input"
              />
              <input
                required
                inputMode="decimal"
                pattern="^\d+(\.\d{1,2})?$"
                value={editing.monthly_amount_usd}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    monthly_amount_usd: e.target.value,
                  })
                }
                className="field-input tabular"
              />
              <input
                required
                type="number"
                min={1}
                max={28}
                value={editing.billing_day}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    billing_day: Number(e.target.value),
                  })
                }
                className="field-input tabular"
              />
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
                className="field-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex gap-3">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
