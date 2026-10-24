/**
 * Brand asset renderer.
 *
 * Draws every raster brand asset on a canvas at its exact pixel size and
 * POSTs the PNG to the local static server, which writes it into
 * `.brand-staging/out/`. Run with the static server on :4321.
 */
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), ".brand-staging");
await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, "out"), { recursive: true });

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>html,body{margin:0;background:#08090a}canvas{display:block}</style>
</head><body>
<script>
const GOLD = "#c9a227";
const GOLD_LIGHT = "#e8c766";
const PAPER = "#f2f3f4";
const PIT = "#08090a";

/* ── The mark: gold chevron + chequered flag corner ─────────────── */
function drawMark(ctx, x, y, size) {
  const u = size / 64;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PIT;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = PAPER;
  ctx.fillRect(32 * u, 0, 16 * u, 16 * u);
  ctx.fillRect(48 * u, 16 * u, 16 * u, 16 * u);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 9 * u;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(11 * u, 13 * u);
  ctx.lineTo(35 * u, 32 * u);
  ctx.lineTo(11 * u, 51 * u);
  ctx.stroke();
  ctx.restore();
}

/* ── Chequered band ──────────────────────────────────────────────── */
function drawChecker(ctx, x, y, w, h, cell) {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) continue;
      ctx.fillStyle = PAPER;
      ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
    }
  }
}

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  document.body.appendChild(c);
  return c;
}

async function save(name, c) {
  const data = c.toDataURL("image/png");
  await fetch("/save?name=" + encodeURIComponent(name), { method: "POST", body: data });
  console.log("saved " + name + " " + c.width + "x" + c.height);
}

/* ── App icons ───────────────────────────────────────────────────── */
function appIcon(size) {
  const c = canvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = PIT;
  ctx.fillRect(0, 0, size, size);
  const m = Math.round(size * 0.76);
  drawMark(ctx, Math.round((size - m) / 2), Math.round((size - m) / 2), m);
  return c;
}

/* ── Wordmark lockup ─────────────────────────────────────────────── */
function wordmark(w, h) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = PIT;
  ctx.fillRect(0, 0, w, h);
  const mark = Math.round(h * 0.66);
  drawMark(ctx, Math.round(w * 0.06), Math.round((h - mark) / 2), mark);
  const size = Math.round(h * 0.46);
  ctx.textBaseline = "middle";
  ctx.font = \`800 \${size}px "Barlow Condensed", sans-serif\`;
  ctx.fillStyle = "#ffffff";
  const startX = Math.round(w * 0.06) + mark + Math.round(w * 0.035);
  const x1 = startX;
  ctx.fillText("ROUILLARD", x1, h / 2 - size * 0.03);
  const w1 = ctx.measureText("ROUILLARD").width;
  ctx.fillStyle = GOLD;
  ctx.fillText("SPORT", x1 + w1 + size * 0.26, h / 2 - size * 0.03);
  return c;
}

/* ── Open graph card ─────────────────────────────────────────────── */
function ogCard(w, h) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = PIT;
  ctx.fillRect(0, 0, w, h);

  // Photo plate with a duotone-ish treatment.
  const photo = new Image();
  const p = new Path2D();
  ctx.save();

  // Draw the photo once loaded (async handled by caller).
  ctx.restore();
  return { c, ctx, photo, p };
}

async function drawOg() {
  const w = 1200, h = 630;
  const c = canvas(w, h);
  const ctx = c.getContext("2d");
  ctx.fillStyle = PIT;
  ctx.fillRect(0, 0, w, h);

  // Background photo
  const img = new Image();
  img.src = "/public/images/editorial/hero-2.jpg";
  await img.decode().catch(() => {});
  if (img.naturalWidth) {
    ctx.save();
    ctx.filter = "saturate(0.75) contrast(1.1)";
    // cover
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  // Scrim
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "rgba(8,9,10,0.97)");
  g.addColorStop(0.45, "rgba(8,9,10,0.86)");
  g.addColorStop(1, "rgba(8,9,10,0.30)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Diagonal speed stripes
  ctx.save();
  ctx.strokeStyle = "rgba(201,162,39,0.07)";
  ctx.lineWidth = 2;
  for (let i = -h; i < w + h; i += 26) {
    ctx.beginPath();
    ctx.moveTo(i, h);
    ctx.lineTo(i + h, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Chequered flag band along the bottom
  drawChecker(ctx, 0, h - 24, w, 24, 24);

  const padX = 84;
  const markSize = 76;
  drawMark(ctx, padX, 92, markSize);

  ctx.textBaseline = "alphabetic";
  ctx.font = '800 68px "Barlow Condensed", sans-serif';
  ctx.fillStyle = "#ffffff";
  ctx.fillText("ROUILLARD", padX + markSize + 22, 92 + 56);
  const w1 = ctx.measureText("ROUILLARD").width;
  ctx.fillStyle = GOLD;
  ctx.fillText("SPORT", padX + markSize + 22 + w1 + 18, 92 + 56);

  // Gold rule
  ctx.fillStyle = GOLD;
  ctx.fillRect(padX, 92 + markSize + 34, 132, 3);

  ctx.font = '600 44px "Barlow Condensed", sans-serif';
  ctx.fillStyle = PAPER;
  ctx.fillText("LA PERFORMANCE SE PRÉPARE", padX, 92 + markSize + 104);
  ctx.fillText("SOUS LE CAPOT.", padX, 92 + markSize + 154);

  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillStyle = "#9aa2ab";
  ctx.fillText("PIÈCES PERFORMANCE  /  DÉCINES-CHARPIEU  /  ROUILLARD-SPORT.COM", padX, h - 58);

  return c;
}

/* ── Run ─────────────────────────────────────────────────────────── */
(async () => {
  await document.fonts.ready;
  await document.fonts.load('800 68px "Barlow Condensed"');
  await document.fonts.load('600 44px "Barlow Condensed"');
  await document.fonts.load('500 15px "JetBrains Mono"');
  await document.fonts.load('800 104px "Barlow Condensed"');

  await save("icon-512.png", appIcon(512));
  await save("icon-192.png", appIcon(192));
  await save("apple-icon.png", appIcon(180));
  await save("icon-96.png", appIcon(96));
  await save("icon-64.png", appIcon(64));
  await save("icon-32.png", appIcon(32));
  await save("wordmark.png", wordmark(900, 200));
  await save("og.png", await drawOg());
  document.title = "done";
})();
</script>
</body></html>`;

await writeFile(join(OUT, "render.html"), html, "utf8");
console.log("render page written to .brand-staging/render.html");
