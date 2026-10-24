/** One-off: prints each page's status + unique <img src> values from the SSR HTML. */
const pages = ["/", "/about", "/contact", "/testimonials", "/blog", "/shop", "/why-buy-from-us"];
for (const p of pages) {
  const res = await fetch("http://localhost:3000" + p);
  const html = await res.text();
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  console.log(p, res.status, JSON.stringify([...new Set(imgs)]));
}
