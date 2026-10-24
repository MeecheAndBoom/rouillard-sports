/**
 * Probe: list Commons Category-namespace titles matching a term, so slot
 * definitions can point at categories that actually exist.
 */
const UA = "RouillardSport/1.0 (site build; contact: contact@rouillard-sport.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(params) {
  const res = await fetch("https://commons.wikimedia.org/w/api.php?format=json&origin=*&" + params, {
    headers: { "user-agent": UA },
  });
  if (!res.ok) throw new Error(`commons ${res.status}`);
  await sleep(250);
  return res.json();
}

for (const term of process.argv.slice(2)) {
  const data = await call(
    "action=query&list=search&srsearch=" + encodeURIComponent(term) +
      "&srnamespace=14&srlimit=30",
  );
  console.log(`\n### ${term}`);
  for (const r of data.query?.search ?? []) console.log("   " + r.title);
}
