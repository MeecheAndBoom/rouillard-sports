/** Identifies c0.jpg by byte-length: re-downloads candidate thumbs, matches size. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const UA = "AtelierRichardMechano/1.0 (site build; contact: sales@atelier-richard-mechano.com)";
const OK = ["cc0", "pdm", "by", "by-sa"];
const api = "https://commons.wikimedia.org/w/api.php";
const target = (await readFile(join(process.cwd(), ".image-staging", "cat-interior", "c0.jpg"))).length;
console.log("target bytes:", target);

const cats = ["Category:Car interiors", "Category:Automobile interiors", "Category:Car dashboards"];
for (const cat of cats) {
  const url =
    api +
    "?action=query&list=categorymembers&cmtitle=" +
    encodeURIComponent(cat) +
    "&cmtype=file&cmlimit=60&format=json&origin=*";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const json = await res.json();
  const files = (json.query?.categorymembers ?? [])
    .map((m) => m.title)
    .filter((t) => /\.(jpg|jpeg|png)$/i.test(t))
    .slice(0, 40);
  for (let start = 0; start < files.length; start += 20) {
    const batch = files.slice(start, start + 20);
    const iurl = `${api}?action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1600&format=json&origin=*`;
    const r2 = await fetch(iurl, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ titles: batch.join("|") }),
    });
    const j2 = await r2.json();
    for (const p of Object.values(j2.query?.pages ?? {})) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const em = ii.extmetadata || {};
      const lic = (em.LicenseShortName?.value || "").toLowerCase();
      if (!OK.some((l) => lic.includes(l))) continue;
      if ((ii.width || 0) < 1000) continue;
      const u = ii.thumburl || ii.url;
      try {
        const r = await fetch(u, { headers: { "User-Agent": UA } });
        if (!r.ok) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length === target) {
          console.log(
            "MATCH →",
            cat,
            "|",
            p.title,
            "|",
            (em.Artist?.value || "").replace(/<[^>]*>/g, "").trim(),
            "|",
            em.LicenseShortName?.value,
            "|",
            u,
          );
          process.exit(0);
        }
      } catch {}
    }
  }
}
console.log("no match found");
