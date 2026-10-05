import type { Metadata } from "next";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "../seoKeywords";

export const metadata: Metadata = {
  title: "TOON Format Documentation and API Reference - Toonkit2",
  description:
    "Official Toonkit2 documentation for the TOON data format, JSON to TOON conversion, TOON to JSON parsing, data types, helper functions, runtime APIs, and JavaScript framework integrations.",
  keywords: SEO_KEYWORDS,
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
