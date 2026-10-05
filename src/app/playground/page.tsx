"use client";

import { useState, useCallback } from "react";
import { jsonToToon, toonToJson } from "toonkit2";

// ── Types ─────────────────────────────────────────────────────────────────────
type InputMode = "json" | "toon" | "unknown";
type Status = "idle" | "loading" | "success" | "error";

interface ConversionResult {
  output: string;
  inputBytes: number;
  outputBytes: number;
  durationMs: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectInputType(value: string): InputMode {
  const trimmed = value.trim();
  if (!trimmed) return "unknown";
  try {
    JSON.parse(trimmed);
    return "json";
  } catch {
    try {
      parseJsonWithTrailingCommas(trimmed);
      return "json";
    } catch {
      // Continue with TOON detection.
    }
    // Check for TOON pattern: resourceName{...}: or resourceName[n]{...}:
    if (/\w+(\[\d+\])?\{[^}]+\}:/.test(trimmed)) return "toon";
    return "unknown";
  }
}

function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes}B` : `${(bytes / 1024).toFixed(1)}KB`;
}

function compactToonOutput(value: string): string {
  return value.replace(/\n{2,}/g, "\n").trim();
}

function removeTrailingCommas(value: string): string {
  let result = "";
  let quote: string | null = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (escaped) {
      result += character;
      escaped = false;
      continue;
    }

    if (quote) {
      result += character;
      if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      result += character;
      continue;
    }

    if (character === ",") {
      let next = index + 1;
      while (next < value.length && /\s/.test(value[next])) next += 1;
      if (value[next] === "}" || value[next] === "]") continue;
    }

    result += character;
  }

  return result;
}

function parseJsonWithTrailingCommas(value: string): unknown {
  return JSON.parse(removeTrailingCommas(value));
}

// ── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Unbounded:wght@400;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #060608;
    --panel:    #0e0e12;
    --border:   #1c1c24;
    --border2:  #252530;
    --cyan:     #00ffe0;
    --cyan-dim: rgba(0,255,224,0.08);
    --cyan-glow:rgba(0,255,224,0.18);
    --amber:    #ffb800;
    --red:      #ff4560;
    --green:    #00e676;
    --text:     #dcdcf0;
    --muted:    #55556a;
    --dim:      #8888a8;
    --mono:     'JetBrains Mono', monospace;
    --display:  'Unbounded', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--mono); }

  .pg-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  /* ── Header ── */
  .pg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .pg-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .pg-logo {
    width: 34px; height: 34px;
    background: var(--cyan);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--display);
    font-weight: 900;
    font-size: 15px;
    color: #000;
    flex-shrink: 0;
  }

  .pg-title {
    font-family: var(--display);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .pg-title span {
    color: var(--cyan);
  }

  .pg-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Status bar (shows detected type + direction) ── */
  .pg-statusbar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px 32px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    color: var(--muted);
    flex-wrap: wrap;
  }

  .pg-status-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pg-status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--muted);
    flex-shrink: 0;
  }
  .pg-status-dot.cyan  { background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }
  .pg-status-dot.amber { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
  .pg-status-dot.green { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .pg-status-dot.red   { background: var(--red); }

  /* ── Main split layout ── */
  .pg-main {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 56px 1fr;
    gap: 0;
    min-height: calc(100vh - 120px);
  }

  /* ── Editor pane ── */
  .pg-pane {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-top: none;
    background: var(--panel);
    position: relative;
    overflow: hidden;
  }

  .pg-pane-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    border-bottom: 1px solid var(--border);
    background: rgba(0,0,0,0.3);
    flex-shrink: 0;
  }

  .pg-pane-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--muted);
  }

  .pg-pane-label.active-json { color: var(--amber); }
  .pg-pane-label.active-toon { color: var(--cyan); }

  .pg-pane-icon {
    font-size: 13px;
  }

  .pg-pane-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pg-pill {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    font-family: var(--mono);
    letter-spacing: 0.06em;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
    background: transparent;
    color: var(--muted);
  }

  .pg-pill:hover { color: var(--text); border-color: var(--border2); }

  .pg-pill.json-pill {
    border-color: rgba(255,184,0,0.4);
    color: var(--amber);
    background: rgba(255,184,0,0.08);
  }

  .pg-pill.toon-pill {
    border-color: rgba(0,255,224,0.4);
    color: var(--cyan);
    background: rgba(0,255,224,0.08);
  }

  /* ── Textarea ── */
  .pg-editor {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    padding: 20px;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.75;
    color: var(--text);
    caret-color: var(--cyan);
    min-height: 340px;
  }

  .pg-editor::placeholder { color: var(--muted); }

  .pg-editor.readonly {
    color: var(--dim);
    cursor: default;
    user-select: all;
  }

  .pg-editor.has-error { color: var(--red); }

  /* ── Center divider ── */
  .pg-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: var(--bg);
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
    padding: 16px 0;
  }

  /* ── Convert button ── */
  .pg-convert-btn {
    width: 40px; height: 40px;
    border-radius: 10px;
    border: 1px solid var(--cyan);
    background: var(--cyan-dim);
    color: var(--cyan);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .pg-convert-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--cyan);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .pg-convert-btn:hover::before { opacity: 0.12; }
  .pg-convert-btn:hover { box-shadow: 0 0 16px var(--cyan-glow); }

  .pg-convert-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: var(--muted);
    color: var(--muted);
  }

  .pg-convert-btn.loading {
    animation: spin 0.6s linear infinite;
  }

  .pg-direction-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-align: center;
    line-height: 1.4;
    padding: 0 4px;
  }

  /* ── Footer stats ── */
  .pg-pane-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 18px;
    border-top: 1px solid var(--border);
    background: rgba(0,0,0,0.2);
    font-size: 10px;
    color: var(--muted);
    flex-shrink: 0;
  }

  .pg-stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pg-stat-val { color: var(--dim); }
  .pg-stat-val.cyan  { color: var(--cyan); }
  .pg-stat-val.green { color: var(--green); }
  .pg-stat-val.amber { color: var(--amber); }

  /* ── Savings bar ── */
  .pg-savings {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 32px;
    background: rgba(0, 255, 224, 0.04);
    border-bottom: 1px solid rgba(0,255,224,0.1);
    font-size: 11px;
    color: var(--dim);
    animation: fadeIn 0.3s ease;
  }

  .pg-savings-bar-wrap {
    flex: 1;
    height: 3px;
    background: var(--border2);
    border-radius: 2px;
    overflow: hidden;
    max-width: 200px;
  }

  .pg-savings-bar {
    height: 100%;
    background: var(--cyan);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .pg-savings strong { color: var(--cyan); }

  /* ── Examples panel ── */
  .pg-examples {
    display: flex;
    gap: 8px;
    padding: 12px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    overflow-x: auto;
    flex-wrap: wrap;
  }

  .pg-ex-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    align-self: center;
    white-space: nowrap;
    margin-right: 4px;
  }

  .pg-ex-btn {
    padding: 5px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-family: var(--mono);
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--dim);
    transition: all 0.15s;
    white-space: nowrap;
  }

  .pg-ex-btn:hover {
    border-color: var(--cyan);
    color: var(--cyan);
    background: var(--cyan-dim);
  }

  /* ── Animations ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

  .pg-loading-pulse { animation: pulse 1s ease infinite; }

  /* ── Copy btn ── */
  .pg-copy-btn {
    padding: 3px 10px;
    border-radius: 5px;
    font-size: 10px;
    font-family: var(--mono);
    font-weight: 700;
    cursor: pointer;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--muted);
    transition: all 0.15s;
  }
  .pg-copy-btn:hover { color: var(--text); border-color: var(--dim); }
  .pg-copy-btn.copied { color: var(--green); border-color: var(--green); }

  /* ── Auto-detect badge ── */
  .pg-detect-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 9px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .pg-detect-badge.json {
    background: rgba(255,184,0,0.1);
    color: var(--amber);
    border: 1px solid rgba(255,184,0,0.3);
  }
  .pg-detect-badge.toon {
    background: var(--cyan-dim);
    color: var(--cyan);
    border: 1px solid rgba(0,255,224,0.3);
  }
  .pg-detect-badge.unknown {
    background: rgba(136,136,168,0.1);
    color: var(--muted);
    border: 1px solid var(--border2);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  @media (max-width: 1024px) {
    .pg-main {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .pg-divider {
      flex-direction: row;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-left: none;
      border-right: none;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .pg-direction-label {
      white-space: normal;
      text-align: left;
    }

    .pg-pane {
      border-top: 1px solid var(--border);
    }

    .pg-pane-footer,
    .pg-statusbar,
    .pg-savings,
    .pg-header,
    .pg-examples {
      padding-left: 16px;
      padding-right: 16px;
    }

    .pg-savings {
      flex-wrap: wrap;
    }

    .pg-pane-footer {
      flex-wrap: wrap;
      gap: 8px 12px;
    }
  }

  @media (max-width: 640px) {
    .pg-header {
      gap: 10px;
    }

    .pg-brand {
      width: 100%;
      justify-content: center;
      gap: 10px;
    }

    .pg-title {
      font-size: 14px;
      text-align: center;
    }

    .pg-statusbar {
      gap: 10px 14px;
      font-size: 10px;
    }

    .pg-examples {
      gap: 6px;
    }

    .pg-ex-btn {
      font-size: 10px;
      padding: 5px 10px;
    }

    .pg-editor {
      padding: 16px;
      font-size: 12px;
      line-height: 1.65;
      min-height: 260px;
    }

    .pg-pane-header,
    .pg-pane-footer {
      padding-left: 14px;
      padding-right: 14px;
    }

    .pg-pane-header {
      gap: 8px;
    }

    .pg-pane-actions {
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .pg-pill {
      padding: 3px 8px;
    }

    .pg-convert-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
    }
  }
`;

// ── Example presets ─────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    label: "Employee list",
    type: "json" as const,
    value: JSON.stringify({
      employees: [
        { id: 1, name: "Riya", salary: 90000, active: true },
        { id: 2, name: "John", salary: 80000, active: false },
        { id: 3, name: "Alex", salary: 95000, active: true },
      ],
    }, null, 2),
  },
  {
    label: "Paginated",
    type: "json" as const,
    value: JSON.stringify({
      meta: { page: 1, limit: 10, total: 200 },
      employees: [
        { id: 1, name: "Riya", salary: 90000, active: true },
        { id: 2, name: "John", salary: 80000, active: false },
      ],
    }, null, 2),
  },
  {
    label: "TOON → JSON",
    type: "toon" as const,
    value: `employees[2]{id:n,name:s,salary:n,active:b}:\n1,Riya,90000,true\n2,John,80000,false`,
  },
  {
    label: "All types",
    type: "toon" as const,
    value: `sample[1]{age:n,name:s,active:b,data:j,tags:a,value:nl}:\n25,Manoj,true,{"x":1},["a","b"],null`,
  },
  {
    label: "Strings",
    type: "json" as const,
    value: JSON.stringify({
      greeting: "Hello, TOON!",
      sentence: "Commas, quotes, and spaces stay intact",
      empty: "",
    }, null, 2),
  },
  {
    label: "Numbers",
    type: "json" as const,
    value: JSON.stringify({
      integer: 42,
      decimal: 98.6,
      negative: -12,
      zero: 0,
    }, null, 2),
  },
  {
    label: "Booleans + null",
    type: "json" as const,
    value: JSON.stringify({
      enabled: true,
      archived: false,
      missing: null,
    }, null, 2),
  },
  {
    label: "Nested object",
    type: "json" as const,
    value: JSON.stringify({
      user: {
        id: 7,
        profile: {
          name: "Ava",
          location: "Bengaluru, India",
        },
      },
    }, null, 2),
  },
  {
    label: "Nested arrays",
    type: "json" as const,
    value: JSON.stringify({
      tags: ["toon", "json", "fast"],
      matrix: [[1, 2], [3, 4]],
      records: [{ id: 1, values: ["a,b", "c"] }],
    }, null, 2),
  },
  {
    label: "Timestamp",
    type: "toon" as const,
    value: `created_at[1]{0:td}:\n2026-10-05T12:00:00Z`,
  },
  {
    label: "Typed row",
    type: "toon" as const,
    value: `records[2]{name:s,score:n,active:b,meta:j,tags:a,value:nl,created:td}:\n"Ava, Rao",98.5,true,{"team":"platform"},["api","toon"],null,2026-10-05T12:00:00Z\n"Leo",87,false,{"team":"web"},["docs","ui"],null,2026-10-04T09:30:00Z`,
  },
  {
    label: "Multi-resource",
    type: "toon" as const,
    value: `meta{page:n,limit:n,total:n}:\n1,10,200\n\nemployees[2]{id:n,name:s,salary:n}:\n1,Riya,90000\n2,John,80000`,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Playground() {
  const [input, setInput] = useState(
    JSON.stringify({ employees: [{ id: 1, name: "Riya", salary: 90000, active: true }] }, null, 2)
  );
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const detectedType = detectInputType(input);

  // Direction label derived from detection
  const directionLabel =
    detectedType === "json"
      ? "JSON\n→\nTOON"
      : detectedType === "toon"
      ? "TOON\n→\nJSON"
      : "AUTO";

  const convert = useCallback(async () => {
    if (!input.trim() || detectedType === "unknown") return;

    setStatus("loading");
    setErrorMsg("");
    const t0 = performance.now();

    try {
      // Keep the playground fully static-host compatible: conversion happens in
      // the browser instead of depending on Next.js API routes.
      const outputText =
        detectedType === "json"
          ? compactToonOutput(jsonToToon(parseJsonWithTrailingCommas(input)))
          : JSON.stringify(toonToJson(input), null, 2);

      const durationMs = Math.round(performance.now() - t0);
      setOutput(outputText);
      setResult({
        output: outputText,
        inputBytes: new TextEncoder().encode(input).length,
        outputBytes: new TextEncoder().encode(outputText).length,
        durationMs,
      });
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed");
      setOutput("");
      setResult(null);
      setStatus("error");
    }
  }, [input, detectedType]);

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard?.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadExample = (ex: (typeof EXAMPLES)[0]) => {
    setInput(ex.value);
    setOutput("");
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
  };

  const formatJson = () => {
    try {
      const normalized = removeTrailingCommas(input);
      setInput(JSON.stringify(JSON.parse(normalized), null, 2));
      setStatus("idle");
      setErrorMsg("");
      setOutput("");
      setResult(null);
    } catch (error) {
      setStatus("error");
      setErrorMsg(
        `JSON formatting failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // Savings calculation
  const savingsPct =
    result && detectedType === "json" && result.inputBytes > 0
      ? Math.round(((result.inputBytes - result.outputBytes) / result.inputBytes) * 100)
      : null;

  return (
    <>
      <style>{css}</style>
      <div className="pg-root">
        {/* Header */}
        <header className="pg-header">
          <div className="pg-brand">
            <div className="pg-logo">T</div>
            <span className="pg-title">
              toon<span>kit</span> playground
            </span>
          </div>
          <div className="pg-header-right">
            <span
              className={`pg-detect-badge ${detectedType}`}
            >
              <span
                className={`pg-status-dot ${
                  detectedType === "json"
                    ? "amber"
                    : detectedType === "toon"
                    ? "cyan"
                    : ""
                }`}
              />
              {detectedType === "json"
                ? "JSON detected"
                : detectedType === "toon"
                ? "TOON detected"
                : "Paste to begin"}
            </span>
          </div>
        </header>

        {/* Status bar */}
        <div className="pg-statusbar">
          <div className="pg-status-item">
            <span className={`pg-status-dot ${status === "success" ? "green" : status === "error" ? "red" : status === "loading" ? "amber" : ""}`} />
            <span>
              {status === "idle" && "Ready"}
              {status === "loading" && <span className="pg-loading-pulse">Converting...</span>}
              {status === "success" && `Done in ${result?.durationMs}ms`}
              {status === "error" && errorMsg}
            </span>
          </div>
          {result && (
            <>
              <div className="pg-status-item">
                <span>Input</span>
                <span className="pg-stat-val amber">{formatBytes(result.inputBytes)}</span>
              </div>
              <div className="pg-status-item">
                <span>Output</span>
                <span className="pg-stat-val cyan">{formatBytes(result.outputBytes)}</span>
              </div>
              {savingsPct !== null && (
                <div className="pg-status-item">
                  <span>TOON is</span>
                  <span className={`pg-stat-val ${savingsPct > 0 ? "green" : "red"}`}>
                    {savingsPct > 0 ? `${savingsPct}% smaller` : `${Math.abs(savingsPct)}% larger`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Savings progress bar */}
        {savingsPct !== null && savingsPct > 0 && (
          <div className="pg-savings">
            <strong>{savingsPct}% saved</strong>
            <div className="pg-savings-bar-wrap">
              <div
                className="pg-savings-bar"
                style={{ width: `${Math.min(savingsPct, 100)}%` }}
              />
            </div>
            <span>
              {formatBytes(result!.inputBytes)} JSON → {formatBytes(result!.outputBytes)} TOON
            </span>
          </div>
        )}

        {/* Example presets */}
        <div className="pg-examples">
          <span className="pg-ex-label">Examples:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              className="pg-ex-btn"
              onClick={() => loadExample(ex)}
            >
              {ex.type === "json" ? "{ }" : "[ ]"} {ex.label}
            </button>
          ))}
        </div>

        {/* Main split editor */}
        <div className="pg-main">
          {/* Input pane */}
          <div className="pg-pane">
            <div className="pg-pane-header">
              <span className={`pg-pane-label ${detectedType === "json" ? "active-json" : detectedType === "toon" ? "active-toon" : ""}`}>
                <span className="pg-pane-icon">
                  {detectedType === "json" ? "{ }" : detectedType === "toon" ? "[ ]" : "✏"}
                </span>
                {detectedType === "json" ? "JSON Input" : detectedType === "toon" ? "TOON Input" : "Input"}
              </span>
              <div className="pg-pane-actions">
                <button
                  className="pg-pill"
                  onClick={formatJson}
                  disabled={!input.trim() || detectedType === "toon"}
                  title="Remove trailing commas and format JSON"
                >
                  format JSON
                </button>
                <button
                  className="pg-pill"
                  onClick={() => {
                    setInput("");
                    setOutput("");
                    setResult(null);
                    setStatus("idle");
                    setErrorMsg("");
                  }}
                >
                  clear
                </button>
              </div>
            </div>
            <textarea
              className="pg-editor"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setStatus("idle");
                setErrorMsg("");
                setOutput("");
                setResult(null);
              }}
              placeholder={`Paste JSON or TOON here — auto-detected\n\nJSON example:\n{\n  "employees": [\n    { "id": 1, "name": "Riya" }\n  ]\n}\n\nTOON example:\nemployees[1]{id:n,name:s}:\n1,Riya`}
              spellCheck={false}
            />
            <div className="pg-pane-footer">
              <span className="pg-stat">
                chars{" "}
                <span className="pg-stat-val">{input.length.toLocaleString()}</span>
              </span>
              <span className="pg-stat">
                size{" "}
                <span className="pg-stat-val">
                  {formatBytes(new TextEncoder().encode(input).length)}
                </span>
              </span>
              <span className="pg-stat">
                lines{" "}
                <span className="pg-stat-val">
                  {input.split("\n").length}
                </span>
              </span>
            </div>
          </div>

          {/* Center divider + convert button */}
          <div className="pg-divider">
            <div
              className="pg-direction-label"
              style={{ whiteSpace: "pre" }}
            >
              {directionLabel}
            </div>
            <button
              className={`pg-convert-btn${status === "loading" ? " loading" : ""}`}
              onClick={convert}
              disabled={status === "loading" || detectedType === "unknown"}
              title={
                detectedType === "unknown"
                  ? "Paste valid JSON or TOON first"
                  : detectedType === "json"
                  ? "Convert JSON → TOON"
                  : "Convert TOON → JSON"
              }
            >
              {status === "loading" ? "⟳" : "⇄"}
            </button>
          </div>

          {/* Output pane */}
          <div className="pg-pane">
            <div className="pg-pane-header">
              <span className={`pg-pane-label ${
                status === "success"
                  ? detectedType === "json"
                    ? "active-toon"
                    : "active-json"
                  : ""
              }`}>
                <span className="pg-pane-icon">
                  {status === "success"
                    ? detectedType === "json"
                      ? "[ ]"
                      : "{ }"
                    : "◎"}
                </span>
                {status === "success"
                  ? detectedType === "json"
                    ? "TOON Output"
                    : "JSON Output"
                  : "Output"}
              </span>
              <div className="pg-pane-actions">
                {output && (
                  <button
                    className={`pg-copy-btn${copied ? " copied" : ""}`}
                    onClick={copyOutput}
                  >
                    {copied ? "✓ copied" : "copy"}
                  </button>
                )}
              </div>
            </div>
            <textarea
              className={`pg-editor readonly${status === "error" ? " has-error" : ""}`}
              value={
                status === "error"
                  ? `// Error: ${errorMsg}`
                  : status === "loading"
                  ? "// Converting..."
                  : status === "idle" && !output
                  ? ""
                  : output
              }
              readOnly
              placeholder="Output will appear here after conversion →"
              spellCheck={false}
            />
            <div className="pg-pane-footer">
              <span className="pg-stat">
                chars{" "}
                <span className={`pg-stat-val ${output && status === "success" ? "cyan" : ""}`}>
                  {output.length.toLocaleString()}
                </span>
              </span>
              <span className="pg-stat">
                size{" "}
                <span className={`pg-stat-val ${result ? "green" : ""}`}>
                  {result ? formatBytes(result.outputBytes) : "0B"}
                </span>
              </span>
              <span className="pg-stat">
                lines{" "}
                <span className="pg-stat-val">
                  {output ? output.split("\n").length : 0}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}