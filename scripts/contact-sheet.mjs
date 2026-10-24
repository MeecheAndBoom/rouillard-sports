/**
 * Builds a single HTML contact sheet of every staged image so the whole
 * racing photo set can be reviewed in one screenshot.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const STAGING = join(process.cwd(), ".image-staging");
const OUT = join(process.cwd(), ".image-staging", "_sheet.html");

const slots = (await readdir(STAGING, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name)
  .sort();

let html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  body{background:#0b0c0d;color:#e8e9ea;font:12px/1.4 system-ui,Segoe UI,sans-serif;margin:0;padding:14px}
  h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c9a227;margin:16px 0 6px;border-bottom:1px solid #2a2e34;padding-bottom:4px}
  .row{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
  figure{margin:0;position:relative}
  img{width:100%;height:120px;object-fit:cover;display:block;background:#15181b}
  figcaption{position:absolute;left:0;bottom:0;right:0;background:rgba(0,0,0,.72);font-size:9px;padding:2px 4px;color:#c9a227;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style></head><body>`;

for (const slot of slots) {
  const dir = join(STAGING, slot);
  const files = (await readdir(dir)).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  if (!files.length) continue;
  let meta = [];
  try {
    meta = JSON.parse(await readFile(join(dir, "meta.json"), "utf8"));
  } catch {}
  html += `<h2>${slot} (${files.length})</h2><div class="row">`;
  for (const f of files) {
    const m = meta.find((x) => x.file === f);
    const cap = m ? `${f} · ${m.width}x${m.height} · ${m.license}` : f;
    html += `<figure><img src="${encodeURIComponent(slot + "/" + f)}" alt=""><figcaption>${cap}</figcaption></figure>`;
  }
  html += `</div>`;
}
html += `</body></html>`;

await writeFile(OUT, html, "utf8");
console.log("sheet:", OUT);
