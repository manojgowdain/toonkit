import sectionData from "./sections.json";

export type DocsSection = (typeof sectionData)[number];
export const DOCS_SECTIONS = sectionData satisfies DocsSection[];

export function getDocsSection(slug: string) {
  return DOCS_SECTIONS.find((section) => section.slug === slug);
}
