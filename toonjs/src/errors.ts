export interface ToonkitParseErrorOptions {
  line: number;
  column: number;
  field?: string;
  expected?: string;
  received?: string;
  hint?: string;
}

export class ToonkitParseError extends Error {
  readonly line: number;
  readonly column: number;
  readonly field?: string;
  readonly expected?: string;
  readonly received?: string;
  readonly hint?: string;

  constructor(message: string, options: ToonkitParseErrorOptions) {
    super(message);
    this.name = "ToonkitParseError";
    this.line = options.line;
    this.column = options.column;
    this.field = options.field;
    this.expected = options.expected;
    this.received = options.received;
    this.hint = options.hint;
  }
}
