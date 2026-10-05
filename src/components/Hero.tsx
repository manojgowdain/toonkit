"use client";

import { Button, Typography, Stack, Chip, Box, Paper } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Stack
        spacing={4}
        alignItems="center"
        textAlign="center"
        sx={{
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              fontSize: {
                xs: "3rem",
                md: "4.5rem",
              },
            }}
          >
            toonkit
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mt: 1,
              fontSize: {
                xs: "1.2rem",
                md: "1.6rem",
              },
            }}
          >
            Compact, typed text format for APIs — fast to parse, easy to read.
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "text.secondary",
              maxWidth: 720,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Simple: TOON is a compact, typed text format for APIs. toonkit2 is the
            JavaScript toolkit that makes it easy to use TOON everywhere — in the
            browser, in Node servers, and in HTTP clients.
          </Typography>

          <Typography
            sx={{ mt: 1, color: "text.secondary", maxWidth: 720, mx: "auto", lineHeight: 1.6 }}
          >
            What it provides: a fast parser (TOON → JS), a serializer (JS → TOON),
            a convenient fetch helper and axios helpers for clients, plus server
            adapters for Express, Fastify, Hono and Next so frontends and backends
            can share the same compact format.
          </Typography>
        </motion.div>

        <Paper
          id="story"
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 920,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            textAlign: "left",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <AutoStoriesOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                The TOON story
              </Typography>
            </Stack>

            <Typography sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              For years, I kept <strong>toonkit</strong> as my secret weapon in Bengaluru&apos;s IoT labs –
              powering 1000s of health trackers with lean telemetry that JSON couldn&apos;t touch.
            </Typography>

            <Typography sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              JSON? Bloated repeats of &quot;device_id&quot;, &quot;battery&quot; every row – 145 bytes crushed buffers,
              drained batteries. Normal <strong>toon</strong> formats? Great theory, but no JS parser,
              no browser magic.
            </Typography>

            <Typography sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              My <strong>toonkit</strong>: Schema once (table-style), type codes ({" "}
              <Box component="span" sx={{ fontFamily: "monospace" }}>
                s→string, n→number, b→boolean
              </Box>
              ), then infinite rows. Shrinks to 90 bytes. <strong>toon</strong> is the format.
              <strong>toonkit</strong> is my battle-tested npm lib that parses it to typed JS objects
              instantly. JSON repeats; we don&apos;t.
            </Typography>

            <Typography sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              Now opening it up – from internal hero to open source. Libraries.io even auto-listed it
              (I never submitted)! Star the revolution: ⭐
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip icon={<WorkspacePremiumOutlinedIcon />} label="Built for IoT" />
              <Chip icon={<PersonOutlineIcon />} label="By Manoj Gowda" />
            </Stack>
          </Stack>
        </Paper>

        {/* Chips */}
        <Stack
          direction="row"
          spacing={1.2}
          useFlexGap
          flexWrap="wrap"
          justifyContent="center"
        >
          <Chip label="🚀 Open Source" />
          <Chip label="Lightweight" />
          <Chip label="Type Safe" />
          <Chip label="API Friendly" />
          <Chip label="Human Readable" />
        </Stack>

        {/* Install Command */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 1100,
            bgcolor: theme.palette.mode === "dark" ? "#111" : alpha(theme.palette.primary.main, 0.06),
            borderRadius: 4,
            py: 2,
            px: 3,
            fontFamily: "monospace",
            fontSize: "1rem",
            textAlign: "center",
            overflowX: "auto",
            color: theme.palette.text.primary,
            border: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.08)
                : alpha(theme.palette.primary.main, 0.16),
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 12px 30px ${alpha(theme.palette.common.black, 0.35)}`
                : `0 10px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Box component="code" sx={{ fontFamily: "inherit" }}>
          npm i <strong>toonkit2</strong>
          </Box>
        </Box>

        {/* External Links */}
        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          justifyContent="center"
        >
          <Button
            variant="outlined"
            component={Link}
            href="https://www.npmjs.com/package/toonkit2"
            target="_blank"
            size="small"
          >
            NPM PACKAGE (RECOMMENDED)
          </Button>

          <Button
            variant="outlined"
            component={Link}
            href="https://jsr.io/@manojgowdain/toonkit2"
            target="_blank"
            size="small"
          >
            JSR PACKAGE
          </Button>

          <Button
            variant="outlined"
            component={Link}
            href="https://www.npmjs.com/package/toonkit2"
            target="_blank"
            size="small"
          >
            TOONKIT2 NPM
          </Button>

          <Button
            variant="outlined"
            component={Link}
            href="https://ssdiskdb.js.org/"
            target="_blank"
            size="small"
          >
            SSDISKDB
          </Button>

          <Button
            variant="outlined"
            component={Link}
            href="https://pgbloom.iotkit.in/"
            target="_blank"
            size="small"
          >
            PGBLOOM
          </Button>

          <Button
            variant="outlined"
            component={Link}
            href="https://toonkit.js.org"
            target="_blank"
            size="small"
          >
            TOONKIT.JS.ORG
          </Button>
        </Stack>

        {/* Features */}
        <Stack spacing={1} alignItems="center">
          <Typography color="text.secondary">
            ✓ Smaller payloads & faster parsing
          </Typography>

          <Typography color="text.secondary">
            ✓ Schema + types + compact structure
          </Typography>

          <Typography color="text.secondary">
            ✓ Perfect for APIs, bots & automation
          </Typography>

          <Typography color="text.secondary">
            ✓ Frontend ⇄ Backend symmetry
          </Typography>
        </Stack>

        {/* CTA */}
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          justifyContent="center"
        >
          <Button variant="contained" component={Link} href="/docs">
            Get Started
          </Button>

          <Button variant="outlined" component={Link} href="/playground">
            Try Playground
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}