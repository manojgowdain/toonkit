import type { ToonDocument, ToonRecord, ToonTypeCode, ToonValue } from "./types.js";

function typeOf(value: ToonValue): ToonTypeCode {
  if (value === null) return "nl";
  if (typeof value === "string") return "s";
  if (typeof value === "number") return "n";
  if (typeof value === "boolean") return "b";
  return Array.isArray(value) ? "a" : "j";
}

function formatString(value: string): string {
  return /[",\[\]{}\r\n]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
}

function formatValue(value: ToonValue, type: ToonTypeCode): string {
  if (type === "a" || type === "j") return JSON.stringify(value);
  if (type === "nl") return "null";
  return type === "s" || type === "td" ? formatString(value as string) : String(value);
}

function isRecord(value: ToonValue): value is ToonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function serializeToon(document: ToonDocument): string {
  const blocks: string[] = [];
  for (const [key, value] of Object.entries(document)) {
    if (Array.isArray(value) && value.length > 0 && value.every(isRecord)) {
      const fields = Object.keys(value[0] as ToonRecord);
      const schema = fields.map((field) => `${field}:${typeOf((value[0] as ToonRecord)[field])}`).join(",");
      const rows = value.map((record) => {
        const typedRecord = record as ToonRecord;
        return fields.map((field) => formatValue(typedRecord[field], typeOf(typedRecord[field]))).join(",");
      });
      blocks.push(`${key}[${value.length}]{${schema}}:\n${rows.join("\n")}`);
      continue;
    }

    const type = typeOf(value);
    blocks.push(`${key}[1]{0:${type}}:\n${formatValue(value, type)}`);
  }
  return blocks.join("\n\n");
}
