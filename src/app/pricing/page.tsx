import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { PublicTopStrip } from "@/components/PublicTopStrip";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bone">
      <PublicTopStrip />
      <PublicNav />

      <section
        className="mx-auto max-w-ft px-6"
        style={{ paddingTop: "80px", paddingBottom: "80px" }}
      >
        <p className="cat-label">Pricing</p>
        <h1
          className="font-display mt-3 text-ink"
          style={{
            fontSize: "clamp(2.25rem, 4vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.012em",
          }}
        >
          Two plans. No surprises.
        </h1>
        <p className="ui-sans mt-3 max-w-xl text-[16px] text-ink-muted">
          14 days of Pro on signup. No card required.
        </p>

        <div className="ui-sans mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="border border-rule bg-white p-8">
            <p className="cat-label-muted">Free</p>
            <p
              className="font-display tabular mt-2 text-ink"
              style={{
                fontSize: "44px",
                lineHeight: 1.05,
                letterSpacing: "-0.012em",
              }}
            >
              $0
            </p>
            <ul className="mt-6 space-y-2 text-[14px] text-ink-soft">
              <li className="flex gap-2">
                <span className="text-ink-muted">—</span>1 provider connection
              </li>
              <li className="flex gap-2">
                <span className="text-ink-muted">—</span>Manual sync
              </li>
              <li className="flex gap-2">
                <span className="text-ink-muted">—</span>Monthly summary
              </li>
            </ul>
            <Link href="/signup" className="btn-secondary mt-8">
              Sign up
            </Link>
          </div>

          <div className="border border-rule bg-white p-8">
            <p className="cat-label">Most popular</p>
            <p className="cat-label-muted mt-3">Pro</p>
            <p
              className="font-display tabular mt-2 text-ink"
              style={{
                fontSize: "44px",
                lineHeight: 1.05,
                letterSpacing: "-0.012em",
              }}
            >
              $19
              <span className="ui-sans text-[16px] text-ink-muted">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-[14px] text-ink-soft">
              {[
                "Unlimited connections",
                "Daily auto-sync",
                "Idle resource detection",
                "Token-spend recommendations",
                "Excel export",
                "Spending alerts (WhatsApp + Telegram)",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-ink-muted">—</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary mt-8">
              Start 14-day trial
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
