import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 4178);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const requested = normalize(pathname === "/" ? "index.html" : pathname.replace(/^\/+/, ""));
  const path = join(root, requested);
  if (!path.startsWith(root)) { response.writeHead(403).end("Forbidden"); return; }
  try {
    if (!(await stat(path)).isFile()) throw new Error("Not a file");
    response.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'" });
    response.end(await readFile(path));
  } catch { response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found"); }
}).listen(port, "127.0.0.1", () => process.stdout.write(`Marginalia listening on http://127.0.0.1:${port}\n`));
