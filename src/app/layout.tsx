import type { Metadata } from "next";
import { Inter, Playfair_Display, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${sourceSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
