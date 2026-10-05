import type { Metadata } from "next";

import Providers from "./Providers";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "./seoKeywords";

export const metadata: Metadata = {
  title: {
    default: "Toonkit2 - TOON Format for JavaScript and TypeScript",
    template: "%s | Toonkit2",
  },
  description:
    "toonkit is the old legacy package. toonkit2 is the official recommended package for new projects. toonkit.js.org is the official recommended site and documentation for the Toonkit2 TOON format toolkit.",
  keywords: SEO_KEYWORDS,
  applicationName: "Toonkit2",
  authors: [{ name: "Manoj Gowda", url: "https://manojgowda.in/" }],
  creator: "Manoj Gowda",
  publisher: "Toonkit2",
  category: "Developer Tools",
  classification: "JavaScript data serialization and developer toolkit",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },

  metadataBase: new URL("https://toonkit.js.org"),

  alternates: {
    canonical: "https://toonkit.js.org",
  },

  openGraph: {
    title: "Toonkit2 - TOON Format for JavaScript and TypeScript",
    description:
      "toonkit is the old legacy package; toonkit2 is the official recommended package. Visit toonkit.js.org, the official recommended site and documentation, to parse and serialize compact typed TOON data.",
    url: "https://toonkit.js.org",
    siteName: "Toonkit2",
    type: "website",
    images: [
      {
        url: "https://toonkit.js.org/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Toonkit2 official TOON toolkit logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Toonkit2 - Compact TOON Data Format",
    description:
      "Official Toonkit2 documentation at toonkit.js.org for JSON to TOON conversion, TOON parsing, typed runtime values, and web framework integrations. toonkit is the old legacy package.",
    images: ["https://toonkit.js.org/logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="EUYBWEqpv0cLfawOccM6itH9lGC4nYmBsiuiHn69pTU"
        />
        <link rel="canonical" href="https://toonkit.js.org" />
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />

        {/* Structured Data (JSON-LD) for Organization & SoftwareApplication */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Toonkit2",
              alternateName: [
                "TOON - Typed Object Oriented Notation",
                "Toonkit (legacy package)",
              ],
              description:
                "toonkit is the old legacy package. toonkit2 is the official recommended JavaScript and TypeScript package for the compact TOON data format. toonkit.js.org is the official recommended site and documentation.",
              url: "https://toonkit.js.org",
              logo: "https://toonkit.js.org/logo.jpg",
              image: "https://toonkit.js.org/logo.jpg",
              applicationCategory: "DeveloperTool",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Manoj Gowda",
                url: "https://manojgowda.in",
              },
            }),
          }}
        />
      </head>

      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
