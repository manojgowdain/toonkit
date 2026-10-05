
# toonkit2

TOON parser, serializer, and framework adapter toolkit for JavaScript and TypeScript.

## Official links

- Documentation: https://toonkit.js.org/
- Recommended npm package: https://www.npmjs.com/package/toonkit2
- JSR package: https://jsr.io/@manojgowdain/toonkit2
- Source repository: https://github.com/manojgowdain/toonkit
- Developer: https://manojgowda.in/
- Related projects: https://ssdiskdb.js.org/ · https://pgbloom.iotkit.in/

Install the new package for all new projects:

```bash
npm install toonkit2
```

`toonkit` is the legacy package name. See the
[official documentation](https://toonkit.js.org/docs) for migration guidance.

This repository’s publishable library is the package under [toonjs](./toonjs), and the package name is now `toonkit2`.

## Exports

Root exports:

- `safeParse(val: string)`
- `toonToJson(input: string)`
- `jsonToToon(obj: any)`
- `configureToonAxios(options?)`
- `createToonAxios(options?)`
- `toonAxios`
- `toonFetch(input, init?)`

Subpath exports:

- `toonkit2/fetch`
- `toonkit2/express`
- `toonkit2/fastify`
- `toonkit2/hono`
- `toonkit2/next/server`

## Core format

TOON uses block headers like `key[count]{schema}:`.

```text
device_id[1]{0:s}:
DEVICE_PRO_01

battery[1]{0:n}:
87

employees[2]{id:n,name:s,active:b}:
1,Ava,true
2,Noah,false
```

Array and object fields are parsed deterministically by scanning nested brackets, braces, and quoted strings instead of splitting raw commas.

Supported type codes:

| Code | Meaning | Parse behavior |
| --- | --- | --- |
| `s` | string | returned as-is |
| `n` | number | `Number(value)` |
| `b` | boolean | `value === "true"` |
| `j` | JSON object | `JSON.parse(value)` with raw fallback |
| `a` | array | `JSON.parse(value)` with raw fallback |
| `nl` | null | `null` |
| `td` | raw text/date | returned as-is |

## Core API

## TOON Runtime

```ts
import { toon } from "toonkit2";

const employees = toon`
employees[2]{id:n,name:s,salary:n,active:b}:
1,Riya,90000,true
2,John,80000,false
`;

employees[0].salary = 95000;
employees.push({ id: 3, name: "Manoj", salary: 100000, active: true });

console.log(employees.map((employee) => employee.name));
console.log(employees.toToon());
```

The tagged runtime behaves like a normal JavaScript array or object and keeps
TOON schema/count information synchronized when data is mutated.

### `toonToJson(input: string)`

Parses TOON text into a JavaScript object.

```js
import { toonToJson } from "toonkit2";

const data = toonToJson(`device_id[1]{0:s}:\nDEVICE_PRO_01\n`);
```

### `jsonToToon(obj: any)`

Serializes a JavaScript object into TOON text.

```js
import { jsonToToon } from "toonkit2";

const toon = jsonToToon({ device_id: "DEVICE_PRO_01", battery: 87 });
```

## Fetch client

`toonFetch()` wraps axios with TOON-aware request and response handling.

```js
import { toonFetch } from "toonkit2";

const result = await toonFetch("http://localhost:3000/users", {
  method: "POST",
  data: { employees: [{ id: 1, name: "Ava" }] },
});
```

## Express

Import from `toonkit2/express`.

```js
import express from "express";
import { toon } from "toonkit2/express";

const app = express();
app.use(...toon());

app.post("/devices", (req, res) => {
  res.toon({ ok: true, received: req.toon() });
});
```

## Fastify

Import from `toonkit2/fastify`.

```js
import Fastify from "fastify";
import { toon } from "toonkit2/fastify";

const fastify = Fastify();
await fastify.register(toon);
```

## Hono

Import from `toonkit2/hono`.

```ts
import { Hono } from "hono";
import { toon } from "toonkit2/hono";

const app = new Hono();
app.use("*", toon());
```

## Next.js

Import from `toonkit2/next/server`.

```ts
import { NextRequest } from "next/server";
import { ToonResponse, parseToonRequest } from "toonkit2/next/server";

export async function POST(req: NextRequest) {
  const body = await parseToonRequest(req);
  return ToonResponse.toon({ ok: true, received: body });
}
```

## License

MIT
