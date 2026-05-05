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

      <p className="mb-6 max-w-2xl text-[14px] text-ink-muted">
        Monthly tools without a billing API. Vercel Pro, GitHub Team, ChatGPT
        Plus — anything you want included in projections.
      </p>

      <form
        onSubmit={add}
        className="grid grid-cols-1 gap-3 border-t border-rule pt-6 sm:grid-cols-12"
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
          <p className="border-l-2 border-negative pl-3 text-[13px] text-negative sm:col-span-12">
            {err}
          </p>
        )}
      </form>

      <div className="mt-10">
        {state.status === "loading" && (
          <div className="space-y-3 border-t border-rule pt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-baseline justify-between border-b border-rule pb-3"
              >
                <SkeletonLine className="h-4 w-40" />
                <SkeletonLine className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {state.status === "error" && (
          <p className="border-l-2 border-negative pl-3 text-[13px] text-negative">
            {state.message}
          </p>
        )}

        {state.status === "ready" && state.data.length === 0 && (
          <EmptyState title="No subscriptions added. Add your fixed monthly costs here." />
        )}

        {state.status === "ready" && state.data.length > 0 && (
          <div className="-mx-6 overflow-x-auto px-6">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="border-b border-rule">
                  <th className="cat-label-muted py-3 text-left font-normal">
                    Name
                  </th>
                  <th className="cat-label-muted py-3 text-right font-normal tabular">
                    Amount/mo
                  </th>
                  <th className="cat-label-muted py-3 text-right font-normal tabular">
                    Day
                  </th>
                  <th className="cat-label-muted py-3 text-left font-normal">
                    Category
                  </th>
                  <th className="cat-label-muted py-3 text-right font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.data.map((s) => (
                  <tr key={s.id} className="border-b border-rule">
                    <td className="py-3 text-ink">{s.name}</td>
                    <td className="py-3 text-right text-ink">
                      <MoneyText value={s.monthly_amount_usd} />
                    </td>
                    <td className="py-3 text-right tabular text-ink-muted">
                      {s.billing_day}
                    </td>
                    <td className="py-3 text-ink-muted">{s.category}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setEditing({ ...s })}
                        className="mr-4 text-[12px] text-accent underline-offset-4 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="text-[12px] text-ink-muted underline-offset-4 hover:text-negative hover:underline"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-md bg-bone p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="font-display text-ink"
              style={{ fontSize: "24px", letterSpacing: "-0.012em" }}
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
