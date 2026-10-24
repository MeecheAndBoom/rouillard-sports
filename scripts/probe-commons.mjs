/**
 * Diagnostic: probe candidate Commons categories/searches for a slot and
 * report what survives the filter, so slot definitions can be tuned.
 */
const UA = "RouillardSport/1.0 (site build; contact: contact@rouillard-sport.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(params) {
  const res = await fetch("https://commons.wikimedia.org/w/api.php?format=json&origin=*&" + params, {
    headers: { "user-agent": UA },
  });
  if (!res.ok) throw new Error(`commons ${res.status}`);
  await sleep(300);
  return res.json();
}

const probes = process.argv.slice(2);

for (const probe of probes) {
  const isCat = probe.startsWith("cat:");
  const q = isCat ? probe.slice(4) : probe;
  const params = isCat
    ? "action=query&generator=categorymembers&gcmtitle=" + encodeURIComponent(q) +
      "&gcmtype=file&gcmlimit=40&prop=imageinfo&iiprop=url%7Csize%7Cmime"
    : "action=query&generator=search&gsrsearch=" + encodeURIComponent(q) +
      "&gsrnamespace=6&gsrlimit=40&prop=imageinfo&iiprop=url%7Csize%7Cmime";
  try {
    const data = await call(params);
    const pages = Object.values(data.query?.pages ?? {});
    console.log(`\n### ${probe}  -> ${pages.length} files`);
    for (const p of pages.slice(0, 14)) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      console.log(`   ${ii.width}x${ii.height}  ${p.title.replace(/^File:/, "").slice(0, 80)}`);
    }
  } catch (e) {
    console.log(`\n### ${probe}  -> FAIL ${e.message}`);
  }
}
