import type { Metadata } from "next";
import Link from "next/link";

import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "../seoKeywords";
import { SEO_LANDING_PAGES } from "./seoPages";

export const metadata: Metadata = {
  title: "TOON Format SEO Guide and JavaScript Resources - Toonkit2",
  description:
    "Explore official Toonkit2 resources for the TOON format, compact JSON alternatives, JavaScript and TypeScript serialization, API payloads, and developer integrations.",
  keywords: SEO_KEYWORDS,
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },
};

export default function SeoIndexPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 8 }}>Toon SEO Pages</h1>
      <p style={{ lineHeight: 1.7, marginBottom: 24 }}>
        These pages are intentionally created to target Toon and Toonkit search keywords.
      </p>

      <ul style={{ display: "grid", gap: 12, paddingLeft: 20 }}>
        {SEO_LANDING_PAGES.map((page) => (
          <li key={page.slug}>
            <Link href={`/seo/${page.slug}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
