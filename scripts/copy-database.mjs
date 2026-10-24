/**
 * Clone a Mongo database into another database on the same cluster.
 *
 * Used when the shop moves to its own database: the live catalogue is copied
 * over, the source database is left untouched.
 *
 *   node scripts\copy-database.mjs "<uri>" <source> <target> [--replace]
 *
 * Without `--replace` the script refuses to write into a target that already
 * holds documents.
 */

import { MongoClient } from "mongodb";

const args = process.argv.slice(2);
const replace = args.includes("--replace");
const positional = args.filter((a) => !a.startsWith("--"));
const [uri, from, to] = positional;

if (!uri || !from || !to) {
  console.error("Usage: node scripts\\copy-database.mjs \"<uri>\" <source> <target> [--replace]");
  process.exit(1);
}
if (from === to) {
  console.error("Source and target are the same database.");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
await client.connect();

const source = client.db(from);
const target = client.db(to);

const existing = await target.listCollections().toArray();
if (existing.length && !replace) {
  console.error(`${to} already holds ${existing.length} collection(s). Use --replace to overwrite.`);
  await client.close();
  process.exit(1);
}
if (existing.length) {
  console.log(`dropping ${existing.length} collection(s) in ${to}`);
  for (const c of existing) await target.collection(c.name).drop();
}

const collections = await source.listCollections().toArray();
for (const c of collections) {
  const docs = await source.collection(c.name).find({}).toArray();
  if (docs.length) await target.collection(c.name).insertMany(docs, { ordered: true });
  console.log(`${from}.${c.name} -> ${to}.${c.name}  (${docs.length} docs)`);
}

console.log("\nTarget contents:");
for (const c of await target.listCollections().toArray()) {
  const n = await target.collection(c.name).countDocuments();
  console.log(`  ${to}.${c.name.padEnd(14)} ${n} docs`);
}

await client.close();
