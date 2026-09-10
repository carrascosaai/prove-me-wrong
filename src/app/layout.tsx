import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Track } from "@/components/Track";
import { ADSENSE_CLIENT, SITE_URL } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PROVE ME WRONG.",
    template: "%s — PROVE ME WRONG",
  },
  description: "Say it now. Prove it later. Make a public prediction and let the future settle it.",
  openGraph: {
    title: "PROVE ME WRONG.",
    description: "Say it now. Prove it later.",
    url: SITE_URL,
    siteName: "PROVE ME WRONG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROVE ME WRONG.",
    description: "Say it now. Prove it later.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PROVE ME WRONG",
    url: SITE_URL,
    description: "Say it now. Prove it later.",
  };

  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Track />
        {ADSENSE_CLIENT ? (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        ) : null}
      </body>
    </html>
  );
}
