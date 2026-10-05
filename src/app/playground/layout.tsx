import type { Metadata } from "next";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "../seoKeywords";

export const metadata: Metadata = {
  title: "TOON Playground - Convert JSON to TOON Online - Toonkit2",
  description:
    "Use the official Toonkit2 TOON playground to convert JSON to TOON and TOON to JSON online, test typed data examples, and compare compact payload sizes.",
  keywords: SEO_KEYWORDS,
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
