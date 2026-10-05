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
        assert.deepEqual(core.toonToJson('name[1]{0:s}:\nToon\n'), { name: 'Toon' });
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