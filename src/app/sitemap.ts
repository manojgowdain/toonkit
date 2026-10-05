export const dynamic = "force-static";
export const revalidate = 0;

export default function sitemap() {
  const domains = [
    "https://toonkit.js.org",
    "https://toonkit.js.org",
  ];
  const pages = [
    "",
    "/docs",
    "/playground",
    "/api-simulator",
    "/developer",
    "/examples",
    "/seo",
    "/seo/toon-javascript-toolkit",
    "/seo/toon-lightweight-utilities",
    "/seo/toon-frontend-backend-workflows",
    "/seo/toon-scalable-javascript-tools",
    "/seo/toon-open-source-toolkit",
    "/seo/toon-reusable-helper-functions",
    "/seo/toon-performance-utilities",
    "/seo/toon-modern-framework-support",
    "/seo/toon-developer-ecosystem",
    "/seo/toon-fast-scalable-utilities",
  ];

  const entries = [];
  for (const domain of domains) {
    for (const page of pages) {
      entries.push({
        url: `${domain}${page}`,
        lastModified: new Date(),
        priority: domain === "https://toonkit.js.org" ? 1.0 : 0.9,
      });
    }
  }

  return entries;
}
