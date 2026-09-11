# Toonkit Type Safety and Validation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 'any' types, add Zod validation where appropriate, improve error messages, and enhance overall type safety while maintaining backward compatibility.

**Architecture:** Focus on the core parser, serializer, and framework adapters. Replace 'any' types with proper generics and unknown types, add Zod validation at API boundaries, and improve error handling with more specific error types.

**Tech Stack:** TypeScript 5, Zod, Node.js test runner

**Spec:** docs/superpowers/specs/2026-09-10-toonkit-migration-design.md

## Global Constraints

- Maintain backward compatibility with existing API
- Keep the same public interface shapes
- Preserve existing TOON parsing behavior
- Only add Zod as a runtime dependency where it provides clear benefit
- Do not break existing tests
- Ensure npm and JSR compatibility is maintained

---

### Task 1: Eliminate 'any' types in core types and interfaces

**Files:**
- Modify: toonjs/src/types.ts
- Modify: toonjs/src/index.ts
- Modify: toonjs/src/errors.ts
- Test: Extend existing test files to cover new type safety

**Interfaces:**
- Produces: Properly typed ToonValue, ToonDocument, and related interfaces
- Consumes: Existing type definitions
- Produces: Improved type safety throughout the codebase

- [ ] **Step 1: Write failing tests for improved type safety**
  
  Create tests that verify:
  - SafeParse returns proper types instead of 'any'
  - toonToJson and jsonToToon have proper generic typing
  - ToonkitParseError has proper typing for all fields

- [ ] **Step 2: Verify red**
  
  Run: npm test
  Expected: Some type-related tests fail due to 'any' usage

- [ ] **Step 3: Improve core type definitions**
  
  Replace 'any' with proper types:
  - In safeParse: Change return type from 'any' to 'unknown'
  - In ToonkitParseError: Ensure proper typing for all fields
  - Review and improve ToonValue and ToonDocument types if needed

- [ ] **Step 4: Verify green**
  
  Run: npm run typecheck && npm test
  Expected: PASS with no TypeScript errors

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/src/types.ts toonjs/src/index.ts toonjs/src/errors.ts
  Run: git commit -m "feat: eliminate 'any' types from core interfaces"

---

### Task 2: Add Zod validation for public API boundaries

**Files:**
- Modify: toonjs/src/index.ts
- Modify: toonjs/src/schema.ts
- Create: toonjs/src/validation.ts (if needed)
- Test: toonjs/test/validation.test.mjs

**Interfaces:**
- Produces: Zod schemas for validating public inputs
- Consumes: User-provided configuration and inputs
- Produces: Runtime validation with helpful error messages

- [ ] **Step 1: Write failing validation tests**
  
  Create tests that verify:
  - Invalid TOON headers are caught with helpful error messages
  - Malformed configuration objects are rejected
  - Zod schemas work correctly at API boundaries

- [ ] **Step 2: Verify red**
  
  Run: npm run build; node --test test/validation.test.mjs
  Expected: FAIL because validation tests don't exist yet

- [ ] **Step 3: Implement Zod validation at key boundaries**
  
  Add Zod validation for:
  - TOON header parsing (already partially done, enhance it)
  - Public API options where appropriate
  - Configuration objects in framework adapters

- [ ] **Step 4: Verify green**
  
  Run: npm run build; node --test test/validation.test.mjs
  Expected: PASS

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/src/schema.ts toonjs/src/index.ts toonjs/test/validation.test.mjs
  Run: git commit -m "feat: add Zod validation for public API boundaries"

---

### Task 3: Eliminate 'any' types in framework adapters

**Files:**
- Modify: toonjs/src/express/middleware.ts
- Modify: toonjs/src/express/response.ts
- Modify: toonjs/src/fastify/parser.ts
- Modify: toonjs/src/hono/parser.ts
- Modify: toonjs/src/hono/response.ts
- Modify: toonjs/src/fetch/index.ts
- Modify: toonjs/src/next/server.ts
- Test: Extend adapter tests

**Interfaces:**
- Produces: Properly typed framework adapter interfaces
- Consumes: Framework-specific types (Express, Fastify, Hono, Next.js)
- Produces: Type-safe adapter implementations

- [ ] **Step 1: Write failing tests for adapter type safety**
  
  Create tests that verify:
  - Express request.toon() returns proper types
  - Fastify request.toon() returns proper types
  - Hono request.toon() returns proper types
  - Fetch API has proper generic typing
  - Next.js adapters have proper types

- [ ] **Step 2: Verify red**
  
  Run: npm run build; node --test test/adapters.test.mjs
  Expected: FAIL due to 'any' types in adapter interfaces

- [ ] **Step 3: Replace 'any' with proper types in adapters**
  
  - Express: Replace 'any' in Request augmentation with proper generic type
  - Fastify: Replace 'any' in Request decoration with proper generic type  
  - Hono: Replace 'any' in Request augmentation and Response return types
  - Fetch: Improve generic typing in toonFetch and related functions
  - Next.js: Improve typing in ToonResponse and parseToonRequest

- [ ] **Step 4: Verify green**
  
  Run: npm run typecheck; npm run build; node --test test/adapters.test.mjs
  Expected: PASS with no implicit-any diagnostics

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/src/express/middleware.ts toonjs/src/express/response.ts toonjs/src/fastify/parser.ts toonjs/src/hono/parser.ts toonjs/src/hono/response.ts toonjs/src/fetch/index.ts toonjs/src/next/server.ts toonjs/test/adapters.test.mjs
  Run: git commit -m "refactor: eliminate 'any' types from framework adapters"

---

### Task 4: Improve error messages and add more specific error types

**Files:**
- Modify: toonjs/src/errors.ts
- Modify: toonjs/src/parser.ts
- Modify: toonjs/src/schema.ts
- Test: toonjs/test/errors.test.mjs

**Interfaces:**
- Produces: Enhanced ToonkitParseError with more specific error types
- Consumes: Parser error conditions
- Produces: More helpful error messages with line/column/field info

- [ ] **Step 1: Write failing tests for improved error handling**
  
  Create tests that verify:
  - Error messages include line and column numbers
  - Error messages specify expected vs received values
  - Error messages provide helpful hints for fixing issues
  - Different error types for different failure modes

- [ ] **Step 2: Verify red**
  
  Run: npm run build; node --test test/errors.test.mjs
  Expected: FAIL because error tests don't exist yet

- [ ] **Step 3: Enhance ToonkitParseError and error creation**
  
  Improve:
  - More specific error types for different parser failures
  - Better error messages with context
  - Consistent error formatting across the parser
  - Additional error information where helpful

- [ ] **Step 4: Verify green**
  
  Run: npm run build; node --test test/errors.test.mjs
  Expected: PASS

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/src/errors.ts toonjs/src/parser.ts toonjs/src/schema.ts toonjs/test/errors.test.mjs
  Run: git commit -m "feat: improve error messages and add specific error types"

---

### Task 5: Add comprehensive test coverage for edge cases

**Files:**
- Create: toonjs/test/edge-cases.test.mjs
- Modify: toonjs/test/schema.test.mjs (if needed)
- Modify: toonjs/test/parser.test.mjs (if needed)
- Modify: toonjs/test/serializer.test.mjs (if needed)

**Interfaces:**
- Produces: Comprehensive test coverage for edge cases
- Consumes: Various TOON input formats
- Produces: Confidence in parser robustness

- [ ] **Step 1: Write failing tests for edge cases**
  
  Create tests that verify:
  - Ambiguous array/object syntax is properly rejected
  - Quoted strings with special characters work correctly
  - Nested structures are handled properly
  - Empty values and whitespace are handled correctly
  - Malformed input produces helpful errors
  - Round-trip serialization/parsing works for complex structures

- [ ] **Step 2: Verify red**
  
  Run: npm run build; node --test test/edge-cases.test.mjs
  Expected: FAIL because edge case tests don't exist yet

- [ ] **Step 3: Implement comprehensive edge case tests**
  
  Add tests for:
  - Primitive values (string, number, boolean, null)
  - Arrays (empty, nested, mixed types)
  - Objects (empty, nested, mixed types)
  - Mixed structures (objects containing arrays, arrays containing objects)
  - Special strings (quoted, escaped, unicode, emoji)
  - Whitespace handling (leading, trailing, blank lines)
  - Error cases (malformed headers, invalid types, missing values)
  - Round-trip consistency

- [ ] **Step 4: Verify green**
  
  Run: npm run build; node --test test/edge-cases.test.mjs
  Expected: PASS

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/test/edge-cases.test.mjs
  Run: git commit -m "feat: add comprehensive edge case testing"

---

### Task 6: Final verification and documentation updates

**Files:**
- Modify: toonjs/README.md
- Modify: toonjs/package.json (if needed)
- Verify: Build output and package contents
- Test: Installation from npm, JSR simulation, GitHub

**Interfaces:**
- Produces: Verified, release-ready package
- Consumes: All previous improvements
- Produces: Confirmation that the package works correctly

- [ ] **Step 1: Write failing verification tests**
  
  Create verification that:
  - npm pack --dry-run shows correct contents
  - TypeScript compilation succeeds with strict flags
  - All tests pass
  - Bundle size is reasonable
  - No unintended dependencies are included

- [ ] **Step 2: Verify red**
  
  Run: npm run build; npm test; npm run typecheck; npm pack --dry-run
  Expected: May fail on some verification checks

- [ ] **Step 3: Perform final verification**
  
  - Run full test suite
  - Check for any remaining 'any' types
  - Verify build outputs are correct
  - Test npm pack contents
  - Validate JSR compatibility (simulate)
  - Update documentation if needed

- [ ] **Step 4: Verify green**
  
  Run: npm run build; npm test; npm run typecheck; npm pack --dry-run
  Expected: All checks pass

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/README.md toonjs/package.json (if modified)
  Run: git commit -m "chore: final verification and documentation updates"