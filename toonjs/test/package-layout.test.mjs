import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";

test("build emits ESM, CommonJS, and declaration entrypoints", async () => {
  for (const relativePath of [
    "../dist/index.js",
    "../dist/index.d.ts",
    "../dist/cjs/index.js",
  ]) {
    await access(new URL(relativePath, import.meta.url));
  }

  assert.ok(true);
});
