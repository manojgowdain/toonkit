import assert from "node:assert/strict";
import test from "node:test";

const core = await import(new URL("../dist/index.js", import.meta.url));

test("rejects unsupported field type codes with an actionable parse error", () => {
  assert.throws(
    () => core.toonToJson("users[1]{id:q}:\n1\n"),
    (error) =>
      error?.name === "ToonkitParseError" &&
      error.line === 1 &&
      error.field === "id" &&
      /unsupported type code/i.test(error.message),
  );
});

test("parses a record header into the declared field metadata", () => {
  const header = core.parseToonHeader(
    "employees[1]{id:n,name:s,salary:a,active:b}:",
    1,
  );

  assert.equal(header.key, "employees");
  assert.equal(header.count, 1);
  assert.deepEqual(
    header.fields.map(({ name, type }) => [name, type]),
    [
      ["id", "n"],
      ["name", "s"],
      ["salary", "a"],
      ["active", "b"],
    ],
  );
});
