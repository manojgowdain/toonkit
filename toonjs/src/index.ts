/* ================= SAFE PARSE ================= */
export function safeParse(val: string): any {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

export type ToonPrimitive = string | number | boolean | null;
export type ToonValue = ToonPrimitive | ToonObject | ToonArray;
export type ToonObject = { [key: string]: ToonValue };
export type ToonArray = ToonValue[];
export type ToonRuntime<T extends ToonValue = ToonValue> = T & {
  toToon(): string;
  toJSON(): T;
};

type ToonField = { name: string; type: string };
type ToonRuntimeMeta = {
  rootKey?: string;
  fields?: ToonField[];
};

const runtimeMeta = new WeakMap<object, ToonRuntimeMeta>();

function attachRuntime<T extends object>(value: T, meta: ToonRuntimeMeta): T {
  runtimeMeta.set(value, meta);
  Object.defineProperty(value, "toToon", {
    configurable: true,
    enumerable: false,
    value: () => serializeRuntime(value),
  });
  Object.defineProperty(value, "toJSON", {
    configurable: true,
    enumerable: false,
    value: () => cloneValue(value),
  });
  return value;
}

function interpolateTemplate(
  strings: TemplateStringsArray,
  values: unknown[],
): string {
  return strings.raw.reduce((result, part, index) => {
    if (index >= values.length) return result + part;
    const value = values[index];
    return result + part + (typeof value === "string" ? value : JSON.stringify(value));
  }, "");
}

function parseScalar(value: string): ToonValue {
  const parsed = safeParse(value);
  if (parsed !== value) return parsed;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  return value;
}

function parseObjectDocument(input: string): ToonObject | null {
  const lines = input.split("\n").filter((line) => line.trim());
  if (!lines.length || lines.some((line) => !line.includes(":"))) return null;
  const firstSeparator = lines[0].indexOf(":");
  if (firstSeparator > 0 && !lines[0].slice(firstSeparator + 1).trim()) {
    const rootKey = lines[0].slice(0, firstSeparator).trim();
    const child = parseObjectDocument(
      lines.slice(1).map((line) => `  ${line}`).join("\n"),
    );
    return { [rootKey]: child ?? {} };
  }
  const root: ToonObject = {};
  const stack: Array<{ indent: number; value: ToonObject }> = [{ indent: -1, value: root }];

  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    const separator = line.indexOf(":");
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    if (rawValue) {
      parent[key] = parseScalar(rawValue);
    } else {
      const child: ToonObject = {};
      parent[key] = child;
      stack.push({ indent, value: child });
    }
  }
  return root;
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
  if (!lines.some((line) => headerPattern.test(line.trim()))) {
    return parseObjectDocument(input) ?? obj;
  }

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
        const meta = runtimeMeta.get(val);
        const fieldNames = new Set(meta?.fields?.map((field) => field.name));
        val.forEach((item: any) => {
          if (item && typeof item === "object") {
            Object.keys(item).forEach((field) => fieldNames.add(field));
          }
        });
        const fields = [...fieldNames];
        const schema = fields
          .map((field) => {
            const original = meta?.fields?.find((entry) => entry.name === field);
            const sample = val.find((item: any) => item?.[field] !== undefined)?.[field];
            return `${field}:${original?.type ?? getType(sample)}`;
          })
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

function serializeRuntime(value: object): string {
  const meta = runtimeMeta.get(value);
  if (!meta?.rootKey) return jsonToToon(value);
  if (!Array.isArray(value)) {
    const render = (current: Record<string, unknown>, indent: string): string[] =>
      Object.entries(current).flatMap(([key, child]) => {
        if (child && typeof child === "object" && !Array.isArray(child)) {
          return [`${indent}${key}:`, ...render(child as Record<string, unknown>, `${indent}  `)];
        }
        return [`${indent}${key}: ${formatValue(child, getType(child))}`];
      });
    return [`${meta.rootKey}:`, ...render(value as Record<string, unknown>, "  ")].join("\n");
  }
  return jsonToToon({ [meta.rootKey]: value });
}

function cloneValue<T>(value: T): T {
  const clone = typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value)) as T;
  if (clone && typeof clone === "object") {
    const meta = runtimeMeta.get(value as object);
    if (meta) return attachRuntime(clone as object, { ...meta }) as T;
  }
  return clone;
}

function equalValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    return a.length === (b as unknown[]).length &&
      a.every((value, index) => equalValue(value, (b as unknown[])[index]));
  }
  if (typeof a === "object") {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    return aKeys.length === bKeys.length &&
      aKeys.every((key) => equalValue(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ));
  }
  return false;
}

export interface ToonTagged {
  <T extends ToonValue = ToonValue>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): ToonRuntime<T>;
  <T = ToonValue>(value: T): T;
  toToon<T>(value: T): string;
  toJSON<T>(value: T): T;
  clone<T>(value: T): T;
  equals(a: unknown, b: unknown): boolean;
}

export const toon: ToonTagged = ((first: TemplateStringsArray | ToonValue, ...values: unknown[]) => {
  if (Array.isArray(first) && "raw" in first) {
    const strings = first as unknown as TemplateStringsArray;
    const parsed = toonToJson(interpolateTemplate(strings, values));
    const keys = Object.keys(parsed);
    if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
      return attachRuntime(parsed[keys[0]], {
        rootKey: keys[0],
        fields: Object.keys(parsed[keys[0]][0] ?? {}).map((name) => ({
          name,
          type: getType(parsed[keys[0]][0][name]),
        })),
      });
    }
    if (keys.length === 1 && parsed[keys[0]] && typeof parsed[keys[0]] === "object") {
      return attachRuntime(parsed[keys[0]], { rootKey: keys[0] });
    }
    return parsed;
  }
  return first;
}) as ToonTagged;

toon.toToon = (value) => {
  const runtime = value as object;
  return runtimeMeta.has(runtime) ? serializeRuntime(runtime) : jsonToToon(value);
};
toon.toJSON = (value) => cloneValue(value);
toon.clone = cloneValue;
toon.equals = equalValue;

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