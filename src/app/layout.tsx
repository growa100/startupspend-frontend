import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StartupSpend",
  description:
    "One dashboard for every cloud provider, AI API, and SaaS tool you pay for.",
  metadataBase: new URL("https://startupspend.cloud"),
  openGraph: {
    title: "StartupSpend",
    description:
      "One dashboard for every cloud provider, AI API, and SaaS tool you pay for.",
    url: "https://startupspend.cloud",
    siteName: "StartupSpend",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// Inline script — runs before paint to set the theme attribute. Default
// is dark; users who explicitly opted into light keep that preference.
const noFlashTheme = `
(function () {
  try {
    var saved = localStorage.getItem('ss-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
