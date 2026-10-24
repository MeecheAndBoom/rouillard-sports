/**
 * One-shot migration pass: rewrite legacy light-surface and rounded classes
 * onto the Rouillard Sport dark, square design system.
 *
 * Idempotent: running it twice produces the same output.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = join(process.cwd(), "src");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if ([".tsx", ".ts"].includes(extname(entry.name))) yield path;
  }
}

const EXACT = [
  ["bg-[#fdeeee]", "bg-danger/10"],
  ["bg-[#eaf6ee]", "bg-success/10"],
  ["bg-[#fff4e6]", "bg-warning/10"],
  ["bg-[#f0f6ff]", "bg-gold/10"],
  ["text-[#f5a623]", "text-gold"],
  ["bg-white/95", "bg-panel/95"],
  ["bg-white/90", "bg-panel/90"],
  ["bg-white/85", "bg-panel/90"],
  ["bg-white/80", "bg-panel/85"],
  ["bg-white/70", "bg-panel/80"],
  ["bg-white/65", "bg-panel/75"],
  ["bg-white/60", "bg-panel/70"],
  ["bg-white/55", "bg-panel/65"],
  ["bg-white/40", "bg-panel/60"],
  ["bg-white/30", "bg-panel/70"],
  ["bg-white/25", "bg-panel/70"],
  ["bg-white/20", "bg-panel/70"],
  ["bg-white/15", "bg-panel/75"],
  ["bg-white/10", "bg-panel/80"],
  ["bg-white/5", "bg-panel/85"],
  ["bg-white", "bg-panel"],
  ["text-white/90", "text-paper"],
  ["text-white/85", "text-paper"],
  ["text-white/80", "text-paper"],
  ["text-white/75", "text-paper"],
  ["text-white/70", "text-paper"],
  ["text-white/60", "text-muted"],
  ["text-white/55", "text-muted"],
  ["text-white/50", "text-muted"],
  ["text-white/45", "text-muted"],
  ["border-white/40", "border-line"],
  ["border-white/30", "border-line"],
  ["border-white/25", "border-line"],
  ["border-white/20", "border-line"],
  ["border-white/15", "border-line"],
  ["border-white/10", "border-line-soft"],
];

const PATTERNS = [
  [/rounded-\[[^\]]+\]/g, ""],
  [/rounded-full/g, ""],
  [/\brounded-(pill|card|box|sm|md|lg|xl|2xl|3xl|4xl|none)\b/g, ""],
];

let changed = 0;

for await (const file of walk(ROOT)) {
  const before = await readFile(file, "utf8");
  let after = before;

  for (const [from, to] of EXACT) {
    after = after.split(from).join(to);
  }
  for (const [pattern, replacement] of PATTERNS) {
    after = after.replace(pattern, replacement);
  }

  // Collapse the double spaces that class removal can leave behind.
  after = after.replace(/className="([^"]*)"/g, (match, value) => {
    const cleaned = value.replace(/\s{2,}/g, " ").trim();
    return `className="${cleaned}"`;
  });

  if (after !== before) {
    await writeFile(file, after, "utf8");
    changed += 1;
    console.log("updated", file.replace(ROOT, "src"));
  }
}

console.log(`\n${changed} files updated`);
