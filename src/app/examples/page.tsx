import type { Metadata } from "next";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "../seoKeywords";

export const metadata: Metadata = {
  title: "TOON JavaScript Examples and Integrations - Toonkit2",
  description:
    "Explore Toonkit2 examples for JSON to TOON conversion, TOON parsing, typed rows, tagged templates, API payloads, and Express, Fastify, Hono, and Next.js integrations.",
  keywords: SEO_KEYWORDS,
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },
};

const ExamplesPage = () => {
  return (
    <div style={{ padding: "32px 16px", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", lineHeight: 1.1, marginBottom: 12 }}>
        Examples
      </h1>
      <p style={{ maxWidth: 640, lineHeight: 1.7, color: "#666" }}>
        Example workflows and integrations are coming soon. The page is already sized for narrow screens so it remains readable on mobile.
      </p>
    </div>
  );
};

export default ExamplesPage;