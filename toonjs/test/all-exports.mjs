import assert from 'node:assert/strict';

const distBase = new URL('../dist/', import.meta.url);

async function load(modulePath) {
  return import(new URL(modulePath, distBase));
}

function isFn(value) {
  return typeof value === 'function';
}

function makeHeaders(init = {}) {
  return new Headers(init);
}

function makeRequest(body, headers = {}) {
  return {
    body,
    headers: makeHeaders(headers),
    clone(overrides = {}) {
      return {
        ...this,
        ...overrides,
        headers: overrides.headers || this.headers,
      };
    },
  };
}

function makeResponseStub() {
  return {
    contentType: null,
    sent: null,
    type(value) {
      this.contentType = value;
      return this;
    },
    send(payload) {
      this.sent = payload;
      return this;
    },
  };
}

function makeFastifyStub() {
  const stub = {
    requestDecorator: null,
    responseDecorator: null,
    parserTypes: null,
    parserOptions: null,
    parserHandler: null,
    decorateRequest(name, fn) {
      this.requestDecorator = fn;
      this.requestDecoratorName = name;
    },
    decorateReply(name, fn) {
      this.responseDecorator = fn;
      this.responseDecoratorName = name;
    },
    addContentTypeParser(types, options, handler) {
      this.parserTypes = types;
      this.parserOptions = options;
      this.parserHandler = handler;
    },
  };

  return stub;
}

function makeHonoContext(reqText) {
  return {
    req: {
      text: async () => reqText,
    },
    text(payload, status, headers) {
      return new Response(payload, { status, headers });
    },
  };
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

async function main() {
  const core = await load('index.js');
  const fetchMod = await load('fetch/index.js');
  const expressMod = await load('express/index.js');
  const fastifyMod = await load('fastify/index.js');
  const honoMod = await load('hono/index.js');
  const nextServerMod = await load('next/server.js');

  const tests = [
    {
      name: 'core parser handles primitives and arrays',
      fn: async () => {
        assert.equal(core.safeParse('{"ok":true}').ok, true);
        assert.equal(core.safeParse('plain text'), 'plain text');
        assert.equal(typeof core.toon, 'function');
        assert.equal(typeof core.toon.toToon, 'function');
        assert.equal(typeof core.toon.toJSON, 'function');
        assert.equal(typeof core.toon.clone, 'function');
        assert.equal(typeof core.toon.equals, 'function');
        assert.equal(core.toon.version(), '2.5.1');
        assert.deepEqual(core.toonToJson('name[1]{0:s}:\nToon\n'), { name: 'Toon' });
        assert.deepEqual(core.toonToJson(`number[1]{0:n}:
36.7
active[1]{0:b}:
true
empty[1]{0:nl}:
null
object[1]{0:j}:
{"a":1}
array[1]{0:a}:
[1,"a",true]
timestamp[1]{0:td}:
03042026120000
`), {
          number: 36.7,
          active: true,
          empty: null,
          object: { a: 1 },
          array: [1, 'a', true],
          timestamp: '03042026120000',
        });
        assert.match(core.jsonToToon({ active: true }), /active\[1\]\{0:b\}:/);
        assert.doesNotMatch(core.jsonToToon({
          tags: ['toon', 'json', 'fast'],
          matrix: [[1, 2], [3, 4]],
        }), /\n\s*\n/);

        const nested = `employees[2]{id:n,name:s,salary:a,active:b}:
1,Riya,"[6565,65656,56565,6656]",true
2,Anu,"[10,20]",false
`;

        assert.deepEqual(core.toonToJson(nested), {
          employees: [
            { id: 1, name: 'Riya', salary: [6565, 65656, 56565, 6656], active: true },
            { id: 2, name: 'Anu', salary: [10, 20], active: false },
          ],
        });

        assert.deepEqual(core.toonToJson(core.jsonToToon({
          employees: [
            { id: 1, name: 'Riya', salary: [6565, 65656, 56565, 6656], active: true },
          ],
        })), {
          employees: [
            { id: 1, name: 'Riya', salary: [6565, 65656, 56565, 6656], active: true },
          ],
        });

        const salary = 100000;
        const employees = core.toon`
employees[2]{id:n,name:s,salary:n,active:b}:
1,Riya,90000,true
2,John,80000,false
`;
        assert.equal(Array.isArray(employees), true);
        assert.equal(employees[0].name, 'Riya');
        employees[0].salary = 95000;
        employees.push({ id: 3, name: 'Manoj', salary, active: true });
        assert.match(employees.toToon(), /employees\[3\]\{id:n,name:s,salary:n,active:b\}/);
        assert.match(employees.toToon(), /3,Manoj,100000,true/);
        assert.deepEqual(employees.toJSON(), employees);
        assert.equal(employees instanceof Array, true);
        assert.deepEqual(employees.map((employee) => employee.name), ['Riya', 'John', 'Manoj']);
        assert.equal(employees.find((employee) => employee.id === 2).name, 'John');
        assert.equal(employees.reduce((total, employee) => total + employee.salary, 0), 275000);
        assert.deepEqual(Object.keys(employees[0]), ['id', 'name', 'salary', 'active']);
        const [first] = employees;
        assert.equal(first.name, 'Riya');
        assert.deepEqual(JSON.parse(JSON.stringify(employees[0])), employees[0]);
        employees.splice(2, 1);
        assert.match(core.toon.toToon(employees), /employees\[2\]/);
        assert.deepEqual(core.toon.toJSON(employees[0]), employees[0]);

        const interpolated = core.toon`
employees[1]{id:n,name:s,salary:n}:
1,Riya,${salary}
`;
        assert.equal(interpolated[0].salary, 100000);
        assert.deepEqual(core.toon.clone(employees[0]), employees[0]);
        assert.equal(core.toon.equals({ a: 1 }, { a: 1 }), true);

        const user = core.toon`
user:
name: Manoj
age: 24
active: true
`;
        assert.equal(user.name, 'Manoj');
        user.name = 'Riya';
        assert.match(user.toToon(), /user:\n  name: Riya/);
        assert.equal('name' in user, true);
        assert.deepEqual(Object.entries(user).map(([key]) => key), ['name', 'age', 'active']);
        assert.equal(core.toon.equals(core.toon.clone(user), user), true);
      },
    },
    {
      name: 'fetch wrapper works without configuration',
      fn: async () => {
        const originalAdapter = fetchMod.toonAxios.defaults.adapter;
        const originalBaseURL = fetchMod.toonAxios.defaults.baseURL;
        const originalHeaders = { ...(fetchMod.toonAxios.defaults.headers.common || {}) };
        const calls = [];

        try {
          fetchMod.toonAxios.defaults.adapter = async (config) => {
            calls.push(config);

            return {
              data: 'users[1]{0:s}:\nMina\n',
              status: 200,
              statusText: 'OK',
              headers: { 'content-type': 'application/toon' },
              config,
              request: {},
            };
          };

          const result = await fetchMod.toonFetch('http://localhost:3000/users');

          assert.equal(calls.length, 1);
          assert.equal(calls[0].url, 'http://localhost:3000/users');
          assert.deepEqual(result.data, { users: 'Mina' });
          assert.equal(result.response.status, 200);
          assert.equal(result.response.ok, true);
        } finally {
          fetchMod.toonAxios.defaults.adapter = originalAdapter;
          fetchMod.toonAxios.defaults.baseURL = originalBaseURL;
          fetchMod.toonAxios.defaults.headers.common = originalHeaders;
        }
      },
    },
    {
      name: 'fetch client configuration helpers work',
      fn: async () => {
        const configured = fetchMod.configureToonFetch({
          baseURL: 'https://example.test',
          token: 'abc',
          headers: { 'x-client': 'test' },
        });
        assert.equal(configured.defaults.baseURL, 'https://example.test');
        assert.equal(configured.defaults.headers.common.Authorization, 'Bearer abc');
        assert.equal(configured.defaults.headers.common['x-client'], 'test');

        const isolated = fetchMod.createToonAxios({
          baseURL: 'https://isolated.test',
          token: 'xyz',
        });
        assert.equal(isolated.defaults.baseURL, 'https://isolated.test');
        assert.equal(isolated.defaults.headers.common.Authorization, 'Bearer xyz');
      },
    },
    {
      name: 'fetch client serializes documented request formats',
      fn: async () => {
        const originalAdapter = fetchMod.toonAxios.defaults.adapter;
        const calls = [];
        try {
          fetchMod.toonAxios.defaults.adapter = async (config) => {
            calls.push(config);
            return {
              data: 'ok[1]{0:b}:\ntrue\n',
              status: 200,
              statusText: 'OK',
              headers: { 'content-type': 'application/toon' },
              config,
              request: {},
            };
          };

          await fetchMod.toonFetch('http://example.test/toon', {
            method: 'POST',
            data: { active: true },
          });
          assert.match(String(calls[0].data), /active\[1\]\{0:b\}/);
          assert.equal(calls[0].headers['Content-Type'], 'application/toon');

          await fetchMod.toonFetch('http://example.test/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { active: true },
          });
          assert.equal(calls[1].data, '{"active":true}');
          assert.equal(calls[1].headers['Content-Type'], 'application/json');
        } finally {
          fetchMod.toonAxios.defaults.adapter = originalAdapter;
        }
      },
    },
    {
      name: 'documented adapter helper exports and formats work',
      fn: async () => {
        assert.equal(isFn(expressMod.toon), true);
        assert.equal(isFn(expressMod.createCompressionMiddleware), true);
        assert.equal(isFn(expressMod.createTextMiddleware), true);
        assert.equal(expressMod.createCompressionMiddleware(false), null);
        assert.equal(expressMod.createTextMiddleware(false), null);
        assert.equal(Array.isArray(expressMod.toon({ compression: false, text: false })), true);

        const fastify = makeFastifyStub();
        await fastifyMod.toon(fastify);
        let parsedFastify;
        fastify.parserHandler({}, 'item[1]{0:n}:\n42\n', (_error, value) => {
          parsedFastify = value;
        });
        assert.deepEqual(parsedFastify, { item: 42 });

        const honoJson = makeHonoContext('{"ok":true}');
        await honoMod.toon()(honoJson, async () => {});
        assert.deepEqual(await honoJson.req.toon(), { ok: true });
        const honoResponse = honoJson.toon('already toon');
        assert.equal(await honoResponse.text(), 'already toon');
      },
    },
    {
      name: 'express entrypoint remains functional',
      fn: async () => {
        assert.equal(isFn(expressMod.createRequestMiddleware), true);
        assert.equal(isFn(expressMod.createResponseMiddleware), true);

        const req = makeRequest('user[1]{0:s}:\nMina\n');
        const res = makeResponseStub();

        expressMod.createRequestMiddleware()(req, {}, () => {});
        expressMod.createResponseMiddleware()({}, res, () => {});

        assert.deepEqual(req.body, { user: 'Mina' });
        res.toon({ ok: true });
        assert.equal(res.sent, core.jsonToToon({ ok: true }));
      },
    },
    {
      name: 'fastify plugin remains installable',
      fn: async () => {
        assert.equal(isFn(fastifyMod.toon), true);

        const fastify = makeFastifyStub();
        await fastifyMod.toon(fastify);

        assert.equal(fastify.requestDecoratorName, 'toon');
        assert.equal(fastify.responseDecoratorName, 'toon');
      },
    },
    {
      name: 'hono entrypoint wires request and response helpers',
      fn: async () => {
        assert.equal(isFn(honoMod.toon), true);

        const context = makeHonoContext('item[1]{0:s}:\nvalue\n');
        let nextCalled = false;

        await honoMod.toon()(context, async () => {
          nextCalled = true;
        });

        assert.equal(nextCalled, true);
        assert.deepEqual(await context.req.toon(), { item: 'value' });
        assert.equal(context.toon({ demo: 'yes' }).headers.get('content-type'), 'text/plain; charset=utf-8');
      },
    },
    {
      name: 'next server entrypoint creates TOON responses and parses requests',
      fn: async () => {
        assert.equal(isFn(nextServerMod.parseToonRequest), true);
        assert.equal(isFn(nextServerMod.ToonResponse.toon), true);

        const response = nextServerMod.ToonResponse.toon({ greeting: 'hi' }, { status: 201 });
        assert.equal(response.status, 201);
        assert.equal(response.headers.get('content-type'), 'application/toon');

        const toonRequest = new Request('https://example.test', {
          method: 'POST',
          headers: { 'content-type': 'application/toon' },
          body: core.jsonToToon({ hello: 'world' }),
        });

        assert.deepEqual(await nextServerMod.parseToonRequest(toonRequest), { hello: 'world' });

        const jsonRequest = new Request('https://example.test', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{"hello":"json"}',
        });
        assert.deepEqual(await nextServerMod.parseToonRequest(jsonRequest), { hello: 'json' });
        assert.equal(
          await nextServerMod.ToonResponse.toon('raw').text(),
          '0[1]{0:s}:\nr\n1[1]{0:s}:\na\n2[1]{0:s}:\nw'
        );
      },
    },
  ];

  for (const test of tests) {
    await runTest(test.name, test.fn);
  }

  console.log(`\n${tests.length} test(s) passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});