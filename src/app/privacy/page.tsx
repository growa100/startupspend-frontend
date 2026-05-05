import { PublicNav } from "@/components/PublicNav";
import { PublicTopStrip } from "@/components/PublicTopStrip";

export const metadata = {
  title: "Privacy — StartupSpend",
  description: "How StartupSpend handles your data.",
};

export default function PrivacyPage() {
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
          Privacy
        </h1>
        <p className="ui-sans mt-3 text-[13px] text-ink-muted">
          Last updated 2026-05-05.
        </p>

        <article className="article-body mt-10 text-ink-soft">
          <H2>What we collect</H2>
          <p>
            Your email and a hashed password (handled by Supabase Auth). The
            API tokens you connect — encrypted at rest and only decrypted in
            memory while a sync runs. The cost data those tokens return (line
            items, dates, dollar amounts).
          </p>

          <H2>What we don&apos;t collect</H2>
          <p>
            We don&apos;t track your visits across the web, send your data to
            third-party analytics, or sell anything to advertisers.
          </p>

          <H2>Where it lives</H2>
          <p>
            Postgres on Supabase (EU/US region per the project setting).
            Backups encrypted at rest in Backblaze B2. Logs in Sentry, scrubbed
            of credentials.
          </p>

          <H2>Subprocessors</H2>
          <ul className="ui-sans mt-3 list-disc space-y-1 pl-6 text-[15px]">
            <li>Supabase — auth + database</li>
            <li>Vercel — frontend hosting</li>
            <li>DigitalOcean — backend VM</li>
            <li>Stripe — payments</li>
            <li>Infomaniak — email + DNS</li>
            <li>Backblaze B2 — backups</li>
            <li>Sentry — error tracking</li>
            <li>
              OpenAI, Anthropic — only when their cost APIs are queried on
              your behalf
            </li>
          </ul>

          <H2>Your rights</H2>
          <p>
            Email{" "}
            <a
              className="text-accent underline-offset-4 hover:underline"
              href="mailto:hello@startupspend.cloud"
            >
              hello@startupspend.cloud
            </a>{" "}
            to delete your account, export your data, or request a copy of
            what we hold.
          </p>

          <H2>Cookies</H2>
          <p>
            A first-party session cookie from Supabase. No marketing cookies,
            no ads, no third-party trackers.
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
