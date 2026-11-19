import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/config/site";

const siteUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3300";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${brand.name} — Factures et devis pour freelances`, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  openGraph: {
    title: `${brand.name} — Factures et devis pour freelances`,
    description: brand.description,
    locale: "fr_FR",
    type: "website",
    siteName: brand.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f5f8fd", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
