# Toonkit Package Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship toonjs as @manojgowdain/toonkit with a fully typed TypeScript core, deterministic TOON parsing, npm distribution, and JSR source publishing.

**Architecture:** The portable parser, serializer, types, Zod schemas, and errors live under src. src/index.ts and mod.ts expose the same core. npm emits ESM, declarations, maps, and CommonJS compatibility artifacts. JSR consumes the ESM TypeScript core. Existing framework adapters are npm-only subpaths.

**Tech Stack:** TypeScript 5, Zod, Node test runner, npm, JSR/Deno, GitHub Actions.

**Spec:** docs/superpowers/specs/2026-09-10-toonkit-migration-design.md

## Global Constraints

- Only toonjs is the publishable package; the repository root is the documentation application.
- The npm and JSR identity is exactly @manojgowdain/toonkit; preserve version 2.2.2 unless publishing requires a bump.
- TypeScript is the source of truth; remove all checked-in JavaScript files with a TypeScript equivalent.
- Do not expose any; public inputs are unknown or precise generic types.
- Zod validates public parser headers, schemas, and configuration boundaries.
- Keep current core names and npm adapter subpaths; reject ambiguous structured record fields with ToonkitParseError.
- npm tarballs must exclude source, tests, CI configuration, credentials, environment files, and development artifacts.

---

### Task 1: Establish package output and publish safety

**Files:**
- Modify: toonjs/package.json, toonjs/tsconfig.json, toonjs/tsconfig.cjs.json, toonjs/.gitignore
- Create: toonjs/.npmignore, toonjs/test/package-layout.test.mjs
- Delete: toonjs/src/index.js and JavaScript duplicates in express, fastify, and hono

**Interfaces:**
- Produces: dist ESM JavaScript, declarations, maps, and dist/cjs CommonJS compatibility output.

- [ ] **Step 1: Write a failing output-layout test**

Create a Node test that verifies dist/index.js, dist/index.d.ts, and dist/cjs/index.js exist after building.

- [ ] **Step 2: Verify red**

Run: npm test -- --test test/package-layout.test.mjs
Expected: FAIL because current tests do not establish that contract.

- [ ] **Step 3: Implement build configuration**

Set NodeNext ESM declaration, declaration map, and source map output. Make the CJS config override module/module resolution and skip declarations/mod.ts. Add portable clean, typecheck, test, and prepublishOnly scripts. Add Zod runtime dependency. Configure the root export with types, import, and require targets and retain conditional exports for every existing adapter. Set files allowlist, Git ignores, and npm defense-in-depth ignore list.

- [ ] **Step 4: Delete stale checked-in JavaScript sources**

Remove only JS files that have TS counterparts; do not hand-delete build artifacts.

- [ ] **Step 5: Verify green**

Run: npm run clean; npm run build; node --test test/package-layout.test.mjs
Expected: PASS with all output files.

- [ ] **Step 6: Commit**

Run: git add toonjs/package.json toonjs/package-lock.json toonjs/tsconfig.json toonjs/tsconfig.cjs.json toonjs/.gitignore toonjs/.npmignore toonjs/src toonjs/test/package-layout.test.mjs
Run: git commit -m "build: establish TypeScript package outputs"

### Task 2: Add strict types, Zod schemas, and diagnostics

**Files:**
- Create: toonjs/src/types.ts, toonjs/src/errors.ts, toonjs/src/schema.ts
- Modify: toonjs/src/index.ts
- Test: toonjs/test/schema.test.mjs

**Interfaces:**
- Produces: ToonPrimitive, ToonValue, ToonRecord, ToonDocument, ToonTypeCode, ToonField, ToonHeader, ToonParseOptions, parseHeader, and ToonkitParseError.

- [ ] **Step 1: Write failing header and error tests**

Test an invalid type code in users[1]{id:q}: and verify a ToonkitParseError with line 1, field id, and an unsupported-type message. Test a valid employee header and assert field names, type codes, and count.

- [ ] **Step 2: Verify red**

Run: npm run build; node --test test/schema.test.mjs
Expected: FAIL because unknown type codes have no typed error.

- [ ] **Step 3: Implement Zod boundary validation**

Define exact Zod schemas for headers, positive counts, identifiers, duplicate fields, type codes, and public options. Implement ToonkitParseError containing line, column, optional field, expected, received, and hint. Convert Zod issues to that public error. Export types and error, not raw internal schemas.

- [ ] **Step 4: Verify green**

Run: npm run build; node --test test/schema.test.mjs
Expected: PASS.

- [ ] **Step 5: Commit**

Run: git add toonjs/src/types.ts toonjs/src/errors.ts toonjs/src/schema.ts toonjs/src/index.ts toonjs/test/schema.test.mjs
Run: git commit -m "feat: add typed toon schemas and parse errors"

### Task 3: Tokenize and parse rows deterministically

**Files:**
- Create: toonjs/src/tokenizer.ts, toonjs/src/parser.ts
- Modify: toonjs/src/index.ts
- Test: toonjs/test/parser.test.mjs

**Interfaces:**
- Produces: splitTopLevelFields, parseToonValue, and generic toonToJson.

- [ ] **Step 1: Write failing regression tests**

Parse an employee row containing quoted comma text and nested bracketed salary arrays. Assert structured values are preserved. Assert that an unbracketed array field raises ToonkitParseError naming salary and suggesting brackets. Add coverage for empty arrays/objects, escaped quotes, nulls, whitespace, malformed nesting, invalid booleans, missing/extra fields, and row count mismatch.

- [ ] **Step 2: Verify red**

Run: npm run build; node --test test/parser.test.mjs
Expected: FAIL because the existing comma split destroys nested values.

- [ ] **Step 3: Implement tokenizer and parser**

Track quote state, escapes, brackets, and braces while scanning each row. Split only at top-level commas. Produce exact errors for unmatched structures. Require JSON-compatible explicit values for array/object fields. Keep strings/timestamps after quote decoding and preserve safeParse fallback behavior.

- [ ] **Step 4: Verify green**

Run: npm run build; node --test test/parser.test.mjs
Expected: PASS.

- [ ] **Step 5: Commit**

Run: git add toonjs/src/tokenizer.ts toonjs/src/parser.ts toonjs/src/index.ts toonjs/test/parser.test.mjs
Run: git commit -m "feat: parse structured toon rows deterministically"

### Task 4: Implement typed serialization and round trips

**Files:**
- Create: toonjs/src/serializer.ts
- Modify: toonjs/src/index.ts
- Test: toonjs/test/serializer.test.mjs

**Interfaces:**
- Produces: jsonToToon accepting ToonDocument and emitting explicit complex values.

- [ ] **Step 1: Write failing round-trip tests**

Serialize employee records containing arrays and objects, then parse them and assert deep equality. Test commas/quotes in strings, nulls, empty arrays, and unsupported functions producing TypeError.

- [ ] **Step 2: Verify red**

Run: npm run build; node --test test/serializer.test.mjs
Expected: FAIL because current row serialization coerces complex values to ambiguous text.

- [ ] **Step 3: Implement strict value formatting**

Classify ToonValue recursively; use compact JSON for arrays/objects. Quote and escape text containing separators, syntax delimiters, edge whitespace, or line breaks. Preserve primitive blocks and record schemas.

- [ ] **Step 4: Verify green**

Run: npm run build; node --test test/schema.test.mjs test/parser.test.mjs test/serializer.test.mjs
Expected: PASS.

- [ ] **Step 5: Commit**

Run: git add toonjs/src/serializer.ts toonjs/src/index.ts toonjs/test/serializer.test.mjs
Run: git commit -m "feat: serialize typed structured toon values"

### Task 5: Fully type maintained adapters

**Files:**
- Modify: toonjs/src/fetch/index.ts
- Modify: toonjs/src/express/index.ts, middleware.ts, parser.ts, response.ts
- Modify: toonjs/src/fastify/index.ts, parser.ts, plugin.ts, response.ts
- Modify: toonjs/src/hono/index.ts, middleware.ts, parser.ts, response.ts
- Modify: toonjs/src/next/server.ts
- Test: toonjs/test/adapters.test.mjs

**Interfaces:**
- Produces: preserved adapter entrypoints with typed documents/results and no public any contracts.

- [ ] **Step 1: Write failing adapter tests**

Split current all-exports smoke coverage into root, fetch, Express, Fastify, Hono, and Next tests. Assert the built declaration exposes ToonkitParseError.

- [ ] **Step 2: Verify red**

Run: npm run build; node --test test/adapters.test.mjs
Expected: FAIL until the new contract/tests exist.

- [ ] **Step 3: Replace broad types**

Use unknown for untrusted bodies, generic T extends ToonDocument for parsed values, framework-native request/reply/context types, type guards before conversion, and Zod normalization for fetch options. Preserve names including configureToonAxios.

- [ ] **Step 4: Verify green**

Run: npm run typecheck; npm run build; node --test test/adapters.test.mjs
Expected: PASS with no implicit-any diagnostics.

- [ ] **Step 5: Commit**

Run: git add toonjs/src/fetch toonjs/src/express toonjs/src/fastify toonjs/src/hono toonjs/src/next toonjs/test/adapters.test.mjs toonjs/test/all-exports.mjs
Run: git commit -m "refactor: fully type toonkit adapters"

### Task 6: Complete npm/JSR metadata, docs, license, and CI

**Files:**
- Modify: toonjs/package.json, toonjs/package-lock.json, toonjs/jsr.json, toonjs/README.md
- Create: toonjs/mod.ts, toonjs/LICENSE, .github/workflows/toonjs-ci.yml
- Test: toonjs/test/package-metadata.test.mjs

**Interfaces:**
- Produces: matching npm/JSR package identity/version and a portable mod.ts root.

- [ ] **Step 1: Write failing metadata tests**

Assert npm name exactness, built export targets, JSR name/version matching, JSR export mod.ts, and that mod.ts only re-exports src/index.ts.

- [ ] **Step 2: Verify red**

Run: npm run build; node --test test/package-metadata.test.mjs
Expected: FAIL because the existing npm name is unscoped, JSR version is 0.1.0, and mod.js is empty.

- [ ] **Step 3: Implement registry entrypoints**

Set identity/repository/bugs/homepage/funding to manojgowdain/toonkit and publishConfig public without credentials. Create mod.ts as the portable re-export. Add matching jsr.json. Add MIT license text only after confirming holder/year from history; otherwise request legal source text.

- [ ] **Step 4: Rewrite README and add CI**

Document npm, JSR, GitHub shorthand/HTTPS/SSH, local tarball, migration, explicit syntax, errors, npm public scoped publishing, and JSR publishing. Update all badges. Add a non-publishing CI workflow for install, typecheck, test, build, npm dry-run, and JSR validation when available.

- [ ] **Step 5: Verify green**

Run: npm run build; node --test test/package-metadata.test.mjs
Expected: PASS.

- [ ] **Step 6: Commit**

Run: git add toonjs/package.json toonjs/package-lock.json toonjs/mod.ts toonjs/jsr.json toonjs/README.md toonjs/LICENSE toonjs/test/package-metadata.test.mjs .github/workflows/toonjs-ci.yml
Run: git commit -m "chore: prepare scoped npm and jsr publishing"

### Task 7: Release-grade verification

**Files:**
- Verify: toonjs/dist, toonjs/test, npm package listing

**Interfaces:**
- Produces: evidence for registry readiness without publishing.

- [ ] **Step 1: Run local suite**

Run: npm install; npm run typecheck; npm test; npm run build; npm pack --dry-run
Expected: all exit zero; tarball contains only runtime output, README, license, and manifest.

- [ ] **Step 2: Test clean ESM and CommonJS consumers**

In an external temporary project, install the packed tarball. Import toonToJson from @manojgowdain/toonkit in ESM and require it in CommonJS; both must parse a simple name block to Mina.

- [ ] **Step 3: Validate JSR**

Run: npx jsr publish --dry-run
Expected: JSR validates jsr.json, mod.ts, and all reachable TypeScript modules. If unavailable, record the exact toolchain blocker.

- [ ] **Step 4: Verify GitHub installation syntax**

In the temporary project run: npm install github:manojgowdain/toonkit --ignore-scripts
Expected: npm accepts the valid shorthand. Report network/repository availability as an external limitation if it fails.

- [ ] **Step 5: Commit**

Run: git add toonjs
Run: git commit -m "test: verify toonkit release package"

