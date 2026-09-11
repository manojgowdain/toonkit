import { useState, useCallback } from "react";
import { jsonToToon, toonToJson } from "toonkit";

export default function Playground() {
  const [input, setInput] = useState(
    JSON.stringify({
      employees: [
        { id: 1, name: "Riya", salary: 90000, active: true },
      ],
    }, null, 2)
  );
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const detectedType = input.trim() ?
    (() => {
      const trimmed = input.trim();
      try {
        JSON.parse(trimmed);
        return "json";
      } catch {
        if (/\[\d+\]\{.+\}:/.test(trimmed)) return "toon";
        return "unknown";
      }
    })() : "unknown";

  const directionLabel = detectedType === "json" ? "JSON\n→\nTOON" : detectedType === "toon" ? "TOON\n→\nJSON" : "AUTO";

  const convert = useCallback(async () => {
    if (!input.trim() || detectedType === "unknown") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      let outputText = "";

      if (detectedType === "json") {
        const obj = JSON.parse(input);
        outputText = jsonToToon(obj);
      } else {
        const json = toonToJson(input);
        outputText = JSON.stringify(json, null, 2);
      }

      setOutput(outputText);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed");
      setOutput("");
      setStatus("error");
    }
  }, [input, detectedType]);

  return (
    <div style={{ padding: "1rem", fontFamily: "monospace" }}>
      <h1>Toonkit Playground</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setInput(JSON.stringify({
          employees: [
            { id: 1, name: "Riya", salary: 90000, active: true },
          ],
        }, null, 2))}>JSON Example</button>
        <button onClick={() => setInput(`employees[1]{id:n:name:s:salary:n,active:b}:\n1,Riya,90000,true`)}>TOON Example</button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem", minHeight: "200px" }}>
          <h3>Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "100%", height: "150px", fontFamily: "monospace" }}
          />
        </div>
        <div style={{ width: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={convert} disabled={status === "loading" || detectedType === "unknown"}>
            {status === "loading" ? "⟳" : "⇄"}
          </button>
        </div>
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem", minHeight: "200px" }}>
          <h3>Output</h3>
          <textarea
            value={output}
            readOnly
            style={{ width: "100%", height: "150px", fontFamily: "monospace" }}
          />
          {status === "error" && <div style={{ color: "red" }}>{errorMsg}</div>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Direction: {directionLabel}</span>
        <span>Status: {status}</span>
      </div>
    </div>
  );
}