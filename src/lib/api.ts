import { createBrowserClient } from "@supabase/ssr";

/**
 * Resolved at module load. Order:
 *   1. NEXT_PUBLIC_API_URL          — current prod env-var name on Vercel.
 *   2. NEXT_PUBLIC_API_BASE_URL     — legacy name, kept for any old preview
 *                                     deploys still wired this way.
 *   3. https://api.startupspend.cloud  — production fallback. NEVER falls
 *                                     back to localhost: a Vercel-hosted
 *                                     page targeting localhost just hangs.
 *
 * Each access is a literal `process.env.NEXT_PUBLIC_*` so Next's bundler
 * can statically inline the value at build time.
 */
export const API_BASE: string =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.startupspend.cloud";

// Hardcoded Supabase fallbacks mirror lib/supabase/client.ts. The anon key
// is designed to be public — security comes from RLS, not key secrecy.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://vujpmkpkeomchblaygxn.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1anBta3BrZW9tY2hibGF5Z3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTgzOTYsImV4cCI6MjA5MzQ3NDM5Nn0.NGQoLubtwYjeYu4K00R2MgZXUabMtSWgG1Ej9KM569Y";

/**
 * Single browser-client instance per page load. Lazy so this module is
 * safe to import from anywhere — server-side callers see null and
 * continue without an Authorization header (the backend returns 401, the
 * caller surfaces an ApiError; we never leave a fetch hanging).
 */
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;
function getBrowserClient(): ReturnType<typeof createBrowserClient> | null {
  if (typeof window === "undefined") return null;
  if (_browserClient) return _browserClient;
  _browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _browserClient;
}

async function getAccessToken(): Promise<string | null> {
  const client = getBrowserClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[api] supabase getSession error:", error.message);
      return null;
    }
    return data.session?.access_token ?? null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[api] supabase getSession threw:", e);
    return null;
  }
}

async function authedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  // No session? Still make the call — let the backend return 401 so the
  // caller can surface a real error instead of a hang.
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const r = await authedFetch(path, { method: "GET" });
  if (!r.ok) throw new ApiError(r.status, await safeDetail(r));
  return r.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const r = await authedFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new ApiError(r.status, await safeDetail(r));
  if (r.status === 204) return undefined as T;
  return r.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const r = await authedFetch(path, { method: "PATCH", body: JSON.stringify(body) });
  if (!r.ok) throw new ApiError(r.status, await safeDetail(r));
  return r.json();
}

export async function apiDelete(path: string): Promise<void> {
  const r = await authedFetch(path, { method: "DELETE" });
  if (!r.ok) throw new ApiError(r.status, await safeDetail(r));
}

export async function apiDownload(path: string): Promise<Blob> {
  const r = await authedFetch(path, { method: "GET" });
  if (!r.ok) throw new ApiError(r.status, await safeDetail(r));
  return r.blob();
}

async function safeDetail(r: Response): Promise<string> {
  try {
    const j = await r.json();
    return j.detail ?? r.statusText;
  } catch {
    return r.statusText;
  }
}

// === Typed endpoints ===

export type Me = {
  id: string;
  email: string | null;
  is_admin: boolean;
};

export type Connection = {
  id: string;
  provider: string;
  display_name: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  created_at: string;
};

export type Provider = {
  name: string;
  display_name: string;
  docs_url: string;
  coming_soon: boolean;
  credential_fields: {
    name: string;
    label: string;
    placeholder: string;
    secret: boolean;
    help_url: string | null;
  }[];
};

export type MonthSummary = {
  month: string;
  today: string;
  total_usd: string;
  actual_to_date_usd: string;
  projected: {
    low_usd: string;
    expected_usd: string;
    high_usd: string;
    confidence: "low" | "medium" | "high";
    components: {
      actual_to_date: string;
      variable_projection: string;
      unbilled_subscriptions: string;
    };
  };
  anomaly: {
    yesterday_usd: string;
    mean_usd: string;
    sigma_usd: string;
    threshold_usd: string;
    z_score: number;
  } | null;
  daily: { date: string; amount_usd: string }[];
  // Optional — present when the backend is on the post-redesign build.
  // Frontend must not crash when it's missing.
  daily_by_provider?: {
    date: string;
    total: string;
    providers: { provider: string; display_name: string; amount: string }[];
  }[];
  by_category: { category: string; amount_usd: string }[];
  by_provider: { provider: string; display_name: string; amount_usd: string }[];
  subscriptions: {
    items: {
      id: string;
      name: string;
      monthly_amount_usd: string;
      billing_day: number;
      next_billing_date: string;
      billed_this_month: boolean;
    }[];
    billed_this_month_usd: string;
    unbilled_this_month_usd: string;
    monthly_total_usd: string;
  };
  has_connections: boolean;
  generated_at: string;
};

export type HistoryPeriod = {
  label: string;
  period_start: string;
  period_end: string;
  total_usd: string;
  by_provider: { provider: string; display_name: string; amount_usd: string }[];
  by_category: { category: string; amount_usd: string }[];
  // Optional — present when the backend is on the post-redesign build.
  daily?: {
    date: string;
    total: string;
    providers: { provider: string; amount: string }[];
  }[];
  vs_previous_pct: number | null;
  is_current: boolean;
};

export type History = {
  period: "week" | "month" | "quarter" | "year";
  months_back: number;
  periods: HistoryPeriod[];
  trend: "up" | "down" | "flat";
  avg_monthly_usd: string;
  highest_month: { label: string; total_usd: string } | null;
  lowest_month: { label: string; total_usd: string } | null;
  yoy_change_pct: number | null;
  has_connections: boolean;
};

export type Resource = {
  connection_id: string;
  resource_id: string;
  resource_type: string;
  days_observed: number;
  avg_cpu_pct: string | null;
  avg_net_in_bytes: number | null;
  avg_net_out_bytes: number | null;
  classification: "idle" | "underused" | "active";
};

export type ResourcesResponse = {
  items: Resource[];
  has_metrics: boolean;
  connection_count: number;
};

export type FlatSubscription = {
  id: string;
  name: string;
  monthly_amount_usd: string;
  billing_day: number;
  category: string;
  is_active: boolean;
  created_at: string;
};

/* === Admin types === */

export type AdminAgentStatus = {
  agent: string;
  enabled: boolean;
  last_run_at: string | null;
  last_run_status: "success" | "error" | "never" | string;
  last_run_summary: string | null;
  next_scheduled_at: string | null;
};

export type AdminAgentLog = {
  id: string;
  agent: string;
  job_name: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  status: string;
  summary: string | null;
};

export type AdminSyncHealthRow = {
  provider: string;
  total: number;
  success: number;
  error: number;
  success_rate: number;
  last_error: string | null;
};

export type AdminDeployLogRow = {
  id: string;
  commit_sha: string;
  deployed_at: string;
  triggered_by: string;
  pr_url: string | null;
  success: boolean;
};

export type AdminSalesStats = {
  leads_total: number;
  qualified: number;
  drafted: number;
  sent_this_month: number;
};

export type AdminOutreachEmail = {
  id: string;
  lead_id: string;
  lead_name: string | null;
  lead_email: string | null;
  trigger_excerpt: string | null;
  total_score: string | null;
  sequence_number: number;
  subject: string;
  body: string;
  scheduled_for: string | null;
  sent_at: string | null;
  status: string;
  opened_at: string | null;
  replied_at: string | null;
  created_at: string;
};

export type AdminDoNotContact = {
  email: string;
  reason: string | null;
  added_at: string;
};

export type AdminContentDraft = {
  id: string;
  platform: "x" | "linkedin" | "reddit" | string;
  scheduled_for: string;
  content: string;
  status: string;
  posted_url: string | null;
  posted_at: string | null;
  created_at: string;
};

export type AdminQualityMetric = {
  metric_name: string;
  current_value: number;
  unit: string | null;
  status: "ok" | "warning" | "critical";
  history: { recorded_at: string; value: number }[];
};

export type AdminQualityAlert = {
  id: string;
  sent_at: string;
  metric: string;
  value: number;
  channel: string;
};

export type AdminMrr = {
  current_mrr: number;
  last_month_mrr: number;
  trial_conversions_this_month: number;
  history: { month: string; mrr: number }[];
};

export type AdminFinanceReport = {
  generated_at: string | null;
  body: string | null;
};

export type AdminOpsRun = {
  id: string;
  job_name: string;
  classification: string | null;
  pr_url: string | null;
  status: string | null;
  summary: string | null;
  started_at: string;
  finished_at: string | null;
};

export type AdminOpsState = {
  enabled: boolean;
  paused_reason: string | null;
  paused_at: string | null;
};
