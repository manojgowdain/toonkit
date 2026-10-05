/* ================= SAFE PARSE ================= */
export function safeParse(val: string): any {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

function splitTopLevel(input: string, delimiter = ","): string[] {
  if (input === "") {
    return [""];
  }

  const parts: string[] = [];
  let current = "";
  let bracketDepth = 0;
  let braceDepth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (quote) {
      current += ch;
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === "[") {
      bracketDepth += 1;
    } else if (ch === "]" && bracketDepth > 0) {
      bracketDepth -= 1;
    } else if (ch === "{") {
      braceDepth += 1;
    } else if (ch === "}" && braceDepth > 0) {
      braceDepth -= 1;
    }

    if (ch === delimiter && bracketDepth === 0 && braceDepth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  parts.push(current.trim());
  return parts;
}

/* ================= TYPE HELPERS ================= */
function unwrapCsvValue(val: string): string {
  if (val.length >= 2 && val.startsWith('"') && val.endsWith('"')) {
    return val.slice(1, -1).replace(/""/g, '"');
  }
  return val;
}

function parseValue(val: string, type: string): any {
  const normalized = unwrapCsvValue(val);

  switch (type) {
    case "n":
      return Number(normalized);
    case "b":
      return normalized === "true";
    case "j":
    case "a":
      return safeParse(normalized);
    case "nl":
      return null;
    case "td":
      return normalized;
    default:
      return normalized;
  }
}

function getType(val: any): string {
  if (val === null) return "nl";
  if (typeof val === "string") return "s";
  if (typeof val === "number") return "n";
  if (typeof val === "boolean") return "b";
  if (Array.isArray(val)) return "a";
  if (typeof val === "object") return "j";
  return "s";
}

function formatValue(val: any, type: string): string {
  if (type === "a" || type === "j") {
    return JSON.stringify(val);
  }
  if (type === "nl") return "null";
  if (type === "b") return val ? "true" : "false";
  return String(val);
}

function formatRowValue(val: any, type: string): string {
  if (type === "a" || type === "j") {
    return JSON.stringify(val);
  }
  if (type === "nl") return "null";
  if (type === "b") return val ? "true" : "false";
  return String(val);
}

/* ================= TOON → JSON ================= */
export function toonToJson(input: string): any {
  const lines = input.split("\n");
  const obj: any = {};
  const headerPattern = /^(.+?)\[(\d+)\]\{(.+)\}:\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(headerPattern);
    if (!match) continue;

    const key = match[1];
    const schemaRaw = match[3];
    const fields = splitTopLevel(schemaRaw)
      .map((field) => {
        const index = field.indexOf(":");
        const name = index >= 0 ? field.slice(0, index).trim() : field.trim();
        const type = index >= 0 ? field.slice(index + 1).trim() : "s";
        return { name, type };
      })
      .filter((field) => field.name !== "");

    const valueLines: string[] = [];
    i += 1;

    while (i < lines.length) {
      const current = lines[i].trim();
      if (!current) {
        i += 1;
        continue;
      }

      if (headerPattern.test(current)) {
        i -= 1;
        break;
      }

      valueLines.push(current);
      i += 1;
    }

    if (fields.length === 1 && fields[0].name === "0") {
      const rawValue = valueLines.join("\n").trim();
      obj[key] = parseValue(rawValue, fields[0].type);
      continue;
    }

    obj[key] = valueLines.map((row) => {
      const values = splitTopLevel(row);
      const item: any = {};

      fields.forEach((field, idx) => {
        item[field.name] = parseValue(values[idx] ?? "", field.type);
      });

      return item;
    });
  }

  return obj;
}

/* ================= JSON → TOON ================= */
export function jsonToToon(obj: any): string {
  const entries = Object.entries(obj ?? {});
  let result = "";

  for (const [key, val] of entries) {
    if (Array.isArray(val)) {
      if (
        val.length > 0 &&
        typeof val[0] === "object" &&
        val[0] !== null &&
        !Array.isArray(val[0])
      ) {
        const fields = Object.keys(val[0]);
        const schema = fields
          .map((field) => `${field}:${getType(val[0][field])}`)
          .join(",");

        result += `${key}[${val.length}]{${schema}}:\n`;

        val.forEach((item: any) => {
          const row = fields
            .map((field) => formatRowValue(item[field], getType(item[field])))
            .join(",");
          result += `${row}\n`;
        });

        continue;
      }

      result += `${key}[1]{0:a}:\n`;
      result += `${formatValue(val, "a")}\n`;
      continue;
    }

    if (val !== null && typeof val === "object") {
      result += `${key}[1]{0:j}:\n`;
      result += `${formatValue(val, "j")}\n`;
      continue;
    }

    const type = getType(val);
    result += `${key}[1]{0:${type}}:\n`;
    result += `${formatValue(val, type)}\n`;
  }

  return result.trim();
}

export {
  configureToonFetch as configureToonAxios,
  createToonAxios,
  toonAxios,
  toonFetch,
} from "./fetch/index";

export type {
  ToonClientOptions,
  ToonFetchOptions,
  ToonFetchResponse,
} from "./fetch/index";