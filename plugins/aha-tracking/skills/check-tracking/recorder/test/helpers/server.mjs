import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };

export async function startServer(dir) {
  const server = createServer(async (req, res) => {
    const name = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    try {
      const body = await readFile(join(dir, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'text/plain' });
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
