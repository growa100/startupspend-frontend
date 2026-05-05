import Link from "next/link";
import { ProviderBadge, PROVIDER_BADGE_KEYS } from "@/components/ProviderBadge";
import { SampleHero } from "@/components/SampleHero";
import { PublicNav } from "@/components/PublicNav";
import { PublicTopStrip } from "@/components/PublicTopStrip";

const PROVIDER_LABELS: Record<string, string> = {
  digitalocean: "DigitalOcean",
  azure: "Azure",
  exoscale: "Exoscale",
  openai: "OpenAI",
  anthropic: "Anthropic",
  aws: "AWS",
  gcp: "Google Cloud",
  hetzner: "Hetzner",
  vercel: "Vercel",
  netlify: "Netlify",
  github: "GitHub",
  stripe: "Stripe Fees",
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bone">
      <PublicTopStrip />
      <PublicNav />

      {/* HERO — white background, 80px top/bottom padding */}
      <section className="bg-white">
        <div
          className="mx-auto grid max-w-ft grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="lg:col-span-7">
            <p className="cat-label">For indie founders</p>
            <h1
              className="font-display mt-4 text-ink"
              style={{
                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.012em",
              }}
            >
              Know exactly where your money is going.
            </h1>
            <p className="ui-sans mt-6 max-w-xl text-[18px] leading-relaxed text-ink-muted">
              One dashboard for every cloud provider, AI API, and SaaS tool
              you pay for.
            </p>

            <div className="ui-sans mt-8 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn-primary">
                Start tracking
              </Link>
              <Link href="/pricing" className="btn-secondary">
                See pricing
              </Link>
            </div>

            <p className="ui-sans mt-4 text-[11px] text-ink-muted">
              Free for one provider. No credit card.
            </p>
          </div>

          <div className="lg:col-span-5">
            <SampleHero />
          </div>
        </div>
      </section>

      <hr className="hr-rule" />

      {/* WHY STARTUPSPEND — three feature columns */}
      <section
        className="mx-auto max-w-ft px-6"
        style={{ paddingTop: "64px", paddingBottom: "64px" }}
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <Reason
            label="Every provider"
            headline="One number, every cloud."
            body="DigitalOcean, AWS, Azure, GCP, Hetzner, Vercel, Netlify, OpenAI, Anthropic, and more. Connect a key, see the cost."
          />
          <Reason
            label="Idle resources"
            headline="Stop paying for nothing."
            body="Detect VMs and services you're paying for but not using. Get alerted before it compounds."
          />
          <Reason
            label="Token spend"
            headline="AI costs, optimized."
            body="Track spend per model, per day. Get specific advice on switching models or enabling caching."
          />
        </div>
      </section>

      <hr className="hr-rule" />

      {/* PROVIDERS — 5-col grid */}
      <section
        className="mx-auto max-w-ft px-6"
        style={{ paddingTop: "64px", paddingBottom: "64px" }}
      >
        <p className="cat-label">Supported providers</p>
        <h2
          className="font-display mt-3 text-ink"
          style={{ fontSize: "32px", lineHeight: 1.15, letterSpacing: "-0.012em" }}
        >
          Connect any of these in under a minute.
        </h2>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {PROVIDER_BADGE_KEYS.map((p) => (
            <li
              key={p}
              className="flex items-center gap-3 border border-rule bg-white px-4 py-3"
              title={PROVIDER_LABELS[p] ?? p}
            >
              <ProviderBadge provider={p} size="md" />
              <span className="ui-sans truncate text-[14px] text-ink">
                {PROVIDER_LABELS[p] ?? p}
              </span>
            </li>
          ))}
        </ul>

        <p className="ui-sans mt-6 text-[14px] text-ink-muted">
          Plus any custom REST billing API via the JSON-config wizard.
        </p>
      </section>

      <hr className="hr-rule" />

      {/* PRICING */}
      <section
        className="mx-auto max-w-ft px-6"
        style={{ paddingTop: "64px", paddingBottom: "64px" }}
      >
        <p className="cat-label">Pricing</p>
        <h2
          className="font-display mt-3 text-ink"
          style={{ fontSize: "32px", lineHeight: 1.15, letterSpacing: "-0.012em" }}
        >
          Two plans. No surprises.
        </h2>
        <p className="ui-sans mt-2 max-w-xl text-[14px] text-ink-muted">
          14 days of Pro on signup. No card required.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <PriceCard
            kicker="Free"
            price="$0"
            cadence=""
            features={[
              "1 provider connection",
              "Manual sync",
              "Monthly summary",
            ]}
            cta={{ label: "Sign up", href: "/signup" }}
            popular={false}
          />
          <PriceCard
            kicker="Pro"
            price="$19"
            cadence="/mo"
            features={[
              "Unlimited connections",
              "Daily auto-sync",
              "Idle resource detection",
              "Token-spend recommendations",
              "Excel export",
              "Spending alerts (WhatsApp + Telegram)",
            ]}
            cta={{ label: "Start 14-day trial", href: "/signup" }}
            popular
          />
        </div>
      </section>

      <hr className="hr-rule" />

      {/* PULL QUOTE */}
      <section
        className="mx-auto max-w-3xl px-6 text-center"
        style={{ paddingTop: "80px", paddingBottom: "80px" }}
      >
        <p
          className="font-display italic text-ink"
          style={{
            fontSize: "28px",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          &ldquo;I was shocked by my cloud bill. This showed me exactly why
          in five minutes.&rdquo;
        </p>
        <p className="ui-sans mt-6 text-[13px] text-ink-muted">
          — Indie founder, Paris
        </p>
      </section>

      {/* FOOTER — dark */}
      <footer className="bg-dark-strip text-white">
        <div
          className="mx-auto grid max-w-ft grid-cols-1 gap-8 px-6 md:grid-cols-3"
          style={{ paddingTop: "40px", paddingBottom: "40px" }}
        >
          <div>
            <span className="font-display text-[22px] text-white">
              StartupSpend
            </span>
            <p className="ui-sans mt-2 text-[13px] text-white/60">
              Cost aggregation for indie founders.
            </p>
          </div>
          <nav className="ui-sans flex flex-wrap items-baseline gap-5 text-[13px]">
            <Link href="/dashboard" className="text-white hover:text-white/70">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-white hover:text-white/70">
              Pricing
            </Link>
            <Link href="/privacy" className="text-white hover:text-white/70">
              Privacy
            </Link>
            <Link href="/terms" className="text-white hover:text-white/70">
              Terms
            </Link>
          </nav>
          <p className="ui-sans text-[13px] text-white/60 md:text-right">
            Made by a founder, for founders.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =================================================================
 * SUB-COMPONENTS
 * ================================================================= */

function Reason({
  label,
  headline,
  body,
}: {
  label: string;
  headline: string;
  body: string;
}) {
  return (
    <div>
      <p className="cat-label">{label}</p>
      <h3
        className="font-display mt-3 text-ink"
        style={{ fontSize: "22px", lineHeight: 1.2, letterSpacing: "-0.012em" }}
      >
        {headline}
      </h3>
      <p className="ui-sans mt-3 text-[16px] leading-relaxed text-ink-muted">
        {body}
      </p>
    </div>
  );
}

function PriceCard({
  kicker,
  price,
  cadence,
  features,
  cta,
  popular,
}: {
  kicker: string;
  price: string;
  cadence: string;
  features: string[];
  cta: { label: string; href: string };
  popular: boolean;
}) {
  return (
    <div
      className={
        "border border-rule bg-white p-8 " +
        (popular ? "" : "")
      }
    >
      {popular && <p className="cat-label mb-3">Most popular</p>}
      <p className="ui-sans text-[12px] uppercase tracking-[0.05em] text-ink-muted">
        {kicker}
      </p>
      <p
        className="font-display tabular text-ink"
        style={{
          fontSize: "44px",
          lineHeight: 1.05,
          letterSpacing: "-0.012em",
        }}
      >
        {price}
        {cadence && (
          <span className="ui-sans text-[16px] text-ink-muted">{cadence}</span>
        )}
      </p>
      <ul className="ui-sans mt-6 space-y-2 text-[14px] text-ink-soft">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-ink-muted">—</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className={"mt-8 " + (popular ? "btn-primary" : "btn-secondary")}
      >
        {cta.label}
      </Link>
    </div>
  );
}
