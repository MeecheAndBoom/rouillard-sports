import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src", "scripts"];
const EXTS = new Set([".ts", ".tsx", ".mjs", ".js"]);

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

/** Strip line comments and block comments so only code/string content is left. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

let hits = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, "utf8");
    const code = stripComments(src);
    const lines = code.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (!/[\u2014\u2013]/.test(line)) return;
      hits += 1;
      console.log(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
}
console.log(`\n${hits} code line(s) with a dash`);
