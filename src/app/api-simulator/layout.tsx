import type { Metadata } from "next";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "../seoKeywords";

export const metadata: Metadata = {
  title: "TOON API Simulator - JSON Payload Compression Demo - Toonkit2",
  description:
    "Try the Toonkit2 TOON API simulator with realistic JSON and TOON payloads, serialization examples, response parsing, and compact bandwidth comparisons.",
  keywords: SEO_KEYWORDS,
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },
};

export default function ApiSimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
