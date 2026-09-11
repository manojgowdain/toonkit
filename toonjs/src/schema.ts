import { z } from "zod";

import { ToonkitParseError } from "./errors.js";
import { toonTypeCodes, type ToonField, type ToonHeader, type ToonTypeCode } from "./types.js";

const identifierSchema = z.string().trim().min(1).regex(/^[A-Za-z_$][A-Za-z0-9_$.-]*$|^\d+$/);
const fieldSchema = z.object({
  name: identifierSchema,
  type: z.enum(toonTypeCodes),
});
const headerSchema = z.object({
  key: identifierSchema,
  count: z.number().int().positive(),
  fields: z.array(fieldSchema).min(1),
});

function headerError(
  message: string,
  line: number,
  column: number,
  field?: string,
): ToonkitParseError {
  return new ToonkitParseError(message, {
    line,
    column,
    field,
    expected: "key[count]{field:type,...}:",
    hint: "Use supported type codes: s, n, b, j, a, nl, td.",
  });
}

export function parseToonHeader(line: string, lineNumber: number): ToonHeader {
  const match = /^(.+?)\[(\d+)\]\{(.+)\}:\s*$/.exec(line.trim());
  if (!match) {
    throw headerError("Invalid TOON header.", lineNumber, 1);
  }

  const [, rawKey, rawCount, rawFields] = match;
  const fields: ToonField[] = rawFields.split(",").map((rawField) => {
    const separator = rawField.indexOf(":");
    if (separator <= 0 || separator === rawField.length - 1) {
      throw headerError("Invalid field declaration.", lineNumber, line.indexOf(rawField) + 1);
    }

    const name = rawField.slice(0, separator).trim();
    const type = rawField.slice(separator + 1).trim();
    if (!toonTypeCodes.includes(type as ToonTypeCode)) {
      throw headerError(
        `Unsupported type code \"${type}\".`,
        lineNumber,
        line.indexOf(rawField) + separator + 2,
        name,
      );
    }

    return { name, type: type as ToonTypeCode };
  });

  const parsed = headerSchema.safeParse({
    key: rawKey.trim(),
    count: Number(rawCount),
    fields,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw headerError(`Invalid TOON header: ${issue.message}`, lineNumber, 1);
  }

  const names = new Set<string>();
  for (const field of parsed.data.fields) {
    if (names.has(field.name)) {
      throw headerError(`Duplicate field \"${field.name}\".`, lineNumber, 1, field.name);
    }
    names.add(field.name);
  }

  return parsed.data;
}
