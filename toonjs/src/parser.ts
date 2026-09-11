import { ToonkitParseError } from "./errors.js";
import { parseToonHeader } from "./schema.js";
import { splitTopLevelFields } from "./tokenizer.js";
import type { ToonDocument, ToonField, ToonHeader, ToonRecord, ToonValue } from "./types.js";

function valueError(
  message: string,
  field: ToonField,
  line: number,
  received: string,
  hint?: string,
): ToonkitParseError {
  return new ToonkitParseError(message, {
    line,
    column: 1,
    field: field.name,
    expected: `${field.name}: ${field.type}`,
    received,
    hint,
  });
}

function decodeString(raw: string, field: ToonField, line: number): string {
  if (!raw.startsWith('"')) {
    return raw;
  }
  if (!raw.endsWith('"') || raw.length < 2) {
    throw valueError("Unterminated quoted string.", field, line, raw);
  }
  try {
    return JSON.parse(raw) as string;
  } catch {
    throw valueError("Invalid quoted string.", field, line, raw, "Use JSON string escaping, such as \\ for a backslash.");
  }
}

export function parseToonValue(raw: string, field: ToonField, line: number): ToonValue {
  const value = raw.trim();

  switch (field.type) {
    case "s":
    case "td":
      return decodeString(value, field, line);
    case "n": {
      if (value === "") {
        throw valueError("Number value is missing.", field, line, value);
      }
      const number = Number(value);
      if (!Number.isFinite(number)) {
        throw valueError("Invalid number value.", field, line, value);
      }
      return number;
    }
    case "b":
      if (value === "true") return true;
      if (value === "false") return false;
      throw valueError("Invalid boolean value.", field, line, value, "Use true or false.");
    case "nl":
      if (value === "null" || value === "") return null;
      throw valueError("Invalid null value.", field, line, value, "Use null.");
    case "a":
    case "j": {
      const expectedStart = field.type === "a" ? "[" : "{";
      if (!value.startsWith(expectedStart)) {
        throw valueError(
          "Ambiguous structured value.",
          field,
          line,
          value,
          field.type === "a" ? "Use explicit array syntax: [value1,value2]." : "Use explicit object syntax: {\"key\":\"value\"}.",
        );
      }
      try {
        const parsed: unknown = JSON.parse(value);
        if (field.type === "a" && !Array.isArray(parsed)) {
          throw new Error("Expected array");
        }
        if (field.type === "j" && (parsed === null || Array.isArray(parsed) || typeof parsed !== "object")) {
          throw new Error("Expected object");
        }
        return parsed as ToonValue;
      } catch {
        throw valueError("Invalid structured value.", field, line, value, "Use valid JSON-compatible array or object syntax.");
      }
    }
  }
}

function isHeader(line: string): boolean {
  return /^.+?\[\d+\]\{.+\}:\s*$/.test(line.trim());
}

function parseBlock(header: ToonHeader, valueLines: readonly { text: string; line: number }[]): ToonValue | ToonRecord[] {
  if (header.fields.length === 1 && header.fields[0].name === "0") {
    const source = valueLines.map(({ text }) => text).join("\n");
    return parseToonValue(source, header.fields[0], valueLines[0]?.line ?? 1);
  }

  if (valueLines.length !== header.count) {
    throw new ToonkitParseError("Record count does not match the header.", {
      line: valueLines[0]?.line ?? 1,
      column: 1,
      expected: `${header.count} record rows`,
      received: `${valueLines.length} record rows`,
      hint: "Adjust the count in the header or add/remove record rows.",
    });
  }

  return valueLines.map(({ text, line }) => {
    const values = splitTopLevelFields(text, line);
    if (values.length !== header.fields.length) {
      const field =
        header.fields.find(({ type }) => type === "a" || type === "j") ??
        header.fields[Math.min(values.length, header.fields.length - 1)];
      throw valueError(
        "Record field count does not match the schema.",
        field,
        line,
        text,
        "Wrap arrays in [] and objects in {} so embedded commas are not field separators.",
      );
    }

    const record: ToonRecord = {};
    header.fields.forEach((field, index) => {
      record[field.name] = parseToonValue(values[index], field, line);
    });
    return record;
  });
}

export function parseToon(input: string): ToonDocument {
  const lines = input.split(/\r?\n/);
  const result: ToonDocument = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line === "") continue;
    if (!isHeader(line)) continue;

    const header = parseToonHeader(line, index + 1);
    const valueLines: { text: string; line: number }[] = [];
    index += 1;
    while (index < lines.length && !isHeader(lines[index])) {
      if (lines[index].trim() !== "") {
        valueLines.push({ text: lines[index].trim(), line: index + 1 });
      }
      index += 1;
    }
    index -= 1;
    result[header.key] = parseBlock(header, valueLines);
  }

  return result;
}
