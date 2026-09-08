import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };

// Resolves a request path inside `root`, or null if it escapes.
// `req.url` is attacker-controlled, so joining it onto a directory without
// this check is a path traversal: `GET /../../../etc/passwd` would read
// outside the fixture folder.
function safePath(root, url) {
  const raw = url === '/' ? '/index.html' : url.split('?')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null; // malformed percent-encoding
  }
  if (decoded.includes('\0')) return null;

  const target = resolve(root, `.${decoded}`);
  if (target !== root && !target.startsWith(root + sep)) return null;
  return target;
}

export async function startServer(dir) {
  const root = resolve(dir);

  const server = createServer(async (req, res) => {
    const target = safePath(root, req.url);
    if (target === null) {
      res.writeHead(403);
      res.end('forbidden');
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
