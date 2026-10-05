"use client";
import { useState, MouseEvent } from "react";

interface NavItem {
  id: string;
  label: string;
}

interface SectionHeaderProps {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
}

interface InfoCardProps {
  children: React.ReactNode;
  accent?: string;
}

interface CodeBlockProps {
  children: string;
  label?: string;
}

interface PropTableProps {
  rows: [string, string, string, string][];
}

const theme: Record<string, string> = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surfaceHover: "#1a1a26",
  border: "#1e1e2e",
  accent: "#00e5ff",
  accentDim: "#00e5ff22",
  accentGlow: "#00e5ff44",
  green: "#00ff88",
  purple: "#b06eff",
  orange: "#ff6b35",
  yellow: "#ffd60a",
  text: "#e8e8f0",
  textMuted: "#6b6b8a",
  textDim: "#9898b8",
} as const;

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'Syne', sans-serif;
    line-height: 1.6;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${theme.bg}; }
  ::-webkit-scrollbar-thumb { background: ${theme.accent}33; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${theme.accent}66; }

  .code-block {
    font-family: 'Space Mono', monospace;
    background: #080810;
    border: 1px solid ${theme.border};
    border-left: 3px solid ${theme.accent};
    border-radius: 8px;
    padding: 20px 24px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.8;
    color: #c8c8e0;
    position: relative;
  }

  .code-block .kw { color: ${theme.purple}; }
  .code-block .str { color: ${theme.green}; }
  .code-block .num { color: ${theme.orange}; }
  .code-block .comment { color: ${theme.textMuted}; font-style: italic; }
  .code-block .type { color: ${theme.yellow}; }
  .code-block .fn { color: ${theme.accent}; }
  .code-block .toon-key { color: ${theme.accent}; font-weight: 700; }
  .code-block .toon-type { color: ${theme.yellow}; }
  .code-block .toon-val { color: ${theme.green}; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: 'Space Mono', monospace;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 ${theme.accentGlow}; }
    50% { box-shadow: 0 0 20px 4px ${theme.accentGlow}; }
  }

  .glow-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: ${theme.green};
    animation: pulse-glow 2s ease infinite;
    display: inline-block;
  }

  .section-anim {
    animation: fadeInUp 0.5s ease both;
  }

  .nav-link {
    display: block;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 13px;
    color: ${theme.textDim};
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Space Mono', monospace;
    border: 1px solid transparent;
  }
  .nav-link:hover {
    color: ${theme.accent};
    background: ${theme.accentDim};
    border-color: ${theme.accentGlow};
  }
  .nav-link.active {
    color: ${theme.accent};
    background: ${theme.accentDim};
    border-color: ${theme.accent}55;
  }

  .docs-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .docs-tab-row {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .docs-prop-table {
    overflow-x: auto;
  }

  .docs-prop-table > div {
    min-width: 620px;
  }

  .docs-shell {
    display: flex;
    min-height: 100vh;
    background: ${theme.bg};
  }

  .docs-sidebar {
    width: 240px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid ${theme.border};
    padding: 28px 14px;
    background: ${theme.bg};
  }

  .docs-sidebar-brand {
    padding-left: 12px;
    margin-bottom: 28px;
  }

  .docs-sidebar-title {
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.03em;
    color: ${theme.text};
  }

  .docs-sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .docs-sidebar-links {
    margin-top: 28px;
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .docs-main {
    flex: 1;
    max-width: 1120px;
    margin: 0 auto;
    padding: 56px 48px 120px;
    overflow-x: hidden;
    width: 100%;
  }

  .docs-footer-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .docs-hero {
    padding: 48px;
  }

  .docs-hero h1 {
    font-size: 48px;
  }

  .docs-type-grid {
    display: grid;
    grid-template-columns: 60px 140px 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 1024px) {
    .docs-shell {
      flex-direction: column;
    }

    .docs-sidebar {
      width: 100% !important;
      position: static !important;
      height: auto !important;
      border-right: none !important;
      border-bottom: 1px solid ${theme.border} !important;
      padding: 18px 16px !important;
    }

    .docs-main {
      max-width: 100% !important;
      padding: 28px 16px 88px !important;
    }

    .docs-sidebar-nav {
      flex-direction: row !important;
      flex-wrap: wrap;
      gap: 8px !important;
    }

    .nav-link {
      width: auto;
    }

    .docs-sidebar-brand,
    .docs-sidebar-links {
      padding-left: 0;
    }

    .docs-sidebar-links {
      margin-top: 16px;
      flex-direction: row;
      flex-wrap: wrap;
    }

    .docs-grid-2 {
      grid-template-columns: 1fr;
    }

    .docs-hero {
      padding: 28px;
    }

    .docs-hero h1 {
      font-size: 40px;
    }
  }

  @media (max-width: 640px) {
    .docs-sidebar {
      padding: 14px 12px !important;
    }

    .docs-sidebar-brand {
      margin-bottom: 18px;
    }

    .docs-sidebar-title {
      font-size: 16px;
    }

    .docs-sidebar-nav {
      gap: 6px !important;
    }

    .docs-sidebar-links {
      display: none;
    }

    .docs-hero {
      padding: 22px;
      margin-bottom: 48px;
    }

    .docs-hero h1 {
      font-size: 32px;
    }

    .docs-tab-row,
    .docs-footer-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .tab-btn,
    .docs-footer-actions a {
      width: 100%;
      justify-content: center;
    }

    .docs-prop-table > div {
      min-width: 100%;
    }

    .docs-type-grid {
      grid-template-columns: 48px 1fr;
      gap: 10px;
    }

    .docs-type-grid > span:nth-child(3),
    .docs-type-grid > span:nth-child(4) {
      grid-column: 1 / -1;
    }
  }

  .tab-btn {
    padding: 8px 18px;
    border-radius: 6px;
    font-size: 12px;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid ${theme.border};
    background: transparent;
    color: ${theme.textDim};
    letter-spacing: 0.05em;
  }
  .tab-btn.active {
    background: ${theme.accentDim};
    border-color: ${theme.accent};
    color: ${theme.accent};
  }
  .tab-btn:hover:not(.active) {
    background: ${theme.surfaceHover};
    color: ${theme.text};
  }

  .type-row:hover { background: ${theme.surfaceHover}; }

  h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }
`;

const navItems: NavItem[] = [
  { id: "intro", label: "Overview" },
  { id: "install", label: "Installation" },
  { id: "import", label: "Import & Functions" },
  { id: "toon-to-json", label: "toonToJson()" },
  { id: "json-to-toon", label: "jsonToToon()" },
  { id: "types", label: "Type Codes" },
  { id: "core-frontend", label: "Core / Frontend" },
  { id: "fetch", label: "Fetch / Client" },
  { id: "express", label: "Express Example" },
  { id: "express-plugin", label: "Express Plugin" },
  { id: "fastify", label: "Fastify Plugin" },
  { id: "hono", label: "Hono Plugin" },
  { id: "next-server", label: "Next.js Server" },
  { id: "postman", label: "Postman Testing" },
  { id: "performance", label: "Performance" },
];

function SectionHeader({ id, icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2
          id={id}
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: theme.text,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p style={{ color: theme.textDim, fontSize: 15, paddingLeft: 36 }}>
          {subtitle}
        </p>
      )}
      <div
        style={{
          height: 1,
          background: `linear-gradient(to right, ${theme.accent}44, transparent)`,
          marginTop: 16,
        }}
      />
    </div>
  );
}

function InfoCard({ children, accent = theme.accent }: InfoCardProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${accent}33`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 20,
        fontSize: 14,
        color: theme.textDim,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

function CodeBlock({ children, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const text = children.replace(/<[^>]+>/g, "");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ position: "relative", marginBottom: 24 }}>
      {label && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            className="badge"
            style={{
              background: theme.accentDim,
              color: theme.accent,
              border: `1px solid ${theme.accentGlow}`,
            }}
          >
            {label}
          </span>
          <button
            onClick={copy}
            style={{
              background: "transparent",
              border: `1px solid ${theme.border}`,
              color: copied ? theme.green : theme.textMuted,
              padding: "3px 10px",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Space Mono', monospace",
              transition: "all 0.15s",
            }}
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      )}
      <pre
        className="code-block"
        dangerouslySetInnerHTML={{ __html: children }}
      />
    </div>
  );
}

function PropTable({ rows }: PropTableProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 24,
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px 100px 1fr 1fr",
          padding: "10px 20px",
          borderBottom: `1px solid ${theme.border}`,
          color: theme.textMuted,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <span>Code</span>
        <span>Meaning</span>
        <span>Example</span>
        <span>Output</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="type-row"
          style={{
            display: "grid",
            gridTemplateColumns: "60px 100px 1fr 1fr",
            padding: "12px 20px",
            borderBottom: i < rows.length - 1 ? `1px solid ${theme.border}` : "none",
            transition: "background 0.1s",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              color: theme.accent,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {row[0]}
          </span>
          <span style={{ color: theme.purple }}>{row[1]}</span>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              color: theme.green,
              fontSize: 12,
            }}
          >
            {row[2]}
          </span>
          <span style={{ color: theme.textDim }}>{row[3]}</span>
        </div>
      ))}
    </div>
  );
}

export default function ToonkitDocs() {
  const [activeSection, setActiveSection] = useState("intro");
  const [tabImport, setTabImport] = useState("esm");
  const [tabExample, setTabExample] = useState("toon");

  const scrollTo = (id: any) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="docs-shell">
        {/* Sidebar */}
        <aside
          className="docs-sidebar"
          style={{
          }}
        >
          <div className="docs-sidebar-brand">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span className="docs-sidebar-title">
                toonkit
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="glow-dot" />
              <span
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                v2.x • MIT
              </span>
            </div>
          </div>

          <div
            className="docs-sidebar-links"
            style={{
              fontSize: 10,
              color: theme.textMuted,
              marginBottom: 8,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Documentation
          </div>
          <nav className="docs-sidebar-nav">
            {navItems.map((item) => (
              <span
                key={item.id}
                className={`nav-link ${activeSection === item.id ? "active" : ""}`}
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </span>
            ))}
          </nav>

          <div className="docs-sidebar-links">
            <a
              href="https://github.com/ManojGowda89/toonkit"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: theme.textMuted,
                textDecoration: "none",
                fontFamily: "'Space Mono', monospace",
                transition: "color 0.15s",
              }}
            >
              ↗ GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/toonkit"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: theme.textMuted,
                textDecoration: "none",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              ↗ NPM Package
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="docs-main"
          style={{
          }}
        >
          {/* Hero */}
          <div
            className="section-anim docs-hero"
            style={{
              marginBottom: 72,
              background: `linear-gradient(135deg, ${theme.surface} 0%, #0e0e1a 100%)`,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Type-Safe", color: theme.accent },
                { label: "Compact", color: theme.green },
                { label: "Human-Readable", color: theme.purple },
                { label: "MIT", color: theme.orange },
              ].map((b) => (
                <span
                  key={b.label}
                  className="badge"
                  style={{
                    background: `${b.color}15`,
                    color: b.color,
                    border: `1px solid ${b.color}33`,
                  }}
                >
                  {b.label}
                </span>
              ))}
            </div>
            <h1
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                marginBottom: 16,
                background: `linear-gradient(135deg, ${theme.text} 30%, ${theme.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              toonkit
            </h1>
            <p
              style={{
                fontSize: 18,
                color: theme.textDim,
                maxWidth: 600,
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              A parser & serializer for{" "}
              <span style={{ color: theme.accent, fontWeight: 700 }}>TOON</span> — Typed
              Object Oriented Notation. Transform JSON to compact TOON format and back with
              built-in type awareness.
            </p>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: theme.textMuted }}>
              <span style={{ color: theme.green }}>$</span>{" "}
              <span style={{ color: theme.text }}>npm install toonkit2</span>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          <section id="intro" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="intro"
              icon="📦"
              title="What is toonkit?"
              subtitle="Why TOON? Why this library?"
            />
            <p style={{ fontSize: 15, color: theme.textDim, lineHeight: 1.8, marginBottom: 20 }}>
              <strong style={{ color: theme.text }}>toonkit</strong> provides a core parser/serializer
              and framework adapters for easy integration with HTTP clients and servers.
            </p>
            <ul style={{ fontSize: 15, color: theme.textDim, lineHeight: 1.8, marginBottom: 24, paddingLeft: 20 }}>
              <li style={{ marginBottom: 12 }}>
                <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                  toonToJson(input: string)
                </code>{" "}
                — Parses TOON text into JavaScript objects
              </li>
              <li style={{ marginBottom: 12 }}>
                <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
                  jsonToToon(obj: any)
                </code>{" "}
                — Serializes JavaScript objects to TOON format
              </li>
              <li>
                Adapter exports — `toonkit2/express`, `toonkit2/fastify`, `toonkit2/hono`, `toonkit2/next/server`, and a `toonkit2/fetch` client for convenience.
              </li>
            </ul>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
              Why TOON?
            </h3>
            <p style={{ fontSize: 14, color: theme.textDim, lineHeight: 1.7, marginBottom: 24 }}>
              JSON is powerful but verbose. TOON solves this by separating the schema definition
              from the data rows — like a typed table format. Result: smaller payloads, faster
              parsing, and type safety built in.
            </p>

            <div className="docs-grid-2" style={{ marginBottom: 24 }}>
              {[
                { icon: "📉", label: "40-60% smaller", desc: "No repeated key names" },
                { icon: "🔤", label: "Human-readable", desc: "Plain text, easy to edit" },
                { icon: "🏷️", label: "Type-safe", desc: "Schema declares all types" },
                { icon: "⚡", label: "Fast parsing", desc: "Minimal overhead structure" },
              ].map((f) => (
                <div
                  key={f.label}
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: theme.text,
                        marginBottom: 4,
                      }}
                    >
                      {f.label}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── INSTALLATION ── */}
          <section id="install" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="install" icon="📥" title="Installation" />

            <CodeBlock label="npm">{`<span class="fn">npm</span> install toonkit2`}</CodeBlock>
            <CodeBlock label="yarn">{`<span class="fn">yarn</span> add toonkit2`}</CodeBlock>
            <CodeBlock label="pnpm">{`<span class="fn">pnpm</span> add toonkit2`}</CodeBlock>
          </section>

          {/* ── IMPORT & FUNCTIONS ── */}
          <section id="import" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="import" icon="🔗" title="Import & Functions" />

            <div className="docs-tab-row">
              <button
                className={`tab-btn ${tabImport === "esm" ? "active" : ""}`}
                onClick={() => setTabImport("esm")}
              >
                ES Modules
              </button>
              <button
                className={`tab-btn ${tabImport === "cjs" ? "active" : ""}`}
                onClick={() => setTabImport("cjs")}
              >
                CommonJS
              </button>
            </div>

            {tabImport === "esm" ? (
              <CodeBlock label="ES Module Import">{`<span class="kw">import</span> { <span class="fn">toonToJson</span>, <span class="fn">jsonToToon</span>, <span class="fn">toonFetch</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;
<span class="kw">import</span> { <span class="fn">toon</span> } <span class="kw">from</span> <span class="str">"toonkit2/express"</span>;
// or: import { toon } from "toonkit2/fastify"`}</CodeBlock>
            ) : (
              <CodeBlock label="CommonJS Require">{`<span class="kw">const</span> { <span class="fn">toonToJson</span>, <span class="fn">jsonToToon</span>, <span class="fn">toonFetch</span> } = <span class="fn">require</span>(<span class="str">"toonkit2"</span>);
<span class="kw">const</span> { <span class="fn">toon</span> } = <span class="kw">require</span>(<span class="str">"toonkit2/express"</span>);`}</CodeBlock>
            )}

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16, marginTop: 28 }}>
              Function Signatures
            </h3>
            <div
              className="docs-prop-table"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {[
                {
                  fn: "toonToJson(input: string)",
                  desc: "Parses TOON text and returns a JavaScript object with all types resolved.",
                },
                {
                  fn: "jsonToToon(obj: any)",
                  desc: "Converts a JavaScript object/array into TOON format string.",
                },
              ].map((item, i) => (
                <div
                  key={item.fn}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i === 0 ? `1px solid ${theme.border}` : "none",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: theme.accent,
                      fontSize: 13,
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {item.fn}
                  </code>
                  <span style={{ fontSize: 13, color: theme.textDim }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── toonToJson ── */}
          <section id="toon-to-json" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="toon-to-json"
              icon="🔄"
              title="toonToJson()"
              subtitle="Parse TOON strings into JavaScript objects"
            />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
              This function reads TOON-formatted text and automatically converts it to a
              properly-typed JavaScript object. Type codes in the schema determine how each
              value is parsed.
            </p>

            <CodeBlock label="Usage">{`<span class="kw">const</span> toonString = <span class="str">\`
device_id[<span class="num">1</span>]{<span class="num">0</span>:s}:
DEVICE_PRO_01

battery[<span class="num">1</span>]{<span class="num">0</span>:n}:
<span class="num">87</span>

is_active[<span class="num">1</span>]{<span class="num">0</span>:b}:
true
\`</span>;

<span class="kw">const</span> json = <span class="fn">toonToJson</span>(toonString);
<span class="comment">// json = { device_id: "DEVICE_PRO_01", battery: 87, is_active: true }</span>`}</CodeBlock>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
              Type Codes Reference
            </h3>
            <PropTable
              rows={[
                ["s", "string", `Manoj`, `"Manoj"`],
                ["n", "number", `36.7`, `36.7`],
                ["b", "boolean", `true`, `true`],
                ["nl", "null", `null`, `null`],
                ["j", "JSON object", `{"a":1}`, `{ a: 1 }`],
                ["a", "array", `[1,2,3]`, `[1,2,3]`],
                ["td", "text/date", `03042026120000`, `"03042026120000"`],
              ]}
            />

            <InfoCard accent={theme.yellow}>
              <strong style={{ color: theme.yellow }}>Note:</strong> Type code{" "}
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>j</code> and{" "}
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>a</code> must contain
              valid JSON. Use <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>td</code>{" "}
              for raw text that shouldn't be parsed.
            </InfoCard>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16, marginTop: 32 }}>
              Complete Example
            </h3>
            <CodeBlock label="TOON Input">{`<span class="toon-key">device_id</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">s</span>}:
<span class="toon-val">DEVICE_PRO_01</span>

<span class="toon-key">battery</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">n</span>}:
<span class="toon-val">87</span>

<span class="toon-key">temperature</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">n</span>}:
<span class="toon-val">36.7</span>

<span class="toon-key">is_active</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">b</span>}:
<span class="toon-val">true</span>

<span class="toon-key">last_error</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">nl</span>}:
<span class="toon-val">null</span>

<span class="toon-key">location</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">j</span>}:
<span class="toon-val">{"lat":12.9716,"lng":77.5946}</span>

<span class="toon-key">tags</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">a</span>}:
<span class="toon-val">["iot","health","tracker"]</span>

<span class="toon-key">created_at</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">td</span>}:
<span class="toon-val">03042026120000</span>`}</CodeBlock>

            <CodeBlock label="JavaScript Output">{`{
  <span class="str">device_id</span>: <span class="str">"DEVICE_PRO_01"</span>,
  <span class="str">battery</span>: <span class="num">87</span>,
  <span class="str">temperature</span>: <span class="num">36.7</span>,
  <span class="str">is_active</span>: <span class="kw">true</span>,
  <span class="str">last_error</span>: <span class="kw">null</span>,
  <span class="str">location</span>: { <span class="str">lat</span>: <span class="num">12.9716</span>, <span class="str">lng</span>: <span class="num">77.5946</span> },
  <span class="str">tags</span>: [<span class="str">"iot"</span>, <span class="str">"health"</span>, <span class="str">"tracker"</span>],
  <span class="str">created_at</span>: <span class="str">"03042026120000"</span>
}`}</CodeBlock>
          </section>

          {/* ── jsonToToon ── */}
          <section id="json-to-toon" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="json-to-toon"
              icon="🔄"
              title="jsonToToon()"
              subtitle="Convert JavaScript objects to TOON format"
            />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
              This function inspects your JavaScript object and automatically detects the type
              of each value ({`null`}, string, number, boolean, array, object). It then generates
              the appropriate TOON-formatted string.
            </p>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
              Type Detection Rules
            </h3>
            <div style={{ background: theme.surface, borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <ul style={{ fontSize: 13, color: theme.textDim, lineHeight: 1.8 }}>
                <li>
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>null</code> →{" "}
                  <strong>nl</strong>
                </li>
                <li>
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>string</code> →{" "}
                  <strong>s</strong>
                </li>
                <li>
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>number</code> →{" "}
                  <strong>n</strong>
                </li>
                <li>
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>boolean</code> →{" "}
                  <strong>b</strong>
                </li>
                <li>
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>Array</code> →{" "}
                  <strong>a</strong>
                </li>
                <li>
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>Object</code> →{" "}
                  <strong>j</strong> (JSON)
                </li>
              </ul>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
              Example
            </h3>
            <CodeBlock label="JavaScript Input">{`<span class="kw">const</span> obj = {
  device_id: <span class="str">"DEVICE_PRO_01"</span>,
  battery: <span class="num">87</span>,
  temperature: <span class="num">36.7</span>,
  is_active: <span class="kw">true</span>,
  last_error: <span class="kw">null</span>,
  location: { <span class="str">lat</span>: <span class="num">12.9716</span>, <span class="str">lng</span>: <span class="num">77.5946</span> },
  tags: [<span class="str">"iot"</span>, <span class="str">"health"</span>, <span class="str">"tracker"</span>]
};

<span class="kw">const</span> toon = <span class="fn">jsonToToon</span>(obj);`}</CodeBlock>

            <CodeBlock label="TOON Output">{`<span class="toon-key">device_id</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">s</span>}:
<span class="toon-val">DEVICE_PRO_01</span>

<span class="toon-key">battery</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">n</span>}:
<span class="toon-val">87</span>

<span class="toon-key">temperature</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">n</span>}:
<span class="toon-val">36.7</span>

<span class="toon-key">is_active</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">b</span>}:
<span class="toon-val">true</span>

<span class="toon-key">last_error</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">nl</span>}:
<span class="toon-val">null</span>

<span class="toon-key">location</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">j</span>}:
<span class="toon-val">{"lat":12.9716,"lng":77.5946}</span>

<span class="toon-key">tags</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">a</span>}:
<span class="toon-val">["iot","health","tracker"]</span>`}</CodeBlock>
          </section>

          {/* ── TYPE CODES ── */}
          <section id="types" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="types"
              icon="🧬"
              title="Type Codes Reference"
              subtitle="Complete guide to all supported data types"
            />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 20, lineHeight: 1.7 }}>
              TOON uses single or two-letter codes to declare the type of each field. This
              allows{" "}
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                toonToJson
              </code>{" "}
              to parse values correctly and{" "}
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                jsonToToon
              </code>{" "}
              to detect types automatically.
            </p>

            <div
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {[
                { code: "s", type: "String", example: "Manoj", note: "Plain text, no special escaping needed" },
                { code: "n", type: "Number", example: "87 or 36.7", note: "Integers and floats" },
                { code: "b", type: "Boolean", example: "true or false", note: "Lowercase only, case-sensitive" },
                { code: "nl", type: "Null", example: "null", note: "Represents null/undefined values" },
                { code: "j", type: "JSON Object", example: '{"a":1}', note: "Valid JSON object, auto-parsed" },
                { code: "a", type: "Array", example: '[1,"a",true]', note: "Valid JSON array, auto-parsed" },
                {
                  code: "td",
                  type: "Text/Date",
                  example: "03042026120000",
                  note: "Raw text, no parsing (good for date strings)",
                },
              ].map((item, i, arr) => (
                <div
                  key={item.code}
                  className="docs-type-grid"
                  style={{
                    padding: "14px 20px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none",
                    alignItems: "center",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: theme.accent,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {item.code}
                  </code>
                  <span style={{ fontSize: 13, color: theme.purple, fontWeight: 600 }}>{item.type}</span>
                  <code style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: theme.green }}>
                    {item.example}
                  </code>
                  <span style={{ fontSize: 12, color: theme.textDim }}>{item.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── EXPRESS ── */}
          <section id="express" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="express"
              icon="🖥"
              title="Express.js Integration"
              subtitle="Using toonkit in Node.js / Express APIs"
            />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 20, lineHeight: 1.7 }}>
              toonkit works seamlessly with Express. Use{" "}
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                express.text()
              </code>{" "}
              middleware to accept TOON payloads and respond with TOON strings.
            </p>

            <div className="docs-tab-row">
              {["setup", "receive", "send", "full"].map((t) => (
                <button
                  key={t}
                  className={`tab-btn ${tabExample === t ? "active" : ""}`}
                  onClick={() => setTabExample(t)}
                >
                  {t === "setup"
                    ? "Setup"
                    : t === "receive"
                      ? "Receive TOON"
                      : t === "send"
                        ? "Send TOON"
                        : "Complete Route"}
                </button>
              ))}
            </div>

            {tabExample === "setup" && (
              <>
                <p style={{ fontSize: 13, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
                  Configure Express to accept raw text bodies using the{" "}
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                    text()
                  </code>{" "}
                  middleware.
                </p>
                <CodeBlock label="Basic Setup">{`<span class="kw">import</span> express <span class="kw">from</span> <span class="str">"express"</span>;
<span class="kw">import</span> { <span class="fn">toonToJson</span>, <span class="fn">jsonToToon</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="kw">const</span> app = <span class="fn">express</span>();

<span class="comment">// ← Required: enables plain text body parsing</span>
app.<span class="fn">use</span>(express.<span class="fn">text</span>());

app.<span class="fn">listen</span>(<span class="num">3000</span>, () => console.<span class="fn">log</span>(<span class="str">"Running on :3000"</span>));`}</CodeBlock>
              </>
            )}

            {tabExample === "receive" && (
              <>
                <p style={{ fontSize: 13, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
                  Parse incoming TOON request bodies with{" "}
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                    toonToJson(req.body)
                  </code>
                  .
                </p>
                <CodeBlock label="Parse TOON Request">{`app.<span class="fn">post</span>(<span class="str">"/api/devices"</span>, (req, res) => {
  <span class="comment">// Parse TOON body into JS object</span>
  <span class="kw">const</span> data = <span class="fn">toonToJson</span>(req.body);

  console.<span class="fn">log</span>(<span class="str">"Received:"</span>, data);
  <span class="comment">// → { device_id: "DEVICE_PRO_01", battery: 87, ... }</span>

  <span class="comment">// Process data as normal JS object</span>
  <span class="kw">const</span> { device_id, battery } = data;

  res.<span class="fn">json</span>({ <span class="str">success</span>: <span class="kw">true</span>, id: device_id });
});`}</CodeBlock>
              </>
            )}

            {tabExample === "send" && (
              <>
                <p style={{ fontSize: 13, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
                  Respond with TOON-formatted data using{" "}
                  <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                    jsonToToon(data)
                  </code>
                  .
                </p>
                <CodeBlock label="Send TOON Response">{`app.<span class="fn">get</span>(<span class="str">"/api/devices"</span>, (req, res) => {
  <span class="kw">const</span> responseData = {
    device_id: <span class="str">"DEVICE_PRO_01"</span>,
    battery: <span class="num">87</span>,
    is_active: <span class="kw">true</span>,
    location: { <span class="str">lat</span>: <span class="num">12.9716</span>, <span class="str">lng</span>: <span class="num">77.5946</span> }
  };

  <span class="comment">// Convert to TOON and send as plain text</span>
  <span class="kw">const</span> toonString = <span class="fn">jsonToToon</span>(responseData);
  res.<span class="fn">type</span>(<span class="str">"text/plain"</span>).<span class="fn">send</span>(toonString);
});`}</CodeBlock>
              </>
            )}

            {tabExample === "full" && (
              <CodeBlock label="Complete Express Route">{`<span class="kw">import</span> express <span class="kw">from</span> <span class="str">"express"</span>;
<span class="kw">import</span> { <span class="fn">toonToJson</span>, <span class="fn">jsonToToon</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="kw">const</span> app = <span class="fn">express</span>();
app.<span class="fn">use</span>(express.<span class="fn">text</span>());  <span class="comment">// Required</span>
app.<span class="fn">use</span>(express.<span class="fn">json</span>());  <span class="comment">// Optional, for other routes</span>

<span class="comment">// POST route — receive TOON</span>
app.<span class="fn">post</span>(<span class="str">"/api/devices"</span>, (req, res) => {
  <span class="comment">// 1. Parse TOON request body</span>
  <span class="kw">const</span> incoming = <span class="fn">toonToJson</span>(req.body);
  console.<span class="fn">log</span>(<span class="str">"Received:"</span>, incoming);

  <span class="comment">// 2. Process / validate / save...</span>
  <span class="kw">const</span> response = { <span class="str">success</span>: <span class="kw">true</span>, <span class="str">device_id</span>: incoming.device_id };

  <span class="comment">// 3. Send response as TOON</span>
  <span class="kw">const</span> toon = <span class="fn">jsonToToon</span>(response);
  res.<span class="fn">type</span>(<span class="str">"text/plain"</span>).<span class="fn">send</span>(toon);
});

<span class="comment">// GET route — respond with TOON</span>
app.<span class="fn">get</span>(<span class="str">"/api/devices/:id"</span>, (req, res) => {
  <span class="kw">const</span> device = { <span class="str">device_id</span>: <span class="str">"DEVICE_PRO_01"</span>, <span class="str">battery</span>: <span class="num">87</span> };
  res.<span class="fn">type</span>(<span class="str">"text/plain"</span>).<span class="fn">send</span>(<span class="fn">jsonToToon</span>(device));
});

app.<span class="fn">listen</span>(<span class="num">3000</span>);</span>`}</CodeBlock>
            )}

            <InfoCard accent={theme.orange}>
              <strong style={{ color: theme.orange }}>⚠️ Required:</strong> Always call{" "}
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>
                app.use(express.text())
              </code>{" "}
              before your routes. Without this,{" "}
              <code style={{ fontFamily: "'Space Mono', monospace" }}>req.body</code> will be empty.
            </InfoCard>
          </section>

          {/* ── POSTMAN ── */}

          {/* ── CORE PARSER & FRONTEND ── */}
          <section id="core-frontend" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="core-frontend" icon="🧭" title="Core parser & Frontend usage" subtitle="How the main parser works and using TOON in browsers" />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 12 }}>
              The core of `toonkit2` is the parser/serializer pair:
            </p>
            <ul style={{ fontSize: 13, color: theme.textDim, marginBottom: 16 }}>
              <li><code style={{ color: theme.accent }}>toonToJson(input: string)</code> — parse TOON text into typed JavaScript objects.</li>
              <li><code style={{ color: theme.accent }}>jsonToToon(obj: any)</code> — serialize JS objects into TOON text.</li>
            </ul>

            <h3 style={{ fontSize: 15, color: theme.text, marginBottom: 8 }}>Using the parser in the browser</h3>
            <p style={{ fontSize: 13, color: theme.textDim, marginBottom: 12 }}>
              Two common front-end patterns: fetch the raw TOON response and parse locally, or use `toonFetch` which returns parsed data.
            </p>

            <CodeBlock label="Manual fetch + parse">{`<span class="kw">import</span> { <span class="fn">toonToJson</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="kw">const</span> res = <span class="kw">await</span> fetch(<span class="str">"/api/devices"</span>);
<span class="kw">const</span> text = <span class="kw">await</span> res.text();
<span class="kw">const</span> data = <span class="fn">toonToJson</span>(text);`}</CodeBlock>

            <CodeBlock label="Using toonFetch (direct)">{`<span class="kw">import</span> { <span class="fn">toonFetch</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="kw">const</span> result = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"/api/devices"</span>);
<span class="kw">const</span> data = result.data; <span class="comment">// already parsed</span>`}</CodeBlock>
          </section>
          {/* ── FETCH CLIENT ── */}
          <section id="fetch" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="fetch" icon="🌐" title="Fetch client" subtitle="`toonFetch`, `configureToonAxios`, and `createToonAxios` examples" />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 12 }}>
              `toonkit2` provides a lightweight fetch wrapper and axios helpers that automatically
              handle TOON serialization and parsing, plus convenience token handling.
            </p>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Basic GET</h4>
            <CodeBlock label="Basic GET">{`<span class="kw">import</span> { <span class="fn">toonFetch</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="kw">const</span> res = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/users"</span>);
console.log(res.data);`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>GET with headers</h4>
            <CodeBlock label="GET With Headers">{`const res = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/users"</span>, {
  headers: {
    Authorization: <span class="str">"Bearer token123"</span>,
    "x-api-key": <span class="str">"abc123"</span>
  }
});

console.log(res.data);`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Token shortcut</h4>
            <p style={{ fontSize: 13, color: theme.textDim }}>Pass `token` as a string or function — it's added as `Authorization: Bearer ...`.</p>
            <CodeBlock label="Token (string)">{`const res = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/users"</span>, {
  token: <span class="str">"mytoken"</span>
});

// header => Authorization: Bearer mytoken`}</CodeBlock>

            <CodeBlock label="Token (function)">{`const res = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/profile"</span>, {
  token: () =&gt; localStorage.getItem(<span class="str">"jwt"</span>)
});`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>POST — TOON body (default)</h4>
            <p style={{ fontSize: 13, color: theme.textDim }}>By default, providing `data` will serialize to TOON and set `Content-Type: application/toon`.</p>
            <CodeBlock label="POST TOON">{`await <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/users"</span>, {
  method: <span class="str">"POST"</span>,
  data: { name: <span class="str">"Manoj"</span>, age: <span class="num">22</span> }
});`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>POST — send JSON instead</h4>
            <p style={{ fontSize: 13, color: theme.textDim }}>Override `Content-Type` to `application/json` to send JSON payloads.</p>
            <CodeBlock label="POST JSON">{`await <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/users"</span>, {
  method: <span class="str">"POST"</span>,
  headers: { "Content-Type": <span class="str">"application/json"</span> },
  data: { name: <span class="str">"Manoj"</span> }
});`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Full example (headers + token + body)</h4>
            <CodeBlock label="Full Example">{`const res = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"https://localhost:3000/create-user"</span>, {
  method: <span class="str">"POST"</span>,
  token: <span class="str">"jwt_token_here"</span>,
  headers: { "x-app": <span class="str">"toonkit2"</span> },
  data: { username: <span class="str">"manoj"</span>, email: <span class="str">"manoj@gmail.com"</span> }
});

console.log(res.data);`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Configure global base URL</h4>
            <CodeBlock label="configureToonAxios">{`<span class="kw">import</span> { <span class="fn">configureToonAxios</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="fn">configureToonAxios</span>({ baseURL: <span class="str">"https://api.example.com"</span>, token: () =&gt; localStorage.getItem(<span class="str">"token"</span>) });

// now: await toonFetch('/users') -> https://api.example.com/users`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Create a separate axios client</h4>
            <CodeBlock label="createToonAxios">{`<span class="kw">import</span> { <span class="fn">createToonAxios</span> } <span class="kw">from</span> <span class="str">"toonkit2"</span>;

<span class="kw">const</span> api = <span class="fn">createToonAxios</span>({ baseURL: <span class="str">"https://api.example.com"</span>, token: <span class="str">"abc123"</span> });

<span class="kw">const</span> users = <span class="kw">await</span> api.get(<span class="str">"/users"</span>);
console.log(users.data);`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Response format</h4>
            <p style={{ fontSize: 13, color: theme.textDim }}>
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>toonFetch</code> returns an object
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>{'{ data, response }'}</code> where
              <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>data</code> is already parsed JS (TOON or JSON)
              and <code style={{ color: theme.accent, fontFamily: "'Space Mono', monospace" }}>response</code> is a Fetch-like `Response` wrapper.
            </p>
            <CodeBlock label="Response Format">{`const { data, response } = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"/users"</span>);
console.log(data);
console.log(response.status);`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Example Express backend</h4>
            <p style={{ fontSize: 13, color: theme.textDim }}>A simple Express route that accepts TOON text and returns a TOON response.</p>
            <CodeBlock label="Express Backend">{`app.post(<span class="str">"/users"</span>, express.<span class="fn">text</span>(), (req, res) => {
  console.log(req.body); // TOON string

  res.setHeader(<span class="str">"Content-Type"</span>, <span class="str">"application/toon"</span>);

  res.send(<span class="str">'name[1]{0:s}:\nManoj\nage[1]{0:n}:\n22'</span>);
});`}</CodeBlock>

            <h4 style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Real usage example (login)</h4>
            <CodeBlock label="Login Example">{`const login = <span class="kw">async</span> () =&gt; {
  const { data } = <span class="kw">await</span> <span class="fn">toonFetch</span>(<span class="str">"/login"</span>, {
    method: <span class="str">"POST"</span>,
    headers: { "Content-Type": <span class="str">"application/json"</span> },
    data: { email: <span class="str">"manoj@gmail.com"</span>, password: <span class="str">"123456"</span> }
  });

  console.log(data);
};`}</CodeBlock>
          </section>

          {/* ── FASTIFY ── */}
          <section id="fastify" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="fastify" icon="🚀" title="Fastify Integration" subtitle="Register plugin for request/response handling" />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
              Fastify users can register the `toon` plugin to parse TOON bodies and send TOON responses.
            </p>

            <CodeBlock label="Fastify Plugin">{`<span class="kw">import</span> Fastify <span class="kw">from</span> <span class="str">"fastify"</span>;
<span class="kw">import</span> { <span class="fn">toon</span> } <span class="kw">from</span> <span class="str">"toonkit2/fastify"</span>;

<span class="kw">const</span> app = <span class="fn">Fastify</span>();
await app.<span class="fn">register</span>(<span class="fn">toon</span>);

app.<span class="fn">post</span>(<span class="str">"/devices"</span>, async (req, reply) =&gt; {
  <span class="kw">const</span> data = req.toon();
  reply.toon({ ok: <span class="kw">true</span>, received: data });
});`}</CodeBlock>
          </section>

          {/* ── EXPRESS PLUGIN ── */}
          <section id="express-plugin" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="express-plugin" icon="🧩" title="Express plugin" subtitle="Register middleware for Express" />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 12 }}>
              Express users can mount the `toon` middleware from `toonkit2/express` to get `req.toon()` and `res.toon()` helpers.
            </p>

            <CodeBlock label="Express Plugin">{`<span class="kw">import</span> express <span class="kw">from</span> <span class="str">"express"</span>;
<span class="kw">import</span> { <span class="fn">toon</span> } <span class="kw">from</span> <span class="str">"toonkit2/express"</span>;

<span class="kw">const</span> app = <span class="fn">express</span>();
<span class="comment">// Mount middleware (returns [parser, responder] or a single middleware depending on build)</span>
app.<span class="fn">use</span>(...<span class="fn">toon</span>());

app.<span class="fn">post</span>(<span class="str">"/devices"</span>, (req, res) =&gt; {
  <span class="kw">const</span> data = req.toon();
  res.toon({ ok: <span class="kw">true</span>, received: data });
});`}</CodeBlock>
          </section>

          {/* ── HONO ── */}
          <section id="hono" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="hono" icon="🔗" title="Hono Integration" subtitle="Middleware for Hono apps" />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
              Use the `toon` middleware for Hono to parse and respond with TOON.
            </p>

            <CodeBlock label="Hono Middleware">{`<span class="kw">import</span> { <span class="fn">Hono</span> } <span class="kw">from</span> <span class="str">"hono"</span>;
<span class="kw">import</span> { <span class="fn">toon</span> } <span class="kw">from</span> <span class="str">"toonkit2/hono"</span>;

<span class="kw">const</span> app = <span class="kw">new</span> <span class="fn">Hono</span>();
app.use(<span class="str">"*"</span>, <span class="fn">toon</span>());

app.post(<span class="str">"/devices"</span>, (c) =&gt; c.json({ ok: <span class="kw">true</span>, received: c.req.toon() }));`}</CodeBlock>
          </section>

          {/* ── NEXT (server) ── */}
          <section id="next-server" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader id="next-server" icon="⚙️" title="Next.js (Edge/Server)" subtitle="Parsing TOON in route handlers" />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 16, lineHeight: 1.7 }}>
              Next server adapters expose `parseToonRequest` and `ToonResponse` helpers for route handlers.
            </p>

            <CodeBlock label="Next.js Route">{`<span class="kw">import</span> { <span class="fn">parseToonRequest</span>, <span class="fn">ToonResponse</span> } <span class="kw">from</span> <span class="str">"toonkit2/next/server"</span>;

export async function POST(req) {
  <span class="kw">const</span> body = await <span class="fn">parseToonRequest</span>(req);
  <span class="kw">return</span> <span class="fn">ToonResponse</span>.toon({ ok: <span class="kw">true</span>, received: body });
}`}</CodeBlock>
          </section>
          <section id="postman" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="postman"
              icon="🧪"
              title="Testing with Postman"
              subtitle="Manual API testing with TOON payloads"
            />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 24, lineHeight: 1.7 }}>
              Since TOON is plain text, testing is straightforward in Postman or any HTTP client.
              Follow these steps:
            </p>

            {[
              {
                num: "1",
                title: "Set Method",
                desc: "Select POST or GET as needed",
              },
              {
                num: "2",
                title: "Add Header",
                desc: (
                  <>
                    <code style={{ color: theme.yellow, fontFamily: "'Space Mono', monospace" }}>
                      Content-Type: text/plain
                    </code>
                  </>
                ),
              },
              {
                num: "3",
                title: "Raw Body",
                desc: "In Body tab, select raw → Text. Paste your TOON string.",
              },
              {
                num: "4",
                title: "Send",
                desc: "Hit Send. Response will be TOON text.",
              },
            ].map((item) => (
              <div
                key={item.num}
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 12,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: theme.accentDim,
                    color: theme.accent,
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {item.num}
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: theme.text, marginBottom: 4, fontSize: 13 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textDim }}>{item.desc}</div>
                </div>
              </div>
            ))}

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16, marginTop: 28 }}>
              Example TOON Body
            </h3>
            <CodeBlock label="Postman Body (raw text)">{`<span class="toon-key">device_id</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">s</span>}:
<span class="toon-val">DEVICE_PRO_01</span>

<span class="toon-key">battery</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">n</span>}:
<span class="toon-val">87</span>

<span class="toon-key">is_active</span>[<span class="num">1</span>]{<span class="num">0</span>:<span class="toon-type">b</span>}:
<span class="toon-val">true</span>`}</CodeBlock>
          </section>

          {/* ── PERFORMANCE ── */}
          <section id="performance" className="section-anim" style={{ marginBottom: 64 }}>
            <SectionHeader
              id="performance"
              icon="⚡"
              title="Performance & Size"
              subtitle="Why TOON is more efficient than JSON"
            />

            <p style={{ fontSize: 14, color: theme.textDim, marginBottom: 20, lineHeight: 1.7 }}>
              JSON repeats every key name in every object. TOON declares the schema once,
              then uses compact row values. For tabular data with many rows, this saves
              significant bytes and parsing time.
            </p>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
              Size Comparison
            </h3>
            <CodeBlock label="Same Data — JSON vs TOON">{`<span class="comment">// JSON: ~145 bytes</span>
{"devices":[{"device_id":"DEVICE_PRO_01","battery":87,"is_active":true},{"device_id":"DEVICE_PRO_02","battery":92,"is_active":false}]}

<span class="comment">// TOON: ~90 bytes (38% reduction)</span>
<span class="toon-key">devices</span>[<span class="num">2</span>]{<span class="toon-type">device_id:s,battery:n,is_active:b</span>}:
<span class="toon-val">DEVICE_PRO_01,87,true</span>
<span class="toon-val">DEVICE_PRO_02,92,false</span>`}</CodeBlock>

            <div className="docs-grid-2" style={{ marginTop: 24 }}>
              <div
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: theme.orange, marginBottom: 8 }}>
                  JSON
                </div>
                <ul
                  style={{
                    fontSize: 12,
                    color: theme.textDim,
                    lineHeight: 1.8,
                    textAlign: "left",
                    listStyle: "none",
                  }}
                >
                  <li>❌ Keys repeated per row</li>
                  <li>❌ Nested braces & quotes</li>
                  <li>❌ Heavier for tables</li>
                  <li>❌ More to parse</li>
                </ul>
              </div>
              <div
                style={{
                  background: theme.accentDim,
                  border: `1px solid ${theme.accent}44`,
                  borderRadius: 10,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: theme.accent, marginBottom: 8 }}>
                  TOON
                </div>
                <ul
                  style={{
                    fontSize: 12,
                    color: theme.textDim,
                    lineHeight: 1.8,
                    textAlign: "left",
                    listStyle: "none",
                  }}
                >
                  <li>✅ Keys declared once</li>
                  <li>✅ CSV-style rows</li>
                  <li>✅ Compact payloads</li>
                  <li>✅ Faster to parse</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 64,
                padding: "32px",
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text, marginBottom: 8 }}>
                Ready to use toonkit?
              </div>
              <p style={{ fontSize: 13, color: theme.textDim, marginBottom: 20, lineHeight: 1.6 }}>
                Install from npm, import the functions, and start converting between JSON and TOON.
                Perfect for REST APIs, bots, IoT devices, and any system where payload size matters.
              </p>
              <div className="docs-footer-actions">
                <a
                  href="https://github.com/ManojGowda89/toonkit"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    background: theme.accentDim,
                    border: `1px solid ${theme.accent}55`,
                    color: theme.accent,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  ⭐ GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/toonkit"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    background: `${theme.purple}22`,
                    border: `1px solid ${theme.purple}44`,
                    color: theme.purple,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  📦 NPM
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}