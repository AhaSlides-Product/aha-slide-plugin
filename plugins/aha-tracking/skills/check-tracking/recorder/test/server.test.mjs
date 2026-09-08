import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { startServer } from './helpers/server.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

let server;
before(async () => {
  server = await startServer(join(HERE, 'fixtures'));
});
after(async () => {
  await server?.close();
});

// Raw socket request: fetch() and most clients normalise `..` out of the path
// before it reaches the server, which would hide the traversal entirely.
function rawGet(base, path) {
  const { hostname, port } = new URL(base);
  return new Promise((resolveResult, reject) => {
    import('node:net').then(({ connect }) => {
      const socket = connect(Number(port), hostname, () => {
        socket.write(`GET ${path} HTTP/1.1\r\nHost: ${hostname}\r\nConnection: close\r\n\r\n`);
      });
      let data = '';
      socket.setEncoding('utf8');
      socket.on('data', (chunk) => { data += chunk; });
      socket.on('end', () => resolveResult(data));
      socket.on('error', reject);
    });
  });
}

test('serves a fixture from inside the root', async () => {
  const res = await rawGet(server.url, '/beacon.html');
  assert.match(res, /^HTTP\/1\.1 200/);
  assert.match(res, /beacon fixture/);
});

test('refuses a traversal that escapes the root', async () => {
  const res = await rawGet(server.url, '/../../../../../../etc/passwd');
  assert.match(res, /^HTTP\/1\.1 403/, 'traversal must be refused, not served');
  assert.ok(!res.includes('root:'), 'no /etc/passwd content may leak');
});

test('refuses a percent-encoded traversal', async () => {
  const res = await rawGet(server.url, '/%2e%2e/%2e%2e/%2e%2e/etc/passwd');
  assert.match(res, /^HTTP\/1\.1 403/);
});

test('refuses malformed percent-encoding', async () => {
  const res = await rawGet(server.url, '/%zz');
  assert.match(res, /^HTTP\/1\.1 403/);
});

test('a missing file inside the root is 404, not 403', async () => {
  const res = await rawGet(server.url, '/nope.html');
  assert.match(res, /^HTTP\/1\.1 404/);
});
