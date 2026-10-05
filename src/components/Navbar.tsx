"use client";

import Link from "next/link";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { AppBar, Toolbar, Typography, Button, Box, Alert } from "@mui/material";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <>
      <Alert
        severity="info"
        icon={false}
        sx={{
          borderRadius: 0,
          py: 0.25,
          justifyContent: "center",
          textAlign: "center",
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Typography variant="body2">
          <strong>toonkit</strong> is the old legacy package.{" "}
          <Link href="https://www.npmjs.com/package/toonkit2" target="_blank" rel="noopener">
            <strong>toonkit2</strong> is the official recommended package
          </Link>{" "}
            <Link href="https://toonkit.js.org" target="_blank" rel="noopener">
            <strong>toonkit.js.org</strong> is the official recommended Site
          </Link>{" "}
          and this is the official documentation.
        </Typography>
      </Alert>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: "blur(12px)", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, sm: 72 },
            gap: 1,
            flexWrap: "wrap",
            py: 1,
          }}
        >
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{
              flexGrow: 1,
              minWidth: 96,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            toonkit2
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-end" },
              flexWrap: "wrap",
              gap: 0.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button component={Link} href="/" size="small" startIcon={<HomeOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, px: 1.25 }}>Home</Button>
            <Button component={Link} href="/docs" size="small" startIcon={<MenuBookOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, px: 1.25 }}>Docs</Button>
            <Button component={Link} href="/playground" size="small" startIcon={<TerminalOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, px: 1.25 }}>Playground</Button>
            <Button component={Link} href="/#story" size="small" startIcon={<HistoryEduOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, px: 1.25 }}>Story</Button>
            <Button href="https://github.com/ManojGowda89/toonkit" target="_blank" rel="noopener" size="small" startIcon={<StarBorderIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, px: 1.25 }}>Star on GitHub</Button>
            <Button href="https://manojgowda.in" target="_blank" rel="noopener" size="small" startIcon={<PersonOutlineIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, px: 1.25 }}>Developer</Button>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}