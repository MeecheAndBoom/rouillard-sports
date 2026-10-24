/** One-off: candidates for the Interior category tile (Commons categories). */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const STAGING = join(process.cwd(), ".image-staging", "cat-interior");
const UA = "AtelierRichardMechano/1.0 (site build; contact: sales@atelier-richard-mechano.com)";
const OK_LICENSES = new Set(["cc0", "pdm", "by", "by-sa"]);

const CATS = [
  "Category:Car interiors",
  "Category:Automobile interiors",
  "Category:Car dashboards",
];

const api = "https://commons.wikimedia.org/w/api.php";

async function catFiles(cat, limit = 60) {
  const url = `${api}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmtype=file&cmlimit=${limit}&format=json&origin=*`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${cat}: ${res.status}`);
  const json = await res.json();
  return (json.query?.categorymembers ?? []).map((m) => m.title);
}

async function info(titles) {
  const url = `${api}?action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1600&format=json&origin=*`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ titles: titles.join("|") }),
  });
  if (!res.ok) throw new Error(`info: ${res.status}`);
  const json = await res.json();
  return Object.values(json.query?.pages ?? {});
}

async function main() {
  await mkdir(STAGING, { recursive: true });
  const meta = [];
  let i = 0;

  for (const cat of CATS) {
    if (meta.length >= 5) break;
    const files = await catFiles(cat);
    const pageTitles = files
      .filter((t) => /\.(jpg|jpeg|png)$/i.test(t))
      .slice(0, 40);
    for (let start = 0; start < pageTitles.length && meta.length < 5; start += 20) {
      const batch = pageTitles.slice(start, start + 20);
      let pages;
      try {
        pages = await info(batch);
      } catch (e) {
        console.log("info batch failed:", e.message);
        continue;
      }
      for (const p of pages) {
        if (meta.length >= 5) break;
        const ii = p.imageinfo?.[0];
        if (!ii) continue;
        const em = ii.extmetadata || {};
        const license = (em.LicenseShortName?.value || "").toLowerCase();
        const ok = [...OK_LICENSES].some((l) => license.includes(l));
        if (!ok) continue;
        if ((ii.width || 0) < 1000) continue;
        try {
          const r = await fetch(ii.thumburl || ii.url, { headers: { "User-Agent": UA } });
          if (!r.ok) continue;
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.length < 40_000) continue;
          const file = `c${i}.jpg`;
          await writeFile(join(STAGING, file), buf);
          meta.push({
            file,
            title: p.title.replace(/^File:/, ""),
            artist: (em.Artist?.value || "").replace(/<[^>]*>/g, "").trim(),
            license: em.LicenseShortName?.value || "",
            page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
            cat,
            w: ii.width,
          });
          i++;
        } catch (e) {
          console.log("dl fail:", p.title, e.message);
        }
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  await writeFile(join(STAGING, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(`cat-interior: ${meta.length} candidates`);
  for (const m of meta) console.log(` c${m.file.slice(1)} ${m.title.slice(0, 70)} [${m.license}]`);
}

main();
