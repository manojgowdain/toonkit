# toonkit2

Typed Object Oriented Notation (TOON) parser, serializer, and adapter toolkit for JavaScript and TypeScript.

This package is the released 2.x package name for the TOON toolkit.

## Official links

- Official documentation: https://toonkit.js.org/
- npm: https://www.npmjs.com/package/toonkit2
- JSR: https://jsr.io/@manojgowdain/toonkit2
- GitHub: https://github.com/manojgowdain/toonkit
- Author: https://manojgowda.in/
- Related projects: https://ssdiskdb.js.org/ · https://pgbloom.iotkit.in/

For new applications, install `toonkit2`. The older `toonkit` package is
maintained only as a legacy package name; use the official documentation for
migration guidance.

## What it exports

The package root exports the core helpers plus the fetch client:

- `safeParse(val: string)`
- `toonToJson(input: string)`
- `jsonToToon(obj: any)`
- `configureToonAxios(options?)` as an alias for `configureToonFetch`
- `createToonAxios(options?)`
- `toonAxios`
- `toonFetch(input, init?)`

The package also exposes adapter subpaths:

- `toonkit2/fetch`
- `toonkit2/express`
- `toonkit2/fastify`
- `toonkit2/hono`
- `toonkit2/next/server`

## Install

```bash
npm install toonkit2
```

## Core format

TOON uses block headers like `key[count]{schema}:`.

Example:

```text
device_id[1]{0:s}:
DEVICE_PRO_01

battery[1]{0:n}:
87

employees[2]{id:n,name:s,active:b}:
1,Ava,true
2,Noah,false
```

Array and object fields are parsed deterministically by scanning nested brackets, braces, and quoted strings instead of splitting on raw commas.

Supported type codes in the current implementation:

| Code | Meaning | Parse behavior |
| --- | --- | --- |
| `s` | string | returned as-is |
| `n` | number | `Number(value)` |
| `b` | boolean | `value === "true"` |
| `j` | JSON object | `JSON.parse(value)` with raw fallback from `safeParse` |
| `a` | array | `JSON.parse(value)` with raw fallback from `safeParse` |
| `nl` | null | `null` |
| `td` | timestamp/raw text | returned as-is |

## Core API

## TOON Runtime

Use the `toon` tagged template when you want TOON data to behave like a native
JavaScript value while retaining its schema for serialization:

```ts
import { toon } from "toonkit2";

const employees = toon`
employees[2]{id:n,name:s,salary:n,active:b}:
1,Riya,90000,true
2,John,80000,false
`;

employees[0].salary = 95000;
employees.push({ id: 3, name: "Manoj", salary: 100000, active: true });

console.log(employees.filter((employee) => employee.active));
console.log(employees.toToon());
console.log(employees.toJSON());
```

The runtime supports normal array operations, direct mutation, template
interpolation, `JSON.stringify`, and compact serialization with updated row
counts and schemas. Runtime values expose `toToon()` and `toJSON()`. The
namespace also exposes `toon.toToon(value)`, `toon.toJSON(value)`,
`toon.clone(value)`, and `toon.equals(a, b)`.

### `toonToJson(input: string)`

Parses TOON text into a JavaScript object.

```js
import { toonToJson } from "toonkit2";

const data = toonToJson(`device_id[1]{0:s}:\nDEVICE_PRO_01\n`);
```

Notes:

- Single values use the `{0:type}` form.
- Arrays of objects are parsed row by row using a deterministic top-level splitter, so commas inside nested arrays, objects, or quoted strings stay intact.
- `j` and `a` fields should contain valid JSON text.

### `jsonToToon(obj: any)`

Serializes a JavaScript object into TOON text.

```js
import { jsonToToon } from "toonkit2";

const toon = jsonToToon({
  device_id: "DEVICE_PRO_01",
  battery: 87,
  is_active: true,
});
```

Notes:

- Primitive values are emitted as `key[1]{0:type}:` blocks.
- Arrays of objects are emitted as schema blocks using the keys from the first item.
- Nested array and object values are emitted as JSON text.

### `safeParse(val: string)`

Attempts `JSON.parse(val)` and falls back to the original string if parsing fails.

## Fetch client

The fetch wrapper turns `application/toon` and `application/json` requests into a single client flow.

### `toonFetch(input, init?)`

Returns:

```ts
{
  data: T | null;
  response: Response;
}
```

Example:

```js
import { toonFetch } from "toonkit2";

const result = await toonFetch("http://localhost:3000/users", {
  method: "POST",
  data: {
    employees: [
      { id: 1, name: "Ava", active: true },
    ],
  },
});

console.log(result.data);
```

### `configureToonAxios(options?)`

Configures the shared axios instance used by `toonFetch`.

### `createToonAxios(options?)`

Creates an isolated axios instance with the same TOON-friendly defaults.

### `toonAxios`

The shared axios instance used internally by `toonFetch`.

## Express

Import from `toonkit2/express`.

Available exports:

- `toon`
- `toonToJson`
- `jsonToToon`
- `createCompressionMiddleware`
- `createTextMiddleware`
- `createRequestMiddleware`
- `createResponseMiddleware`

```js
import express from "express";
import { toon } from "toonkit2/express";

const app = express();
app.use(...toon());

app.post("/devices", (req, res) => {
  const parsed = req.toon();
  res.toon({ ok: true, received: parsed });
});
```

What the adapter does:

- adds `req.toon()`
- adds `res.toon(body)`
- parses `text/plain`, `application/toon`, `application/vnd.toon`, `application/x-toon`, and similar text bodies

## Fastify

Import from `toonkit2/fastify`.

Available exports:

- `toon`
- `toonToJson`
- `jsonToToon`

```js
import Fastify from "fastify";
import { toon } from "toonkit2/fastify";

const fastify = Fastify();
await fastify.register(toon);

fastify.post("/devices", async (request, reply) => {
  return reply.toon({ ok: true, received: request.toon() });
});
```

What the adapter does:

- adds `request.toon()`
- adds `reply.toon(body)`
- installs a content-type parser for TOON and plain text payloads

## Hono

Import from `toonkit2/hono`.

Available exports:

- `toon`
- `toonToJson`
- `jsonToToon`

```ts
import { Hono } from "hono";
import { toon } from "toonkit2/hono";

const app = new Hono();
app.use("*", toon());

app.post("/devices", async (c) => {
  const parsed = await c.req.toon();
  return c.toon({ ok: true, received: parsed });
});
```

What the adapter does:

- adds `c.req.toon()`
- adds `c.toon(body)`

## Next.js

Import from `toonkit2/next/server`.

Available exports:

- `ToonResponse`
- `parseToonRequest`

```ts
import { NextRequest } from "next/server";
import { ToonResponse, parseToonRequest } from "toonkit2/next/server";

export async function POST(req: NextRequest) {
  const body = await parseToonRequest(req);
  return ToonResponse.toon({ ok: true, received: body });
}
```

## Migration note

The package name is now `toonkit2`, while the TOON format itself remains the same. Existing payloads continue to work as long as they follow the documented `key[count]{schema}:` block format. The key difference is the package identity and the deterministic parsing behavior for array/object fields containing nested commas.

## Development

```bash
npm run build
npm test
```

## License

MIT