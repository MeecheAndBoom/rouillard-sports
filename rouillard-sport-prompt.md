# Rouillard Sport — Master Build Spec

The single source of truth for what this repository is and how new work is
written. Read `docs/DESIGN-SYSTEM.md` and `docs/PAGE-PATTERN.md` before
touching any page, and `docs/BILINGUAL.md` before touching any copy.

---

## 1. Project identity

| | |
| --- | --- |
| Company | **Rouillard Sport** |
| Industry | Motorsport spare parts: new, reconditioned and second-hand race components |
| Origin | 14 Rue de la Vitrine, 69150 Décines-Charpieu, France |
| Phone | +33 4 72 84 09 63 |
| Contact | contact@rouillard-sport.com |
| Admin | admin@rouillard-sport.com |
| URL | https://www.rouillard-sport.com |
| Currency | EUR |
| Languages | French (default) and English, cookie `rs-locale`, no URL prefixes |

The promise: every part is checked on the bench before it ships, and the
catalogue tells you exactly what fits what.

## 2. Design read

A **pit-lane parts house**, not a lifestyle store. Carbon-black surfaces, one
gold accent, white markings, chequered-flag bands, telemetry mono for every
number. Technical, fast, precise, French workshop.

Dials: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 6`, `VISUAL_DENSITY 6`.

### Non-negotiables

| Rule | Detail |
| --- | --- |
| One theme | The site is dark from top to bottom. No section inverts to white. |
| One accent | Gold `#c9a227`. Never blue, purple, teal or red. Status colours only for status. |
| One shape | Square. `border-radius: 0` on every chip, button, card and input. |
| No eyebrows | Never a small uppercase label above a heading. The heading speaks alone. |
| No em-dash | Visible copy never contains `—` or `–`. Use a period, comma, colon or hyphen. |
| No decorative dots | No coloured dot before a nav item, badge or list row. Use a Font Awesome glyph. |
| One mid dot | At most one `·` per line. Prefer hairlines and columns. |
| Icons | Font Awesome 7 only (`fa-solid`, `fa-regular`). The brand mark is the sole exception. |
| Imagery | Real photography from `public/images/**`. No div-built fake UI. |
| Numbers | Prices, quantities, references, counts in `.font-mono-num`. |
| i18n | Every visible string comes from `t.*`. Never hardcode French or English copy. |

### Tokens

```
pit       #08090a    page ground
asphalt   #0e1012    alternating band
panel     #14171a    card
panel-2   #1b1f23    raised / inset
line      #2a2e34    hairline
line-soft #1a1d21    quiet divider

paper      #f2f3f4   primary text
muted      #9aa2ab   secondary text
muted-dim  #7b838d   tertiary text / placeholders

gold       #c9a227   accent, links, primary CTA
gold-light #e8c766   hover / emphasis
gold-dark  #8c6e14   deep gold
gold-ink   #0a0b0c   text on gold

success #46b95c   warning #d29922   danger #ff5f52
```

### Type

- `--font-display` → Barlow Condensed 600/700/800. All headings uppercase.
- `--font-body` → Barlow 400/500/600/700.
- `--font-mono` → JetBrains Mono for part numbers, prices, references.

## 3. Stack

Next.js 16.4.0 (App Router) · React 19.3.0 · TypeScript ^5 · Tailwind CSS v4
(`@tailwindcss/turbopack`) · Mongoose ^9 · Cloudinary ^2 · Nodemailer ^10 +
React Email · jose (JWT session) · bcryptjs · zod ^4 · zustand ^5 · motion ^14 ·
Font Awesome ^7. No other UI libraries, no other icon sets, no CSS frameworks
besides Tailwind.

## 4. Architecture

```
src/
  app/
    (site)/        public storefront (route group, owns the site chrome)
    admin/         back office, English by design
    api/           search, auth probe, cloudinary upload, proof files
  components/
    site/          header, footer, logo, cookie consent, chat, search
    ui/            buttons, cards, forms, accordion, rails, reveal
    admin/         admin shell primitives
    i18n/          locale provider + language toggle
  lib/
    i18n/          dictionaries (fr.ts is the source of truth, en.ts mirrors it)
    models/        mongoose schemas (Blog, Category, Order, Product, Admin, Review, Settings)
    consent.ts     cookie-consent external store (useSyncExternalStore)
  emails/          React Email shell + transactional templates
  store/           zustand stores (cart, shop view)
scripts/           image assembly, dash sweep, legacy sweep, palette check
```

### Data layer

MongoDB when `MONGODB_URI` is set, otherwise a local JSON fallback in `data/`
(`data/products.json`, `data/blog.json`, `data/orders.json`, …). The fallback
means a fresh clone boots with a seeded catalogue and no database.

### Server boundaries

- Server Components for pages and data access.
- Server Actions in `src/actions/` for forms (order placement, review, enquiry,
  newsletter, affiliate signup).
- Route handlers only for: type-ahead search, session probe, uploads, proof
  files.

### Auth

JWT session in an httpOnly `rs-admin` cookie (jose). The `Admin` collection
wins over the `ADMIN_EMAIL` / `ADMIN_PASSWORD` bootstrap once a record exists.
`AdminGuard` probes `/api/auth/me` and redirects to `/admin/login`.

## 5. Catalogue model

- 14 categories: Brakes, Suspension, Engine, Transmission, Exhaust, Aero,
  Cooling, Electronics, Safety, Wheels, Tires, Fluids, Interior, Tools.
- Conditions: `new`, `refurb`, `used`.
- Taxonomies: category, make, brand, model (`TAXONOMY_TYPES`).
- A part carries reference, OE cross-references, fitment (make / model / year),
  condition, stock, price, images, specs, features, warranty.
- Order references use the `RS-` prefix, for example `RS-4KD2X9`.
- Blog categories include the workshop topic label *Atelier* (a topic, not the
  brand).

## 6. Payment-proof flow

The customer places an order, pays by transfer, then either waits for the
instructions email or uploads a proof image (JPG / PNG / WebP, 10 MB max) from
`/track` using the order reference and their email.

1. `proofMethod: email | upload` is stored on the order.
2. An admin notice email fires; the dashboard proof queue shows the file.
3. Approve moves the order to **Payment received**.
4. Reject returns it to **Awaiting payment proof** with the stated reason and
   emails the customer.

Without Cloudinary, proofs land in `data/proofs/` and are served by
`/api/proofs/[ref]/[file]`.

## 7. Order statuses

```
Placed → Awaiting Payment → Payment Pending → Awaiting Payment Proof
       → Payment Proof Submitted → Payment Received → Preparing
       → Ready for Pickup → Out for Delivery → Completed
                                                 ↘ Cancelled
```

The status drives the `Pill` tone through `STATUS_TONE` in
`src/app/admin/orders/tone.ts`.

## 8. Routes

**Storefront** — `/`, `/shop`, `/shop/[slug]`, `/browse` and `/catalog` (aliases
to `/shop`), `/cart`, `/checkout`, `/checkout/success/[ref]`, `/track`,
`/blog`, `/blog/[slug]`, `/guides/*`, `/tools/*`, `/about`,
`/why-buy-from-us`, `/first-time-buyers`, `/resources`, `/help`, `/contact`,
`/retrieve-quote`, `/affiliate-program`, `/testimonials`, `/legal/[slug]`,
`/sitemap`.

**Back office** — `/admin`, `/admin/orders`, `/admin/orders/[ref]`,
`/admin/products`, `/admin/products/[slug]`, `/admin/products/new`,
`/admin/blog`, `/admin/blog/[slug]`, `/admin/blog/new`, `/admin/categories`,
`/admin/categories/[id]`, `/admin/categories/new`, `/admin/reviews`,
`/admin/enquiries`, `/admin/settings`, `/admin/login`.

**API** — `/api/search`, `/api/auth/me`, `/api/cloudinary/upload`,
`/api/proofs/[ref]/[file]`.

**Static** — `/robots.txt`, `/sitemap.xml`.

The admin shell is a numbered race-control rail (01 Overview … 08 Settings) on
a chequered strip. Tables collapse into tiles on small screens.

## 9. Writing a page

Read `docs/PAGE-PATTERN.md` in full. The short version:

```tsx
export default async function SomePage() {
  const t = await getDict();
  const locale = await getLocale();

  return (
    <div className="page-enter">
      <PageHeader title={t.some.title} lead={t.some.lead} />
      <section className="section section-pad">…</section>
      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />
      <section className="section section-pad bg-asphalt">…</section>
    </div>
  );
}
```

- Alternate `bg-pit` and `bg-asphalt` bands, separate them with a
  `.flag-band-sm` strip.
- Section headings speak alone, lead underneath, never floated right.
- **No two pages may use the same composition.** Vary between full-bleed image
  bands, sticky-rail splits, numbered index lists, telemetry figure grids,
  card walls, steppers and hairline spec sheets.
- Every page exports `generateMetadata` using `pageMetadata` from
  `@/lib/seo`, with values taken from the dictionary.

## 10. Copy rules

- French and English share the same key structure; `fr.ts` defines the type.
- New strings go into **both** dictionaries under the existing section, with
  identical key order.
- Email subjects use `|` as the separator. French prose uses `:`.
- Inline body separators use a single `·`.
- Never `—` or `–` in visible copy.

## 11. Commands

```bash
npm run dev      # dev server
npm run build    # production build (TypeScript-clean, ESLint-clean)
npm run start    # production server
npm run lint     # ESLint
```

Type-check only:

```bash
node node_modules\typescript\bin\tsc --noEmit
```

Helper scripts:

```bash
node scripts\scan-dashes.mjs     # em-dash sweep
node scripts\scan-legacy.mjs     # dead-class sweep
node scripts\palette-check.mjs public\*.png   # brand palette check
```

## 12. Before you finish

1. `node node_modules\typescript\bin\tsc --noEmit` → no errors.
2. `npm run lint` → no errors, no warnings.
3. `npm run build` → all routes compile.
4. `node scripts\scan-dashes.mjs` → nothing in visible copy.
5. New copy exists in both `fr.ts` and `en.ts`, in the same order.
6. The page does not repeat another page's composition.
