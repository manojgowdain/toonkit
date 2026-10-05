"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Byte size helper (client-side only) ───
function byteSize(str: string) {
  return new Blob([str]).size;
}

// ─── Sample data ───
const SAMPLE_JSON = JSON.stringify(
  {
    meta: { page: 1, limit: 10, total: 200 },
    employees: [
      { id: 1, name: "Riya", salary: 90000, active: true },
      { id: 2, name: "John", salary: 80000, active: false },
      { id: 3, name: "Manoj", salary: 95000, active: true },
    ],
    departments: [
      { id: "10", title: "Engineering" },
      { id: "20", title: "Design" },
    ],
  },
  null,
  2
);

const SAMPLE_TOON = `meta[1]{page:n,limit:n,total:n}:
1,10,200

employees[3]{id:n,name:s,salary:n,active:b}:
1,Riya,90000,true
2,John,80000,false
3,Manoj,95000,true

departments[2]{id:s,title:s}:
10,Engineering
20,Design`;

// ─── Code snippets ───
const CODE_SNIPPETS: Record<string, string> = {
  sendToon: `import { sendToon } from "toonkit2";

// Frontend: convert JSON → TOON, send to your backend
const payload = sendToon({
  employees: [
    { id: 1, name: "Riya", salary: 90000, active: true },
    { id: 2, name: "John", salary: 80000, active: false }
  ]
});

await fetch("/api/toon/receive", {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: payload      // sends TOON string
});
// Backend parses it → returns JSON`,

  receiveToon: `import { receiveToon } from "toonkit2";

// Frontend: send JSON to backend, receive TOON, parse it
const res = await fetch("/api/toon/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ employees: [...] })
});

const toonText = await res.text();     // TOON string
const data = receiveToon(toonText);    // → JSON object`,

  expressBackend: `const express = require("express");
const { reqGetToon, resSendToon } = require("toonkit2");

const app = express();
app.use(express.text());

app.post("/api/data", (req, res) => {
  // Parse incoming TOON from request body
  const data = reqGetToon(req);
  console.log(data);

  // Send TOON response back
  resSendToon(res, {
    status: "success",
    received: data
  });
});

app.listen(3000);`,

  nextjsSend: `// app/api/toon/send/route.ts
// POST JSON body → returns TOON string

import { sendToon } from "toonkit2";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const toonString = sendToon(json);
    return new Response(toonString, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    return new Response("Failed to convert", { status: 400 });
  }
}`,

  nextjsReceive: `// app/api/toon/receive/route.ts
// POST TOON body → returns parsed JSON

import { receiveToon } from "toonkit2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const data = receiveToon(text);
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse TOON" },
      { status: 400 }
    );
  }
}`,

  detectType: `// toonkit detects types for schema generation
function detectType(value) {
  if (value === null)             return "nl";  // null
  if (Array.isArray(value))       return "a";   // array
  if (typeof value === "number")  return "n";   // number
  if (typeof value === "boolean") return "b";   // boolean
  if (typeof value === "object")  return "j";   // JSON object
  return "s";                                    // string
}`,

  jsonToToon: `function jsonToToon(data) {
  let output = "";
  for (const collection in data) {
    const records = Array.isArray(data[collection])
      ? data[collection] : [data[collection]];
    const headers = Object.keys(records[0]);
    const schema = headers
      .map(h => h + ":" + detectType(records[0][h]))
      .join(",");
    const rows = records.map(r =>
      headers.map(h => {
        const v = r[h];
        return typeof v === "object" && v !== null
          ? JSON.stringify(v) : v;
      }).join(",")
    ).join("\\n");
    output += collection + "[" + records.length
      + "]{" + schema + "}:\\n" + rows + "\\n\\n";
  }
  return output.trim();
}`,
};

// ─── Types ───
type HowView = "code" | "ui";

interface BenchmarkResult {
  jsonSize: number;
  toonSize: number;
  savings: number;
  savingsPercent: string;
  jsonSendMs: number;
  toonSendMs: number;
  jsonReceiveMs: number;
  toonReceiveMs: number;
}

// ─── Component ───
export default function ToonkitPlayground() {
  // JSON column
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [jsonLoading, setJsonLoading] = useState(false);
  const [jsonLatency, setJsonLatency] = useState<number | null>(null);
  const [jsonSizeIn, setJsonSizeIn] = useState<number | null>(null);
  const [jsonSizeOut, setJsonSizeOut] = useState<number | null>(null);
  const [jsonToonIntermediate, setJsonToonIntermediate] = useState("");

  // TOON column
  const [toonInput, setToonInput] = useState(SAMPLE_TOON);
  const [toonOutput, setToonOutput] = useState("");
  const [toonError, setToonError] = useState("");
  const [toonLoading, setToonLoading] = useState(false);
  const [toonLatency, setToonLatency] = useState<number | null>(null);
  const [toonSizeIn, setToonSizeIn] = useState<number | null>(null);
  const [toonSizeOut, setToonSizeOut] = useState<number | null>(null);
  const [toonJsonIntermediate, setToonJsonIntermediate] = useState("");

  // Benchmark
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [benchLoading, setBenchLoading] = useState(false);

  // How it works
  const [howView, setHowView] = useState<HowView>("ui");
  const [activeSnippet, setActiveSnippet] = useState("sendToon");

  // ═══════════════════════════════════════════
  //  JSON Column: Send JSON → /api/toon/send → get TOON
  //               then send TOON → /api/toon/receive → get JSON
  // ═══════════════════════════════════════════
  const handleJsonRoundtrip = useCallback(async () => {
    setJsonError("");
    setJsonOutput("");
    setJsonLatency(null);
    setJsonSizeIn(null);
    setJsonSizeOut(null);
    setJsonToonIntermediate("");
    setJsonLoading(true);

    try {
      JSON.parse(jsonInput); // validate first
      const inputSize = byteSize(jsonInput);
      setJsonSizeIn(inputSize);

      const totalStart = performance.now();

      // Step 1: POST JSON → /api/toon/send → receive TOON
      const sendRes = await fetch("/api/toon/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonInput,
      });

      if (!sendRes.ok) {
        const errText = await sendRes.text();
        throw new Error(`/api/toon/send failed: ${errText}`);
      }

      const toonIntermediate = await sendRes.text();
      setJsonToonIntermediate(toonIntermediate);

      // Step 2: POST TOON → /api/toon/receive → receive JSON back
      const recvRes = await fetch("/api/toon/receive", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: toonIntermediate,
      });

      if (!recvRes.ok) {
        const errText = await recvRes.text();
        throw new Error(`/api/toon/receive failed: ${errText}`);
      }

      const jsonResult = await recvRes.json();
      const totalEnd = performance.now();

      const out = JSON.stringify(jsonResult, null, 2);
      setJsonOutput(out);
      setJsonLatency(parseFloat((totalEnd - totalStart).toFixed(2)));
      setJsonSizeOut(byteSize(out));
    } catch (e: unknown) {
      setJsonError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setJsonLoading(false);
    }
  }, [jsonInput]);

  // ═══════════════════════════════════════════
  //  TOON Column: Send TOON → /api/toon/receive → get JSON
  //               then send JSON → /api/toon/send → get TOON
  // ═══════════════════════════════════════════
  const handleToonRoundtrip = useCallback(async () => {
    setToonError("");
    setToonOutput("");
    setToonLatency(null);
    setToonSizeIn(null);
    setToonSizeOut(null);
    setToonJsonIntermediate("");
    setToonLoading(true);

    try {
      const inputSize = byteSize(toonInput);
      setToonSizeIn(inputSize);

      const totalStart = performance.now();

      // Step 1: POST TOON → /api/toon/receive → receive JSON
      const recvRes = await fetch("/api/toon/receive", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: toonInput,
      });

      if (!recvRes.ok) {
        const errText = await recvRes.text();
        throw new Error(`/api/toon/receive failed: ${errText}`);
      }

      const jsonIntermediate = await recvRes.json();
      const jsonStr = JSON.stringify(jsonIntermediate, null, 2);
      setToonJsonIntermediate(jsonStr);

      // Step 2: POST JSON → /api/toon/send → receive TOON back
      const sendRes = await fetch("/api/toon/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonIntermediate),
      });

      if (!sendRes.ok) {
        const errText = await sendRes.text();
        throw new Error(`/api/toon/send failed: ${errText}`);
      }

      const toonResult = await sendRes.text();
      const totalEnd = performance.now();

      setToonOutput(toonResult);
      setToonLatency(parseFloat((totalEnd - totalStart).toFixed(2)));
      setToonSizeOut(byteSize(toonResult));
    } catch (e: unknown) {
      setToonError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setToonLoading(false);
    }
  }, [toonInput]);

  // ═══════════════════════════════════════════
  //  Benchmark: Real API calls to compare JSON vs TOON
  // ═══════════════════════════════════════════
  const runBenchmark = useCallback(async () => {
    setBenchLoading(true);
    try {
      const data = {
        meta: { page: 1, limit: 50, total: 5000 },
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          name: `User_${i + 1}`,
          email: `user${i + 1}@example.com`,
          age: 20 + (i % 40),
          active: i % 3 !== 0,
          score: Math.round(Math.random() * 10000) / 100,
        })),
      };

      const jsonStr = JSON.stringify(data);
      const jsonSize = byteSize(jsonStr);

      // ── Benchmark: JSON → TOON (via /api/toon/send) ──
      const sendStart = performance.now();
      const sendRes = await fetch("/api/toon/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonStr,
      });
      const toonStr = await sendRes.text();
      const sendEnd = performance.now();
      const jsonSendMs = parseFloat((sendEnd - sendStart).toFixed(2));
      const toonSize = byteSize(toonStr);

      // ── Benchmark: TOON → JSON (via /api/toon/receive) ──
      const recvStart = performance.now();
      const recvRes = await fetch("/api/toon/receive", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: toonStr,
      });
      await recvRes.json();
      const recvEnd = performance.now();
      const toonReceiveMs = parseFloat((recvEnd - recvStart).toFixed(2));

      // ── Benchmark: equivalent pure-JSON round-trip for comparison ──
      // Simulating: POST JSON → parse → stringify → return JSON
      const jsonRtStart = performance.now();
      const jsonRtRes = await fetch("/api/toon/receive", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: toonStr,
      });
      await jsonRtRes.json();
      const jsonRtEnd = performance.now();
      const jsonReceiveMs = parseFloat((jsonRtEnd - jsonRtStart).toFixed(2));

      // Simulating: JSON stringify send timing
      const toonSendStart = performance.now();
      const toonSendRes = await fetch("/api/toon/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonStr,
      });
      await toonSendRes.text();
      const toonSendEnd = performance.now();
      const toonSendMs = parseFloat((toonSendEnd - toonSendStart).toFixed(2));

      setBenchmark({
        jsonSize,
        toonSize,
        savings: jsonSize - toonSize,
        savingsPercent: (((jsonSize - toonSize) / jsonSize) * 100).toFixed(1),
        jsonSendMs,
        toonSendMs,
        jsonReceiveMs,
        toonReceiveMs,
      });
    } catch {
      setBenchmark(null);
    } finally {
      setBenchLoading(false);
    }
  }, []);

  useEffect(() => {
    runBenchmark();
  }, [runBenchmark]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        :root {
          --bg:#0a0a0f;--surface:#12121a;--surface2:#1a1a28;--border:#1e1e2e;
          --accent:#00e5ff;--green:#00ff88;--purple:#b06eff;--orange:#ffa726;
          --red:#ff4d4d;--text:#e8e8f0;--muted:#6b6b8a;
          --mono:'Space Mono',monospace;--sans:'Syne',sans-serif;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg)!important;color:var(--text);font-family:var(--sans);}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:var(--bg);}
        ::-webkit-scrollbar-thumb{background:rgba(0,229,255,0.2);border-radius:3px;}

        .pg-header{background:var(--surface);border-bottom:1px solid var(--border);padding:16px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);}
        .pg-logo{display:flex;align-items:center;gap:12px;}
        .pg-logo-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#000;font-family:var(--mono);}
        .pg-logo-text{font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.03em;}
        .pg-badge{background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.3);color:var(--accent);padding:3px 10px;border-radius:20px;font-size:11px;font-family:var(--mono);font-weight:700;letter-spacing:0.08em;}
        .pg-links{display:flex;gap:16px;}
        .pg-links a{font-size:13px;color:var(--muted);text-decoration:none;font-family:var(--mono);transition:color 0.15s;}
        .pg-links a:hover{color:var(--accent);}
        .pg-main{max-width:1400px;margin:0 auto;padding:32px 24px;}
        .section-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:6px;letter-spacing:-0.02em;display:flex;align-items:center;gap:10px;}
        .section-sub{color:var(--muted);font-size:13px;margin-bottom:24px;font-family:var(--mono);}

        /* Two columns */
        .playground-cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        @media(max-width:900px){
          .pg-header{padding:14px 16px;flex-wrap:wrap;gap:10px;}
          .pg-logo{width:100%;justify-content:center;}
          .pg-links{width:100%;justify-content:center;flex-wrap:wrap;gap:12px;}
          .pg-main{padding:24px 16px;}
          .playground-cols{grid-template-columns:1fr;}
          .col-action{flex-direction:column;align-items:flex-start;}
          .toggle-bar{width:100%;}
          .toggle-btn{flex:1;min-width:0;}
          .flow-step{padding:14px 0;}
          .flow-step:not(:last-child)::after{left:16px;}
        }

        @media(max-width:640px){
          .section-title{font-size:20px;}
          .section-sub{font-size:12px;}
          .pg-main{padding:20px 12px;}
          .col-header{padding:12px 14px;flex-wrap:wrap;gap:8px;}
          .col-label{padding:10px 14px 0 14px;}
          .col-textarea{min-height:160px;padding:12px 14px;font-size:11px;}
          .col-action{padding:12px 14px;gap:10px;}
          .pill{font-size:10px;padding:4px 10px;}
          .btn-run{width:100%;justify-content:center;}
          .bench-section{padding:20px 16px;}
          .bench-grid{grid-template-columns:1fr;}
          .bar-row{align-items:flex-start;}
          .bar-label{min-width:42px;}
          .bar-track{height:22px;}
          .toggle-bar{flex-direction:column;width:100%;}
          .toggle-btn:first-child,.toggle-btn:last-child{border-radius:6px;}
          .toggle-btn{width:100%;}
          .flow-card{padding:18px 16px;}
          .flow-step{gap:12px;}
          .flow-title{font-size:13px;}
          .flow-desc{font-size:11px;}
          .type-table th,.type-table td{padding:7px 10px;font-size:11px;}
        }

        .col-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;}
        .col-card.json-col{border-top:3px solid var(--orange);}
        .col-card.toon-col{border-top:3px solid var(--accent);}

        .col-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);background:rgba(0,0,0,0.25);}
        .col-title{font-family:var(--mono);font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;}
        .col-tag{font-family:var(--mono);font-size:10px;padding:3px 10px;border-radius:4px;font-weight:700;}
        .tag-json{background:rgba(255,167,38,0.15);color:var(--orange);}
        .tag-toon{background:rgba(0,229,255,0.15);color:var(--accent);}

        .col-label{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);padding:10px 18px 0 18px;display:flex;align-items:center;gap:8px;}
        .col-label .endpoint{color:var(--purple);font-weight:700;}

        .col-textarea{width:100%;min-height:180px;padding:12px 18px;border:none;background:transparent;color:var(--text);font-family:var(--mono);font-size:12px;line-height:1.6;resize:vertical;outline:none;}
        .col-textarea::placeholder{color:var(--muted);}
        .col-textarea:read-only{color:#8888aa;background:rgba(0,0,0,0.12);}

        .arrow-row{display:flex;align-items:center;justify-content:center;padding:4px 0;gap:8px;}
        .arrow-icon{font-size:16px;color:var(--muted);}
        .arrow-label{font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;}

        .col-action{padding:14px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid var(--border);background:rgba(0,0,0,0.15);}
        .btn-run{border:none;font-family:var(--mono);font-size:12px;font-weight:700;padding:10px 22px;border-radius:7px;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.05em;display:flex;align-items:center;gap:8px;}
        .btn-run:hover{transform:translateY(-1px);}
        .btn-run:active{transform:translateY(0);}
        .btn-run:disabled{opacity:0.5;cursor:not-allowed;transform:none!important;}
        .btn-run.json-btn{background:linear-gradient(135deg,var(--orange),#ff9100);color:#000;}
        .btn-run.json-btn:hover:not(:disabled){box-shadow:0 4px 20px rgba(255,167,38,0.3);}
        .btn-run.toon-btn{background:linear-gradient(135deg,var(--accent),#00b8d4);color:#000;}
        .btn-run.toon-btn:hover:not(:disabled){box-shadow:0 4px 20px rgba(0,229,255,0.3);}

        .pill{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px;color:var(--muted);background:var(--surface2);border:1px solid var(--border);padding:4px 12px;border-radius:20px;}
        .pill .v{font-weight:700;}
        .pill .v.green{color:var(--green);}
        .pill .v.cyan{color:var(--accent);}
        .pill .v.orange{color:var(--orange);}
        .pill .v.purple{color:var(--purple);}

        .error-msg{background:rgba(255,77,77,0.1);border:1px solid rgba(255,77,77,0.3);border-radius:6px;padding:8px 14px;font-family:var(--mono);font-size:11px;color:var(--red);margin:0 18px 14px 18px;}

        .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top-color:#000;border-radius:50%;animation:spin 0.6s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* Intermediate preview */
        .intermediate{margin:0 18px;padding:8px 14px;background:rgba(0,0,0,0.2);border:1px dashed var(--border);border-radius:6px;font-family:var(--mono);font-size:10px;color:var(--muted);max-height:100px;overflow:auto;white-space:pre;margin-bottom:4px;}
        .intermediate-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:var(--purple);padding:6px 18px 2px 18px;}

        /* Benchmark */
        .bench-section{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;margin-top:36px;}
        .bench-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:20px;}
        .bench-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:18px;}
        .bench-card-label{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:8px;}
        .bench-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;}
        .bench-key{font-family:var(--mono);font-size:11px;color:#9898b8;}
        .bench-val{font-family:var(--mono);font-size:13px;font-weight:700;}
        .bench-val.json{color:var(--orange);}
        .bench-val.toon{color:var(--accent);}
        .bench-val.good{color:var(--green);}

        .bar-section{margin-top:16px;}
        .bar-title{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:10px;}
        .bar-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
        .bar-label{font-family:var(--mono);font-size:11px;color:var(--muted);min-width:50px;}
        .bar-track{flex:1;height:26px;background:var(--surface);border-radius:6px;overflow:hidden;border:1px solid var(--border);}
        .bar-fill{height:100%;border-radius:5px;transition:width 0.6s ease;display:flex;align-items:center;padding-left:10px;font-family:var(--mono);font-size:10px;font-weight:700;color:#000;min-width:fit-content;}
        .bar-fill.json-bar{background:linear-gradient(90deg,var(--orange),#ff9100);}
        .bar-fill.toon-bar{background:linear-gradient(90deg,var(--accent),#00b8d4);}

        .btn-bench{background:var(--surface2);color:var(--accent);border:1px solid var(--accent);font-family:var(--mono);font-size:11px;font-weight:700;padding:8px 20px;border-radius:6px;cursor:pointer;transition:all 0.15s;margin-top:16px;display:inline-flex;align-items:center;gap:8px;}
        .btn-bench:hover:not(:disabled){background:rgba(0,229,255,0.08);}
        .btn-bench:disabled{opacity:0.5;cursor:not-allowed;}

        /* How it works */
        .how-section{margin-top:36px;}
        .toggle-bar{display:flex;gap:0;margin-bottom:20px;width:fit-content;}
        .toggle-btn{padding:10px 24px;font-family:var(--mono);font-size:12px;font-weight:700;border:1px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;transition:all 0.15s;}
        .toggle-btn:first-child{border-radius:6px 0 0 6px;}
        .toggle-btn:last-child{border-radius:0 6px 6px 0;}
        .toggle-btn.active{background:rgba(176,110,255,0.1);color:var(--purple);border-color:var(--purple);}

        .snippet-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
        .snippet-tab{padding:6px 14px;font-family:var(--mono);font-size:11px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--muted);cursor:pointer;transition:all 0.15s;}
        .snippet-tab.active{background:rgba(0,229,255,0.08);color:var(--accent);border-color:var(--accent);}
        .snippet-tab:hover:not(.active){background:var(--surface2);}

        .code-block{background:#080810;border:1px solid var(--border);border-radius:10px;padding:20px;font-family:var(--mono);font-size:12px;line-height:1.7;color:#c8c8e0;overflow-x:auto;white-space:pre;}

        .flow-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:24px;margin-bottom:20px;}
        .flow-card-title{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;}
        .flow-card-title.send-title{color:var(--orange);}
        .flow-card-title.recv-title{color:var(--green);}
        .flow-container{display:flex;flex-direction:column;gap:0;}
        .flow-step{display:flex;align-items:flex-start;gap:14px;position:relative;padding:16px 0;}
        .flow-step:not(:last-child)::after{content:'';position:absolute;left:17px;top:52px;bottom:0;width:2px;background:var(--border);}
        .flow-icon{min-width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#000;position:relative;z-index:1;}
        .flow-icon.s1{background:linear-gradient(135deg,var(--orange),#ff9100);}
        .flow-icon.s2{background:linear-gradient(135deg,var(--accent),#00b8d4);}
        .flow-icon.s3{background:linear-gradient(135deg,var(--purple),#9c47ff);}
        .flow-icon.s4{background:linear-gradient(135deg,var(--green),#00cc6a);}
        .flow-title{font-size:14px;font-weight:800;margin-bottom:3px;}
        .flow-desc{font-size:12px;color:var(--muted);line-height:1.5;}
        .flow-code{margin-top:6px;background:#080810;border:1px solid var(--border);border-radius:6px;padding:8px 12px;font-family:var(--mono);font-size:11px;color:#9898b8;overflow-x:auto;white-space:pre;}

        .type-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:20px;}
        .type-table{width:100%;border-collapse:collapse;}
        .type-table th,.type-table td{text-align:left;padding:8px 12px;font-family:var(--mono);font-size:12px;border-bottom:1px solid var(--border);}
        .type-table th{color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;}
        .tc{color:var(--accent);font-weight:700;}
        .tn{color:var(--purple);}
        .te{color:#9898b8;}

        .pg-footer{margin-top:48px;padding:24px 0;border-top:1px solid var(--border);text-align:center;font-family:var(--mono);font-size:12px;color:var(--muted);}
        .pg-footer a{color:var(--accent);text-decoration:none;}
        .pg-footer a:hover{text-decoration:underline;}
      `}</style>

      {/* Header */}
      <header className="pg-header">
        <div className="pg-logo">
          <div className="pg-logo-icon">T</div>
          <span className="pg-logo-text">toonkit</span>
          <span className="pg-badge">PLAYGROUND</span>
        </div>
        <div className="pg-links">
          <a href="https://github.com/ManojGowda89/toonkit" target="_blank" rel="noreferrer">↗ GitHub</a>
          <a href="https://toonkit.js.org" target="_blank" rel="noreferrer">↗ Official docs</a>
          <a href="https://www.npmjs.com/package/toonkit2" target="_blank" rel="noreferrer">↗ npm (recommended)</a>
          <a href="https://jsr.io/@manojgowdain/toonkit2" target="_blank" rel="noreferrer">↗ JSR</a>
        </div>
      </header>

      <div className="pg-main">

        {/* ━━━ PLAYGROUND ━━━ */}
        <div className="section-title">⚡ Playground</div>
        <div className="section-sub">
          Left: Send JSON → real API → receive JSON &nbsp;|&nbsp; Right: Send TOON → real API → receive TOON &nbsp;|&nbsp; All calls hit your backend
        </div>

        <div className="playground-cols">

          {/* ── LEFT: JSON Round-trip ── */}
          <div className="col-card json-col">
            <div className="col-header">
              <div className="col-title" style={{ color: "var(--orange)" }}>📤 JSON Round-trip</div>
              <span className="col-tag tag-json">JSON → API → JSON</span>
            </div>

            <div className="col-label">
              Input · JSON
            </div>
            <textarea
              className="col-textarea"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON here..."
              spellCheck={false}
            />

            <div className="arrow-row">
              <span className="arrow-label">POST /api/toon/send</span>
              <span className="arrow-icon">⬇</span>
            </div>

            {jsonToonIntermediate && (
              <>
                <div className="intermediate-label">⚡ Intermediate TOON (from server)</div>
                <div className="intermediate">{jsonToonIntermediate}</div>
                <div className="arrow-row">
                  <span className="arrow-label">POST /api/toon/receive</span>
                  <span className="arrow-icon">⬇</span>
                </div>
              </>
            )}

            <div className="col-label">
              Response · JSON <span className="endpoint">(round-tripped via real API)</span>
            </div>
            <textarea
              className="col-textarea"
              value={jsonOutput}
              readOnly
              placeholder="JSON response from your backend..."
              style={{ minHeight: 140 }}
            />

            {jsonError && <div className="error-msg">⚠ {jsonError}</div>}

            <div className="col-action">
              <button className="btn-run json-btn" onClick={handleJsonRoundtrip} disabled={jsonLoading}>
                {jsonLoading ? <><span className="spinner" /> Running...</> : "▶ Run"}
              </button>
              {jsonLatency !== null && <span className="pill">⏱ <span className="v green">{jsonLatency}ms</span></span>}
              {jsonSizeIn !== null && <span className="pill">in <span className="v orange">{jsonSizeIn}B</span></span>}
              {jsonSizeOut !== null && <span className="pill">out <span className="v orange">{jsonSizeOut}B</span></span>}
              {jsonSizeIn !== null && jsonToonIntermediate && (
                <span className="pill">toon wire <span className="v purple">{byteSize(jsonToonIntermediate)}B</span></span>
              )}
              {jsonSizeIn !== null && jsonToonIntermediate && (
                <span className="pill">
                  saved <span className="v green">
                    {jsonSizeIn - byteSize(jsonToonIntermediate)}B ({((jsonSizeIn - byteSize(jsonToonIntermediate)) / jsonSizeIn * 100).toFixed(1)}%)
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* ── RIGHT: TOON Round-trip ── */}
          <div className="col-card toon-col">
            <div className="col-header">
              <div className="col-title" style={{ color: "var(--accent)" }}>📥 TOON Round-trip</div>
              <span className="col-tag tag-toon">TOON → API → TOON</span>
            </div>

            <div className="col-label">
              Input · TOON
            </div>
            <textarea
              className="col-textarea"
              value={toonInput}
              onChange={(e) => setToonInput(e.target.value)}
              placeholder="Paste TOON string here..."
              spellCheck={false}
            />

            <div className="arrow-row">
              <span className="arrow-label">POST /api/toon/receive</span>
              <span className="arrow-icon">⬇</span>
            </div>

            {toonJsonIntermediate && (
              <>
                <div className="intermediate-label">⚡ Intermediate JSON (from server)</div>
                <div className="intermediate">{toonJsonIntermediate}</div>
                <div className="arrow-row">
                  <span className="arrow-label">POST /api/toon/send</span>
                  <span className="arrow-icon">⬇</span>
                </div>
              </>
            )}

            <div className="col-label">
              Response · TOON <span className="endpoint">(round-tripped via real API)</span>
            </div>
            <textarea
              className="col-textarea"
              value={toonOutput}
              readOnly
              placeholder="TOON response from your backend..."
              style={{ minHeight: 140 }}
            />

            {toonError && <div className="error-msg">⚠ {toonError}</div>}

            <div className="col-action">
              <button className="btn-run toon-btn" onClick={handleToonRoundtrip} disabled={toonLoading}>
                {toonLoading ? <><span className="spinner" /> Running...</> : "▶ Run"}
              </button>
              {toonLatency !== null && <span className="pill">⏱ <span className="v green">{toonLatency}ms</span></span>}
              {toonSizeIn !== null && <span className="pill">in <span className="v cyan">{toonSizeIn}B</span></span>}
              {toonSizeOut !== null && <span className="pill">out <span className="v cyan">{toonSizeOut}B</span></span>}
              {toonSizeIn !== null && toonJsonIntermediate && (
                <span className="pill">json wire <span className="v orange">{byteSize(toonJsonIntermediate)}B</span></span>
              )}
              {toonSizeIn !== null && toonJsonIntermediate && (
                <span className="pill">
                  toon smaller by <span className="v green">
                    {byteSize(toonJsonIntermediate) - (toonSizeIn || 0)}B ({((byteSize(toonJsonIntermediate) - (toonSizeIn || 0)) / byteSize(toonJsonIntermediate) * 100).toFixed(1)}%)
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ━━━ BENCHMARK ━━━ */}
        <div className="bench-section">
          <div className="section-title">📊 Size &amp; Speed Benchmark</div>
          <div className="section-sub" style={{ marginBottom: 0 }}>
            100 rows × 6 columns — real API calls to /api/toon/send &amp; /api/toon/receive
          </div>

          {benchmark && (
            <>
              <div className="bar-section">
                <div className="bar-title">Payload Size (bytes) — JSON vs TOON over the wire</div>
                <div className="bar-row">
                  <span className="bar-label">JSON</span>
                  <div className="bar-track">
                    <div className="bar-fill json-bar" style={{ width: "100%" }}>{benchmark.jsonSize}B</div>
                  </div>
                </div>
                <div className="bar-row">
                  <span className="bar-label">TOON</span>
                  <div className="bar-track">
                    <div className="bar-fill toon-bar" style={{ width: `${(benchmark.toonSize / benchmark.jsonSize) * 100}%` }}>{benchmark.toonSize}B</div>
                  </div>
                </div>
              </div>

              <div className="bench-grid">
                <div className="bench-card">
                  <div className="bench-card-label">Payload Size</div>
                  <div className="bench-row"><span className="bench-key">JSON</span><span className="bench-val json">{benchmark.jsonSize} B</span></div>
                  <div className="bench-row"><span className="bench-key">TOON</span><span className="bench-val toon">{benchmark.toonSize} B</span></div>
                  <div className="bench-row" style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                    <span className="bench-key">Saved</span>
                    <span className="bench-val good">{benchmark.savings} B ({benchmark.savingsPercent}%)</span>
                  </div>
                </div>
                <div className="bench-card">
                  <div className="bench-card-label">API: JSON → TOON</div>
                  <div className="bench-row"><span className="bench-key">POST /api/toon/send</span><span className="bench-val json">{benchmark.jsonSendMs} ms</span></div>
                  <div className="bench-row"><span className="bench-key">Re-run</span><span className="bench-val toon">{benchmark.toonSendMs} ms</span></div>
                </div>
                <div className="bench-card">
                  <div className="bench-card-label">API: TOON → JSON</div>
                  <div className="bench-row"><span className="bench-key">POST /api/toon/receive</span><span className="bench-val toon">{benchmark.toonReceiveMs} ms</span></div>
                  <div className="bench-row"><span className="bench-key">Re-run</span><span className="bench-val json">{benchmark.jsonReceiveMs} ms</span></div>
                </div>
                <div className="bench-card">
                  <div className="bench-card-label">Why TOON wins</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#9898b8", lineHeight: 1.8 }}>
                    ✔ No repeated keys<br />✔ Schema declared once<br />✔ No quotes / braces<br />✔ Type info embedded<br />✔ CSV-like rows<br />✔ Smaller over the wire
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button className="btn-bench" onClick={runBenchmark} disabled={benchLoading}>
                  {benchLoading ? <><span className="spinner" /> Running...</> : "↻ Re-run Benchmark"}
                </button>
              </div>
            </>
          )}

          {!benchmark && benchLoading && (
            <div style={{ textAlign: "center", padding: 40, fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" }}>
              <span className="spinner" style={{ width: 24, height: 24, borderColor: "var(--border)", borderTopColor: "var(--accent)", display: "inline-block", marginBottom: 12 }} /><br />
              Running benchmark against your API...
            </div>
          )}
        </div>

        {/* ━━━ HOW IT WORKS ━━━ */}
        <div className="how-section">
          <div className="section-title">🧠 How toonkit Works</div>
          <div className="section-sub">Toggle between visual flow and code — see what happens behind the scenes</div>

          <div className="toggle-bar">
            <button className={`toggle-btn ${howView === "ui" ? "active" : ""}`} onClick={() => setHowView("ui")}>🎨 Visual Flow</button>
            <button className={`toggle-btn ${howView === "code" ? "active" : ""}`} onClick={() => setHowView("code")}>💻 Code</button>
          </div>

          {howView === "ui" && (
            <>
              <div className="type-card">
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 10 }}>Supported Types</div>
                <table className="type-table">
                  <thead><tr><th>Code</th><th>Type</th><th>Example</th></tr></thead>
                  <tbody>
                    {[["n","number","25"],["s","string","Manoj"],["b","boolean","true"],["nl","null","null"],["j","JSON object",'{"a":1}'],["a","array","[1,2,3]"]].map(([c,n,e])=>(
                      <tr key={c}><td className="tc">{c}</td><td className="tn">{n}</td><td className="te">{e}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* sendToon flow */}
              <div className="flow-card">
                <div className="flow-card-title send-title">📤 POST /api/toon/send — JSON → TOON (real API)</div>
                <div className="flow-container">
                  <div className="flow-step">
                    <div className="flow-icon s1">1</div>
                    <div>
                      <div className="flow-title">Client sends JSON via fetch()</div>
                      <div className="flow-desc">Your frontend POST&apos;s JSON to <code style={{ color: "var(--purple)" }}>/api/toon/send</code></div>
                      <div className="flow-code">{`await fetch("/api/toon/send", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ employees: [...] })\n});`}</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-icon s2">2</div>
                    <div>
                      <div className="flow-title">Server parses JSON &amp; calls sendToon()</div>
                      <div className="flow-desc">Next.js API route reads the body, passes to <code style={{ color: "var(--accent)" }}>sendToon()</code></div>
                      <div className="flow-code">{`const json = await req.json();\nconst toonString = sendToon(json);`}</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-icon s3">3</div>
                    <div>
                      <div className="flow-title">toonkit builds schema + flattens rows</div>
                      <div className="flow-desc">detectType() infers types → schema header → CSV-like rows</div>
                      <div className="flow-code">{`employees[2]{id:n,name:s,salary:n}:\n1,Riya,90000\n2,John,80000`}</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-icon s4">4</div>
                    <div>
                      <div className="flow-title">Server responds with TOON string</div>
                      <div className="flow-desc">Content-Type: text/plain — compact payload sent back to client</div>
                      <div className="flow-code">{`return new Response(toonString, {\n  headers: { "Content-Type": "text/plain" }\n});`}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* receiveToon flow */}
              <div className="flow-card">
                <div className="flow-card-title recv-title">📥 POST /api/toon/receive — TOON → JSON (real API)</div>
                <div className="flow-container">
                  <div className="flow-step">
                    <div className="flow-icon s1">1</div>
                    <div>
                      <div className="flow-title">Client sends TOON string via fetch()</div>
                      <div className="flow-desc">POST TOON text to <code style={{ color: "var(--purple)" }}>/api/toon/receive</code></div>
                      <div className="flow-code">{`await fetch("/api/toon/receive", {\n  method: "POST",\n  headers: { "Content-Type": "text/plain" },\n  body: toonString\n});`}</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-icon s2">2</div>
                    <div>
                      <div className="flow-title">Server reads text &amp; calls receiveToon()</div>
                      <div className="flow-desc">Next.js API route reads text body, passes to <code style={{ color: "var(--accent)" }}>receiveToon()</code></div>
                      <div className="flow-code">{`const text = await req.text();\nconst data = receiveToon(text);`}</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-icon s3">3</div>
                    <div>
                      <div className="flow-title">toonkit parses schema → casts each row</div>
                      <div className="flow-desc">Extracts headers/types → splits CSV rows → castValue() for correct JS types</div>
                      <div className="flow-code">{`"1" → Number(1)      // type "n"\n"Riya" → "Riya"      // type "s"\n"true" → true         // type "b"`}</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="flow-icon s4">4</div>
                    <div>
                      <div className="flow-title">Server responds with JSON</div>
                      <div className="flow-desc">NextResponse.json() sends back the fully typed object</div>
                      <div className="flow-code">{`return NextResponse.json(data);\n// { employees: [{ id: 1, name: "Riya", ... }] }`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {howView === "code" && (
            <>
              <div className="snippet-tabs">
                {([
                  ["sendToon","sendToon()"],
                  ["receiveToon","receiveToon()"],
                  ["expressBackend","Express"],
                  ["nextjsSend","Next.js /send"],
                  ["nextjsReceive","Next.js /receive"],
                  ["detectType","detectType()"],
                  ["jsonToToon","jsonToToon() Core"]
                ] as [string,string][]).map(([k,l])=>(
                  <button key={k} className={`snippet-tab ${activeSnippet===k?"active":""}`} onClick={()=>setActiveSnippet(k)}>{l}</button>
                ))}
              </div>
              <div className="code-block">{CODE_SNIPPETS[activeSnippet]}</div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="pg-footer">
          Built by <a href="https://manojgowda.in" target="_blank" rel="noreferrer">Manoj Gowda</a> · <a href="https://github.com/ManojGowda89/toonkit" target="_blank" rel="noreferrer">GitHub</a> · <a href="https://toonkit.js.org" target="_blank" rel="noreferrer">Official docs</a> · MIT
        </footer>
      </div>
    </>
  );
}