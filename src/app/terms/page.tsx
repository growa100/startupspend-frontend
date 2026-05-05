import { PublicNav } from "@/components/PublicNav";
import { PublicTopStrip } from "@/components/PublicTopStrip";

export const metadata = {
  title: "Terms — StartupSpend",
  description: "StartupSpend terms of service.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bone">
      <PublicTopStrip />
      <PublicNav />

      <section
        className="mx-auto max-w-3xl px-6"
        style={{ paddingTop: "64px", paddingBottom: "96px" }}
      >
        <p className="cat-label">Policy</p>
        <h1
          className="font-display mt-3 text-ink"
          style={{
            fontSize: "clamp(2.25rem, 4vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.012em",
          }}
        >
          Terms
        </h1>
        <p className="ui-sans mt-3 text-[13px] text-ink-muted">
          Last updated 2026-05-05.
        </p>

        <article className="article-body mt-10 text-ink-soft">
          <H2>Service</H2>
          <p>
            StartupSpend aggregates your cloud and AI provider spend. We make
            the dashboard work as described and respond to outages quickly. We
            don&apos;t guarantee that our cost numbers exactly match what your
            providers will eventually invoice.
          </p>

          <H2>Account</H2>
          <p>
            You&apos;re responsible for the API tokens you connect and the
            security of your account. Don&apos;t share your password.
          </p>

          <H2>Billing</H2>
          <p>
            14 days of Pro on signup, no card. After that, $19/month if you
            subscribe. Cancel anytime through the customer portal — your
            subscription continues to the end of the paid period.
          </p>

          <H2>Liability</H2>
          <p>
            We&apos;re a small operation. The service is provided as-is. Our
            maximum liability for any claim is the amount you paid us in the
            last 12 months.
          </p>

          <H2>Changes</H2>
          <p>
            We&apos;ll email account holders before changing these terms in
            any material way.
          </p>

          <H2>Contact</H2>
          <p>
            <a
              className="text-accent underline-offset-4 hover:underline"
              href="mailto:hello@startupspend.cloud"
            >
              hello@startupspend.cloud
            </a>
          </p>
        </article>
      </section>
    </main>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display mt-10 text-ink"
      style={{ fontSize: "22px", letterSpacing: "-0.012em" }}
    >
      {children}
    </h2>
  );
}
