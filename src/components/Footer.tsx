import Link from "next/link";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, mt: 6, textAlign: "center", color: "text.secondary" }}>
      <Typography variant="body2">
        Official documentation: {" "}
        <Link href="https://toonkit.js.org" target="_blank" rel="noopener noreferrer">toonkit.js.org</Link>
        {" • "}
        <Link href="https://www.npmjs.com/package/toonkit2" target="_blank" rel="noopener noreferrer">npm: toonkit2</Link>
        {" • "}
        <Link href="https://jsr.io/@manojgowdain/toonkit2" target="_blank" rel="noopener noreferrer">JSR: toonkit2</Link>
        {" • "}
        <Link href="https://manojgowda.in" target="_blank" rel="noopener noreferrer">Manoj Gowda</Link>
      </Typography>
    </Box>
  );
}
