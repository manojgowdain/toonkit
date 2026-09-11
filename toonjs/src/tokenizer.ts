import { ToonkitParseError } from "./errors.js";

export function splitTopLevelFields(row: string, line: number): string[] {
  const fields: string[] = [];
  let fieldStart = 0;
  let quote: "'" | '"' | undefined;
  let escaping = false;
  let squareDepth = 0;
  let braceDepth = 0;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (quote) {
      if (escaping) {
        escaping = false;
      } else if (character === "\\") {
        escaping = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "[") {
      squareDepth += 1;
    } else if (character === "]") {
      squareDepth -= 1;
    } else if (character === "{") {
      braceDepth += 1;
    } else if (character === "}") {
      braceDepth -= 1;
    }

    if (squareDepth < 0 || braceDepth < 0) {
      throw new ToonkitParseError("Unexpected closing delimiter in record row.", {
        line,
        column: index + 1,
        received: row,
        hint: "Balance brackets and braces before separating fields with commas.",
      });
    }

    if (character === "," && squareDepth === 0 && braceDepth === 0) {
      fields.push(row.slice(fieldStart, index).trim());
      fieldStart = index + 1;
    }
  }

  if (quote || squareDepth !== 0 || braceDepth !== 0) {
    throw new ToonkitParseError("Unterminated structured value in record row.", {
      line,
      column: row.length + 1,
      received: row,
      hint: "Close quoted strings, brackets, and braces before the end of the row.",
    });
  }

  fields.push(row.slice(fieldStart).trim());
  return fields;
}
