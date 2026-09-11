import { ToonkitParseError } from "./errors.js";
import { parseToon } from "./parser.js";
import { parseToonHeader } from "./schema.js";
import { serializeToon } from "./serializer.js";
import type { ToonDocument } from "./types.js";

/* ================= SAFE PARSE ================= */
export function safeParse(val: string): unknown {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

/* ================= TYPE HELPERS ================= */
/* ================= TOON → JSON ================= */
export function toonToJson<T extends ToonDocument = ToonDocument>(input: string): T {
  return parseToon(input) as T;
}

/* ================= JSON → TOON ================= */
export function jsonToToon(document: ToonDocument): string {
  return serializeToon(document);
}

export {
  configureToonFetch as configureToonAxios,
  createToonAxios,
  toonAxios,
  toonFetch,
} from "./fetch/index.js";

export type {
  ToonClientOptions,
  ToonFetchOptions,
  ToonFetchResponse,
} from "./fetch/index.js";

export { ToonkitParseError, parseToonHeader };
export type {
  ToonDocument,
  ToonField,
  ToonHeader,
  ToonLocation,
  ToonParseOptions,
  ToonPrimitive,
  ToonRecord,
  ToonTypeCode,
  ToonValue,
} from "./types.js";
