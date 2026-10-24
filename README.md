# Rouillard Sport

**Rouillard Sport** is a bilingual (FR/EN) ecommerce storefront for motorsport spare
parts: new, reconditioned and second-hand components for race cars, checked on the
bench before they ship. Built with Next.js 16.4.0 (App Router), React 19.3.0,
TypeScript, Tailwind CSS v4, Mongoose 9, Cloudinary, Nodemailer + React Email,
jose, zustand, zod, motion, Font Awesome 7.3.1 only.

**Français :** ce dépôt contient le site complet **rouillard-sport.com** : catalogue
de pièces de compétition avec fiche produit, panier, commande avec preuve de
paiement, suivi de commande, carnet d'atelier, FAQ et back-office. Tout est bilingue
français/anglais (bascule de langue dans la barre de navigation, cookie `rs-locale`,
défaut FR). Voir [docs/BILINGUAL.md](docs/BILINGUAL.md) pour le fonctionnement i18n.

---

## Quick start

```bash
npm i
cp .env.example .env.local   # fill in the values
npm run dev
```

Open http://localhost:3000. The back office lives at http://localhost:3000/admin/login
(defaults `admin@rouillard-sport.com` / `Rouillard2026!` — change them in `.env.local`
before going live).

Without `MONGODB_URI` the site runs on the local JSON fallback in `data/`, so a fresh
clone boots with seeded parts, articles and categories.

---

## Design

The interface is a **pit-lane / race-control** system, not a lifestyle store.
Carbon-black surfaces, one gold accent, white markings, chequered-flag bands and
telemetry mono for every number. Everything is square, the site is dark from top to
bottom, and no page ever repeats the layout of another.

| | |
| --- | --- |
| Ground | `pit #08090a` · `asphalt #0e1012` · `panel #14171a` · `panel-2 #1b1f23` |
| Hairlines | `line #2a2e34` · `line-soft #1a1d21` |
| Text | `paper #f2f3f4` · `muted #9aa2ab` · `muted-dim #7b838d` |
| Accent | `gold #c9a227` (hover `gold-light #e8c766`, ink `gold-ink #0a0b0c`) |
| Status | `success #46b95c` · `warning #d29922` · `danger #ff5f52` |
| Type | Barlow Condensed (display, uppercase) · Barlow (body) · JetBrains Mono (figures) |
| Shape | `border-radius: 0` everywhere |

Hard rules: one accent colour, one theme, no eyebrow headings, no em-dashes in visible
copy, at most one `·` per line, no decorative coloured dots, Font Awesome 7 as the only
icon set.

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — tokens, components, motion rules.
- [docs/PAGE-PATTERN.md](docs/PAGE-PATTERN.md) — the brief to read before building a page.
- `src/app/globals.css` — the single source of truth for every token and class.

The brand lockup is **code-native** (`src/components/site/Logo.tsx`): a gold speed
chevron with a chequered-flag corner next to the wordmark. Raster equivalents live in
`public/` for the manifest, OG cards and email shells.

---

## Routes

### Storefront

| Route | What it does |
| --- | --- |
| `/` | Home: hero, category grid, featured parts, spotlight, journal, reviews. |
| `/shop` | Full catalogue. URL-driven filters (`q`, `make`, `brand`, `category`, `condition`, `price`, `stock`, `sort`), linkable and back/forward safe. `/browse` and `/catalog` redirect here. |
| `/shop/[slug]` | Part sheet: gallery, fitment, specs, features, related parts, Product JSON-LD. |
| `/cart`, `/cart/drawer` | Cart drawer plus a full cart page. Persisted in `rs-cart`. |
| `/checkout` | Delivery or workshop pickup, payment method, payment-proof instructions. |
| `/checkout/success/[ref]` | Confirmation with the order reference. |
| `/track` | Order lookup (reference + email), status timeline, payment-proof upload. |
| `/blog`, `/blog/[slug]` | Journal, bilingual, markdown bodies, related posts. |
| `/guides/*` | Hub plus three long-form workshop guides. |
| `/tools/*` | Hub, torque-reference calculator, maintenance calendar. |
| `/about`, `/why-buy-from-us`, `/first-time-buyers` | Brand and trust pages. |
| `/resources` | Guides and tools index. |
| `/help` | FAQ explorer with search and FAQ JSON-LD. |
| `/contact`, `/retrieve-quote`, `/affiliate-program` | Contact, quote request, affiliate signup. |
| `/testimonials` | Public reviews with submission form. |
| `/legal/[slug]` | Privacy, terms, legal notice, shipping, returns. |
| `/sitemap` | Human-readable site map. |

### Back office (`/admin`, session-guarded, English by design)

`/admin` overview and proof queue · `/admin/orders` and `/admin/orders/[ref]` ·
`/admin/products`, `/admin/products/[slug]`, `/admin/products/new` ·
`/admin/blog`, `/admin/blog/[slug]`, `/admin/blog/new` ·
`/admin/categories`, `/admin/categories/[id]`, `/admin/categories/new` ·
`/admin/reviews` · `/admin/enquiries` · `/admin/settings` · `/admin/login`.

Tables collapse into tiles on small screens. The admin shell is a numbered
"race control" rail (01 Overview … 08 Settings) on a chequered strip.

### API

`/api/search` (type-ahead) · `/api/auth/me` (session probe) ·
`/api/cloudinary/upload` (session-gated uploads) · `/api/proofs/[ref]/[file]`
(proof images from the local fallback store).

---

## Stack

Next.js 16.4.0 · React 19.3.0 · TypeScript ^5 · Tailwind CSS v4
(`@tailwindcss/turbopack`) · Mongoose ^9 · Cloudinary ^2 · Nodemailer ^10 +
React Email · jose (JWT session) · bcryptjs · zod ^4 · zustand ^5 · motion ^14 ·
Font Awesome ^7 (no other icon sets).

---

## Environment (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas. The database name must be part of the URI (`…mongodb.net/rouillard-sport`). Without it the site falls back to `data/*.json`. |
| `MONGODB_DB` | Optional override when the URI has no path. |
| `AUTH_SECRET` | JWT secret for the `rs-admin` session cookie. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin login. Defaults: `admin@rouillard-sport.com` / `Rouillard2026!` — **change in production**. |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | Canonical origin (metadata, OG, JSON-LD, sitemap, email links). |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Part and proof uploads. Optional — falls back to local `data/proofs/` storage served by `/api/proofs/[ref]/[file]`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP (`smtp.gmail.com:587`, STARTTLS). Without SMTP, emails are written to `data/emails/` for inspection. |
| `EMAIL_FROM` / `NOTIFICATION_EMAIL` | Sender and admin-notice recipient. |

The environment always wins over the values saved in Admin → Settings.

Client-side storage keys: `rs-locale` (language) · `rs-admin` (session) ·
`rs-cart` (cart) · `rs-shop-view` (shop layout) · `rs-cookie-consent-v1` (consent).

---

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (TypeScript-clean, ESLint-clean)
- `npm run start` — production server
- `npm run lint` — ESLint

Helper scripts live in `scripts/`: `assemble-images.mjs` (build the image set),
`fetch-images.mjs` (source candidates), `scan-dashes.mjs` (em-dash sweep),
`scan-legacy.mjs` (dead-class sweep), `palette-check.mjs` (brand palette check).

---

## Payment-proof flow

Each order stores `proofMethod: email | upload`. The customer pays by transfer, then
either waits for the instructions email or uploads a JPG/PNG/WebP proof (10 MB max)
on `/track`. An admin notice email fires, the dashboard queue shows the proof, and
approve/reject sends localized feedback: approve moves the order to *Payment received*,
reject returns it to *Awaiting payment proof* with the reason.

Order references use the `RS-` prefix (for example `RS-4KD2X9`).

---

## Content and assets

- **Seed data** — `src/lib/catalog.ts` (parts) and `src/lib/blog-seed.ts` (journal
  articles). Everything is editable afterwards in the dashboard.
- **Photography** — real imagery in `public/images/`:
  `editorial/` (27 shots: hero, workshop, paddock, spotlight, helmet),
  `categories/` (54 shots across 14 categories), `makes/` (30), `brands/` (14),
  plus `map-lyon.jpg`. Assembled by `scripts/assemble-images.mjs`; attributions are
  listed in [docs/IMAGE-CREDITS.md](docs/IMAGE-CREDITS.md).
- **Brand assets** — `public/full-logo.png` (nav, footer, email shell),
  `public/logo-icon.png` + `public/logo-icon.svg` (JSON-LD, favicons),
  `public/rouillard_sport_open_graph.png` (OG/Twitter card), the favicon set
  (`favicon.ico`, `favicon.svg`, `favicon-32x32/64x64/96x96.png`,
  `apple-icon.png`, `apple-touch-icon.png`), `public/manifest.json` and
  `public/site.webmanifest`.
- **Placeholder details** — 14 Rue de la Vitrine, 69150 Décines-Charpieu ·
  +33 4 72 84 09 63 · contact@rouillard-sport.com. Editable in Admin → Settings.

---

## Docs

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — tokens, components, motion, copy rules.
- [docs/PAGE-PATTERN.md](docs/PAGE-PATTERN.md) — the page-building brief.
- [docs/BILINGUAL.md](docs/BILINGUAL.md) — how the FR/EN layer works, how to add strings.
- [docs/IMAGE-CREDITS.md](docs/IMAGE-CREDITS.md) — image sources and licenses.
- [rouillard-sport-prompt.md](rouillard-sport-prompt.md) — master build spec.
- [docs/reference/](docs/reference) — the original research and brief that started the
  project, kept for provenance.
