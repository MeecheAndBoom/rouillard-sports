import { promises as fs } from "fs";
import path from "path";

/**
 * Local JSON store — the no-database fallback (mirrors the reference
 * project's data/*.json pattern). Every write is best-effort: a read-only
 * deployment simply keeps serving the seed data.
 */
const DATA_DIR = path.join(process.cwd(), "data");

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(name: string, value: T): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, `${name}.json`),
      JSON.stringify(value, null, 2),
      "utf8",
    );
    return true;
  } catch {
    return false;
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}
