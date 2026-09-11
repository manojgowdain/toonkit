# Toonkit Multi-Registry Migration Design

## Goal

Modernize the library in `toonjs/` as the scoped package
`@manojgowdain/toonkit`, retaining its public API while making TypeScript the
single source of truth for npm, JSR, GitHub, and local consumers.

## Scope and boundaries

The root repository is the Toonkit documentation web application. The npm/JSR
library remains the independently publishable package in `toonjs/`; all changes
in this design apply there unless explicitly noted. Existing uncommitted
`toonjs/tsconfig.json`, `toonjs/jsr.json`, and `toonjs/mod.js` work is in scope
with the user's approval.

## Architecture

`src/` will contain the sole implementation. The portable core consists of a
tokenizer, schema parser, value parser, serializer, public type definitions,
and `ToonkitParseError`. It has no framework or Node-only runtime dependency.
`src/index.ts` is the root API and `mod.ts` is a thin TypeScript re-export of
that root API, so npm and JSR expose precisely the same core implementation.

Framework integrations remain separate npm entrypoints (`./express`,
`./fastify`, `./hono`, `./fetch`, and `./next/server`). They are compiled from
the same TypeScript source but are not JSR exports because their framework
dependencies and server-specific contracts are not guaranteed portable.

Zod is the one new runtime dependency. It validates TOON header/schema syntax
and public configuration objects at external boundaries. Exported TypeScript
types are inferred from Zod schemas where that preserves useful autocomplete;
the core value model remains explicit recursive TypeScript types. No public API
will use `any`: untrusted inputs are `unknown`, parser results use generic
`ToonDocument`/`ToonValue` types, and adapters use framework-native types.

## Parser rules

The existing block form, `key[count]{schema}:`, remains supported. A tokenizer
splits record rows only on top-level commas: commas in quoted strings, arrays,
and objects are part of the current field. Strings may be quoted and support
escaped quotes. Arrays and objects use JSON-compatible bracket/brace syntax,
including nesting; the serializer emits this explicit syntax for complex row
values.

For `a` and `j` schema fields, structured values must be explicit whenever a
top-level comma would otherwise make the row ambiguous. The former implicit
form is rejected with an actionable `ToonkitParseError`, rather than guessed.
Unambiguous primitive records keep their current comma-delimited behavior.
Numbers, booleans, nulls, empty values, whitespace, and count/schema mismatch
are validated deterministically.

`ToonkitParseError` extends `Error` and includes the input location, field,
expected type, received fragment, and a concise syntax hint. `safeParse` keeps
its backwards-compatible non-throwing JSON fallback semantics.

## npm and JSR distribution

The package stays at version `2.2.2`, matching the current library release
line. npm uses `@manojgowdain/toonkit`, an ESM-first export map, generated
declarations and sourcemaps, plus a CommonJS compatibility build for the
currently documented subpaths. Its `files` allowlist publishes only runtime
artifacts, package metadata, README, and MIT license.

JSR uses `jsr.json` with the matching scoped name and version, with `mod.ts`
as its root export. JSR consumes the TypeScript source and validates its module
graph before publishing. The manifest intentionally does not duplicate parser
logic or point at generated npm output.

## Testing and verification

Tests cover public core APIs, primitive types, quoted and structured row
values, nested structures, empty values, malformed syntax, diagnostic error
fields, serialization round trips, and each maintained adapter entrypoint.
Build tests verify both module formats and declaration output. CI installs,
typechecks, tests, builds, performs npm package-content inspection, and runs a
JSR dry-run/check where the runner provides Deno.

The README documents npm, JSR, GitHub HTTPS/SSH, and local installation; the
package move from `toonkit`; public scoped npm publishing; JSR publishing; and
the explicit structured-value syntax. It will not claim old-package redirects
or automatic publishing.

## Compatibility and intentional changes

The existing names `safeParse`, `toonToJson`, `jsonToToon`, fetch aliases, and
adapter entrypoints remain. The intentional behavior change is that ambiguous
array/object row values are errors and must use bracketed/braced syntax. This
replaces the prior silent, incorrect field splitting.
