# @manojgowdain/toonkit

![npm](https://img.shields.io/npm/v/@manojgowdain/toonkit)
![downloads](https://img.shields.io/npm/dw/@manojgowdain/toonkit)
![license](https://img.shields.io/npm/l/@manojgowdain/toonkit)

Typed Object Oriented Notation (TOON) parser, serializer, and adapter toolkit for JavaScript and TypeScript.

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

- `@manojgowdain/toonkit/fetch`
- `@manojgowdain/toonkit/express`
- `@manojgowdain/toonkit/fastify`
- `@manojgowdain/toonkit/hono`
- `@manojgowdain/toonkit/next/server`

## Install

### npm

```bash
npm install @manojgowdain/toonkit
```

### JSR (Deno)

```bash
deno add jsr:@manojgowdain/toonkit
```

### GitHub

```bash
npm install github:manojgowdain/toonkit
```

Or via SSH:

```bash
npm install git+ssh://git@github.com/manojgowdain/toonkit.git
```

### Migration from old `toonkit`

If you were using the old `toonkit` package, update your dependencies:

```bash
# Old
npm install toonkit

# New
npm install @manojgowdain/toonkit
```

Update your imports:

```js
// Old
import { toonToJson } from "toonkit";

// New
import { toonToJson } from "@manojgowdain/toonkit";
```

The package was republished under the new npm scope `@manojgowdain/toonkit` due to loss of access to the original npm account.

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

### `toonToJson(input: string)`

Parses TOON text into a JavaScript object.

```js
import { toonToJson } from "@manojgowdain/toonkit";

const data = toonToJson(`device_id[1]{0:s}:\nDEVICE_PRO_01\n`);
```

Notes:

- Single values use the `{0:type}` schema form.
- Arrays of objects are parsed row by row using comma-separated values.
- `j` and `a` fields should contain valid JSON text.

### `jsonToToon(obj: any)`

Serializes a JavaScript object into TOON text.

```js
import { jsonToToon } from "@manojgowdain/toonkit";

const toon = jsonToToon({
  device_id: "DEVICE_PRO_01",
  battery: 87,
  is_active: true,
});
```

Notes:

- Primitive values are emitted as `key[1]{0:type}:` blocks.
- Arrays of objects are emitted as schema blocks using the keys from the first item.
- Complex values inside row arrays are stringified with normal JavaScript coercion, so keep row fields primitive or pre-stringify them.

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
import { toonFetch } from "@manojgowdain/toonkit";

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

Import from `@manojgowdain/toonkit/express`.

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
import { toon } from "@manojgowdain/toonkit/express";

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

Import from `@manojgowdain/toonkit/fastify`.

Available exports:

- `toon`
- `toonToJson`
- `jsonToToon`

```js
import Fastify from "fastify";
import { toon } from "@manojgowdain/toonkit/fastify";

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

Import from `@manojgowdain/toonkit/hono`.

Available exports:

- `toon`
- `toonToJson`
- `jsonToToon`

```ts
import { Hono } from "hono";
import { toon } from "@manojgowdain/toonkit/hono";

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

Import from `@manojgowdain/toonkit/next/server`.

Available exports:

- `ToonResponse`
- `parseToonRequest`

```ts
import { NextRequest } from "next/server";
import { ToonResponse, parseToonRequest } from "@manojgowdain/toonkit/next/server";

export async function POST(req: NextRequest) {
  const body = await parseToonRequest(req);
  return ToonResponse.toon({ ok: true, received: body });
}
```

## Limitations to know

- `jsonToToon()` is optimized for flat objects and arrays of records.
- Nested row values should be pre-stringified if you need them preserved exactly.
- `toonToJson()` expects block headers in the `key[count]{schema}:` form.

## Development

```bash
npm run build
npm test
```

## License

MIT