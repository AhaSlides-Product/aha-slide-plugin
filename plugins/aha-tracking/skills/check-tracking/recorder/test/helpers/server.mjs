import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, resolve, join, posix } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };

// Walks `root` once and returns a Map of "/request/path" -> absolute file path.
async function indexFiles(root, prefix = '') {
  const files = new Map();
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const abs = join(root, entry.name);
    const key = posix.join('/', prefix, entry.name);
    if (entry.isDirectory()) {
      for (const [k, v] of await indexFiles(abs, posix.join(prefix, entry.name))) {
        files.set(k, v);
      }
    } else if (entry.isFile()) {
      files.set(key, abs);
    }
  }
  return files;
}

export async function startServer(dir) {
  // The served paths are derived from a directory listing, never from the
  // request. `req.url` only ever selects a key in this map, so no attacker
  // input reaches readFile — a request for `/../../etc/passwd` simply misses.
  const files = await indexFiles(resolve(dir));

  const server = createServer(async (req, res) => {
    const raw = (req.url ?? '/').split('?')[0];
    let key;
    try {
      key = decodeURIComponent(raw);
    } catch {
      key = raw; // malformed encoding: cannot match a real key, so it 404s
    }
    if (key === '/') key = '/index.html';

    const target = files.get(key);
    if (!target) {
      res.writeHead(404);
      res.end('not found');
      return;
    }

    try {
      const body = await readFile(target);
      res.writeHead(200, { 'content-type': TYPES[extname(target)] ?? 'text/plain' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}
