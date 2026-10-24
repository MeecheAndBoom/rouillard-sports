/**
 * Minimal static file server used for local visual QA and for rendering the
 * brand plates. `node scripts/static-server.mjs [port] [root]`
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const port = Number(process.argv[2] ?? 4321);
const root = process.argv[3] ?? process.cwd();

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

/** Where POSTed artefacts (brand plates) are written. */
const SAVE_DIR = join(root, ".brand-staging", "out");

createServer(async (req, res) => {
  // Save endpoint: the brand renderer POSTs a base64 PNG here.
  if (req.method === "POST" && (req.url ?? "").startsWith("/save")) {
    try {
      const name = new URL(req.url, "http://x").searchParams.get("name") ?? "out.png";
      const body = await readFile(req);
      const b64 = body.toString("utf8").replace(/^data:image\/\w+;base64,/, "");
      await mkdir(SAVE_DIR, { recursive: true });
      await writeFile(join(SAVE_DIR, name), Buffer.from(b64, "base64"));
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("saved");
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
    return;
  }

  try {
    let file = join(root, decodeURIComponent((req.url ?? "/").split("?")[0]));
    if (file.endsWith("/")) file += "index.html";
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(port, () => console.log(`static server on http://localhost:${port} (root: ${root})`));
