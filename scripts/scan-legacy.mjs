import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src"];
const EXTS = new Set([".ts", ".tsx"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (EXTS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/** Classes that no longer exist in the design system. */
const LEGACY = [
  "text-accent",
  "text-ink",
  "text-ink-soft",
  "text-muted-light",
  "bg-accent",
  "bg-alt",
  "border-accent",
  "font-mono",
  "prose-arm",
  "text-graphite",
  "bg-graphite",
  "bg-sky",
  "bg-callout",
];

const ROUNDED = /\brounded(-|\s|"|'|$)/;
const LIGHT_HEX = /(bg|text|border)-\[#(f|fff|e[0-9a-f]|[0-9a-f]{2}[0-9a-f]{0,2}df|ff)/i;
const BLUE = /#(0071e3|0a84ff|1d4ed8|2563eb|3b82f6)/i;

const hits = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, "utf8");
    src.split(/\r?\n/).forEach((line, i) => {
      const problems = [];
      for (const cls of LEGACY) {
        const re = new RegExp(`(?<![\\w-])${cls}(?![\\w-])`);
        if (re.test(line)) problems.push(cls);
      }
      if (ROUNDED.test(line)) problems.push("rounded-*");
      if (LIGHT_HEX.test(line)) problems.push("light hex");
      if (BLUE.test(line)) problems.push("blue");
      if (!problems.length) return;
      hits.push({ file, line: i + 1, problems, text: line.trim() });
    });
  }
}

for (const hit of hits) {
  console.log(`${hit.file}:${hit.line} [${hit.problems.join(", ")}] ${hit.text.slice(0, 150)}`);
}
console.log(`\n${hits.length} line(s) to review`);
