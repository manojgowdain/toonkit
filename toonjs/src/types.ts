export type ToonPrimitive = string | number | boolean | null;

export type ToonValue = ToonPrimitive | ToonValue[] | { [key: string]: ToonValue };

export type ToonRecord = { [key: string]: ToonValue };

export type ToonDocument = { [key: string]: ToonValue | ToonRecord[] };

export const toonTypeCodes = ["s", "n", "b", "j", "a", "nl", "td"] as const;

export type ToonTypeCode = (typeof toonTypeCodes)[number];

export interface ToonField {
  name: string;
  type: ToonTypeCode;
}

export interface ToonHeader {
  key: string;
  count: number;
  fields: readonly ToonField[];
}

export interface ToonParseOptions {
  strict?: boolean;
}

export interface ToonLocation {
  line: number;
  column: number;
}
