import type { Metadata } from "next";

import Providers from "./Providers";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "./seoKeywords";

export const metadata: Metadata = {
  title: {
    default: "Toonkit2 - TOON Format for JavaScript and TypeScript",
    template: "%s | Toonkit2",
  },
  description:
    "Toonkit2 is the official JavaScript and TypeScript toolkit for parsing and serializing TOON, a compact typed alternative to JSON for APIs, AI payloads, and web applications.",
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
      "Parse and serialize compact typed TOON data in JavaScript and TypeScript with Toonkit2.",
    url: "https://toonkit.js.org",
    siteName: "Toonkit",
    type: "website",
    images: [
      {
        url: "https://toonkit.js.org/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Toonkit Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Toonkit2 - Compact TOON Data Format",
    description:
      "Official Toonkit2 toolkit for JSON to TOON conversion, TOON parsing, typed runtime values, and web framework integrations.",
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
              name: "Toonkit",
              alternateName: "TOON - Typed Object Oriented Notation",
              description:
                "Compact typed alternative to JSON for JavaScript and Node.js applications",
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
