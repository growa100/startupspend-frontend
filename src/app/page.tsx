import Link from "next/link";
import { ProviderBadge, PROVIDER_BADGE_KEYS } from "@/components/ProviderBadge";
import { SampleHero } from "@/components/SampleHero";
import { PublicNav } from "@/components/PublicNav";
import { PublicTopStrip } from "@/components/PublicTopStrip";
import { ScrollDemo } from "@/components/ScrollDemo";

const SHOWCASE_PROVIDERS = [
  "digitalocean",
  "azure",
  "exoscale",
  "openai",
  "stripe",
  "aws",
  "gcp",
  "anthropic",
  "hetzner",
  "vercel",
  "netlify",
  "github",
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "#000000" }}>
      <PublicTopStrip />
      <PublicNav />

      {/* HERO */}
      <section style={{ background: "#000000" }}>
        <div
          className="mx-auto grid max-w-ft grid-cols-1 items-center gap-12 px-8 lg:grid-cols-12"
          style={{ paddingTop: 96, paddingBottom: 96 }}
        >
          <div className="lg:col-span-7">
            <h1
              className="ui-sans"
              style={{
                fontSize: "clamp(40px, 5vw, 64px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.018em",
                color: "#ffffff",
              }}
            >
              <span style={{ display: "block" }}>Know exactly</span>
              <span style={{ display: "block" }}>where your</span>
              <span style={{ display: "block", color: "#2563eb" }}>
                money goes.
              </span>
            </h1>

            <p
              className="ui-sans"
              style={{
                marginTop: 24,
                fontSize: 18,
                lineHeight: 1.6,
                color: "#a1a1aa",
                maxWidth: 480,
              }}
            >
              One dashboard for every cloud provider, AI API, and SaaS tool you
              pay for. Connect a key, see the cost.
            </p>

            <div
              className="ui-sans flex flex-wrap items-center"
              style={{ marginTop: 32, gap: 12 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center transition-colors"
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "10px 20px",
                  borderRadius: 6,
                  gap: 8,
                }}
              >
                Start tracking <span aria-hidden>→</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center transition-colors"
                style={{
                  background: "transparent",
                  border: "1px solid #262626",
                  color: "#a1a1aa",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "10px 20px",
                  borderRadius: 6,
                }}
              >
                See pricing
              </Link>
            </div>

            <p
              className="ui-sans"
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "#52525b",
              }}
            >
              Free for one provider. No credit card.
            </p>
          </div>

          <div className="lg:col-span-5">
            <SampleHero />
          </div>
        </div>
      </section>

      <ScrollDemo />

      {/* FEATURES */}
      <section id="features" style={{ background: "#000000" }}>
        <div
          className="mx-auto max-w-ft px-8"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ gap: 32 }}
          >
            <Feature
              label="EVERY PROVIDER"
              headline="One number, every cloud."
              body="DigitalOcean, AWS, Azure, GCP, Hetzner, Vercel, Netlify, OpenAI, Anthropic, and more. Connect a key, see the cost."
            />
            <Feature
              label="IDLE RESOURCES"
              headline="Stop paying for nothing."
              body="Detect VMs and services you're paying for but not using. Get alerted before it compounds."
            />
            <Feature
              label="TOKEN SPEND"
              headline="AI costs, optimized."
              body="Track spend per model, per day. Get specific advice on switching models or enabling caching."
            />
          </div>
        </div>
      </section>

      {/* PROVIDER LOGOS ROW */}
      <section style={{ background: "#000000" }}>
        <div
          className="mx-auto max-w-ft px-8"
          style={{ paddingBottom: 80 }}
        >
          <div
            className="flex flex-wrap items-center justify-center"
            style={{ gap: 12 }}
          >
            {SHOWCASE_PROVIDERS.filter((p) =>
              PROVIDER_BADGE_KEYS.includes(p),
            ).map((p) => (
              <ProviderBadge key={p} provider={p} size="lg" />
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ background: "#000000" }}>
        <div
          className="mx-auto max-w-ft px-8 text-center"
          style={{ paddingTop: 80, paddingBottom: 96 }}
        >
          <h2
            className="ui-sans"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.012em",
            }}
          >
            Start tracking in 60 seconds.
          </h2>
          <p
            className="ui-sans"
            style={{
              marginTop: 12,
              fontSize: 16,
              color: "#a1a1aa",
            }}
          >
            Connect your first provider for free. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center transition-colors"
              style={{
                background: "#2563eb",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 500,
                padding: "10px 20px",
                borderRadius: 6,
                gap: 8,
              }}
            >
              Start tracking <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
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
      <p
        className="ui-sans"
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#52525b",
        }}
      >
        {label}
      </p>
      <h3
        className="ui-sans"
        style={{
          marginTop: 8,
          fontSize: 20,
          fontWeight: 600,
          color: "#ffffff",
          letterSpacing: "-0.012em",
        }}
      >
        {headline}
      </h3>
      <p
        className="ui-sans"
        style={{
          marginTop: 8,
          fontSize: 15,
          lineHeight: 1.6,
          color: "#a1a1aa",
        }}
      >
        {body}
      </p>
    </div>
  );
}
