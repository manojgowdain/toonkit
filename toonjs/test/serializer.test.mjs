import assert from "node:assert/strict";
import test from "node:test";

const core = await import(new URL("../dist/index.js", import.meta.url));

test("serializes structured record values with explicit syntax", () => {
  const input = {
    employees: [
      { id: 1, salary: [1, 2], metadata: { team: "A,B" }, active: true },
    ],
  };
  const text = core.jsonToToon(input);

  assert.match(text, /salary:a/);
  assert.match(text, /\[1,2\]/);
  assert.deepEqual(core.toonToJson(text), input);
});

test("round-trips quoted primitive strings", () => {
  const input = { note: "hello, \"toonkit\"" };
  assert.deepEqual(core.toonToJson(core.jsonToToon(input)), input);
});
