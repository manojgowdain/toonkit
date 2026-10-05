import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SEO_KEYWORDS, SEO_DESCRIPTORS } from "../../seoKeywords";
import { SEO_LANDING_PAGES } from "../seoPages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getSeoPage(slug: string) {
  return SEO_LANDING_PAGES.find((page) => page.slug === slug);
}

export function generateStaticParams() {
  return SEO_LANDING_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    return {
      title: "SEO Page Not Found - Toonkit2",
      description: "The requested SEO page could not be found.",
    };
  }

  return {
    title: `${page.title} - Toonkit2`,
    description: page.description,
    keywords: [...SEO_KEYWORDS, page.focusKeyword],
    other: {
      "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
    },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 8 }}>{page.title}</h1>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>{page.description}</p>
      <p style={{ lineHeight: 1.7 }}>
        Focus keyword: <strong>{page.focusKeyword}</strong>
      </p>
    </main>
  );
}
