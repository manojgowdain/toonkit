import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ToonkitDocs from "../page";
import { DOCS_SECTIONS, getDocsSection } from "../sections";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DOCS_SECTIONS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = getDocsSection(slug);
  if (!section) return { title: "Documentation page not found - Toonkit2" };

  const url = `https://toonkit.js.org/docs/${section.slug}`;
  return {
    title: `${section.title} - Toonkit2 Documentation`,
    description: section.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: `${section.title} - Toonkit2`, description: section.description, url, type: "article" },
  };
}

export default async function DocsSectionPage({ params }: PageProps) {
  const { slug } = await params;
  const section = getDocsSection(slug);
  if (!section) notFound();
  const url = `https://toonkit.js.org/docs/${section.slug}`;
  const index = DOCS_SECTIONS.findIndex(({ slug: value }) => value === slug);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: section.title,
            description: section.description,
            url,
            isPartOf: { "@type": "WebSite", name: "Toonkit2 Documentation", url: "https://toonkit.js.org/docs" },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Documentation", item: "https://toonkit.js.org/docs" },
                { "@type": "ListItem", position: 2, name: section.title, item: url },
              ],
            },
            publisher: { "@type": "Person", name: "Manoj Gowda", url: "https://manojgowda.in/" },
          }),
        }}
      />
      <ToonkitDocs sectionSlug={DOCS_SECTIONS[index].slug} />
    </>
  );
}
