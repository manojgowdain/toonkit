import type { Metadata } from "next";
import { Container, Typography, Link } from "@mui/material";
import { SEO_DESCRIPTORS, SEO_KEYWORDS } from "../seoKeywords";

export const metadata: Metadata = {
  title: "Manoj Gowda - Toonkit2 Creator and JavaScript Developer",
  description:
    "Meet Manoj Gowda, creator of Toonkit2 and open-source JavaScript developer tools, including SSDiskDB and PGBloom.",
  keywords: SEO_KEYWORDS,
  other: {
    "seo-descriptors": SEO_DESCRIPTORS.join(" | "),
  },
};

export default function Page() {
  return (
    <Container sx={{ mt: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, lineHeight: 1.1 }}
      >
        Manoj Gowda
      </Typography>
      <Typography sx={{ mt: 1.5, maxWidth: 560, fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.7 }}>
        Creator of toonkit2 and developer tools that simplify development.
      </Typography>

      <Link href="https://github.com/ManojGowda89" sx={{ display: "inline-block", mt: 2 }}>
        GitHub
      </Link>
      <Typography sx={{ mt: 3, lineHeight: 1.8 }}>
        Explore my other projects:{" "}
        <Link href="https://ssdiskdb.js.org/" target="_blank">SSDiskDB</Link>
        {" · "}
        <Link href="https://pgbloom.iotkit.in/" target="_blank">PGBloom</Link>
      </Typography>
    </Container>
  );
}