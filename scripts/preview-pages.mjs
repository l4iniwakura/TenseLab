import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/pages/', import.meta.url));
const port = Number(process.argv[2] ?? 4184);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/TenseLab/')) { response.writeHead(404).end(); return; }
    let relative = pathname.slice('/TenseLab/'.length);
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(resolve(root) + sep)) { response.writeHead(403).end(); return; }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(content);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Pages preview: http://127.0.0.1:${port}/TenseLab/`));
