import assert from "node:assert/strict";
import test from "node:test";

const core = await import(new URL("../dist/index.js", import.meta.url));

test("parses quoted and nested structured record values", () => {
  const parsed = core.toonToJson(
    "employees[1]{id:n,name:s,salary:a,active:b}:\n" +
      '1,"Riya, S",[6565,65656,[56565,6656]],true\n',
  );

  assert.deepEqual(parsed.employees[0], {
    id: 1,
    name: "Riya, S",
    salary: [6565, 65656, [56565, 6656]],
    active: true,
  });
});

test("rejects ambiguous unbracketed array fields with a hint", () => {
  assert.throws(
    () =>
      core.toonToJson(
        "employees[1]{id:n,salary:a,active:b}:\n1,6565,65656,true\n",
      ),
    (error) =>
      error?.name === "ToonkitParseError" &&
      error.field === "salary" &&
      /\[.*\]/s.test(error.hint),
  );
});

test("handles empty values and rejects malformed row structures", () => {
  assert.deepEqual(
    core.toonToJson('settings[1]{labels:a,note:s}:\n[],""\n'),
    { settings: [{ labels: [], note: "" }] },
  );
  assert.throws(
    () => core.toonToJson("settings[1]{labels:a}:\n[1,2\n"),
    (error) => error?.name === "ToonkitParseError" && error.line === 2,
  );
});
