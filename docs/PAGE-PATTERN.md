# Page rewrite briefing (Rouillard Sport)

You are rewriting public pages of **Rouillard Sport**, a motorsport spare-parts
store. The site has just been re-skinned with a new design system. The old
light/rounded editorial look must be gone: every page you touch must read as
a **pit-lane parts house** (carbon black, gold machined hardware, white
markings, chequered-flag motifs, telemetry type for numbers).

## Mandatory reading

1. `docs/DESIGN-SYSTEM.md` — the full token, type and component spec.
2. `src/app/globals.css` — the actual implementation of every shared class.

## Hard rules (a reviewer will check each one)

| Rule | Meaning |
| --- | --- |
| Dark only | `bg-pit`, `bg-asphalt`, `bg-panel`, `bg-panel-2` only. Never a white or cream section. |
| One accent | Gold only (`text-gold`, `bg-gold`, `border-gold`). No blue/purple/teal/red. Status colours only for status. |
| Square | No `rounded-*` of any kind, including `rounded-full` and `rounded-[8px]`. |
| No eyebrows | Never a small uppercase label above a heading. The heading speaks alone. |
| No em-dash | Visible copy must not contain `—` or `–`. Use a period, comma, colon or hyphen. |
| No decorative dots | No coloured dot before a nav item, badge or list row. |
| One mid dot | At most one `·` per line. Prefer hairline separators. |
| i18n | Every visible string comes from `t.*`. Never hardcode French or English copy. |
| Icons | Font Awesome 7 only: `fa-solid`, `fa-regular`. No inline SVG icons (the brand mark is the only exception, via `Logo`/`LogoMark`). |
| Imagery | Real photos from `public/images/**`. Use `next/image` or `<img>` with the `eslint-disable-next-line @next/next/no-img-element` comment, exactly like the existing files. |
| Numbers | Prices, quantities, references, counts use `font-mono-num`. |
| Icons in images | Stock badges use a Font Awesome glyph, never a bare coloured dot. |

## Tokens and shared classes (source of truth: `src/app/globals.css`)

```
Surfaces   bg-pit  bg-asphalt  bg-panel  bg-panel-2
Lines      border-line  border-line-soft
Text       text-paper  text-muted  text-muted-dim  text-white
Gold       text-gold  text-gold-light  bg-gold  bg-gold-ink  border-gold
Status     text-success text-warning text-danger  (+ bg-success/10 etc.)
Type       font-display (Barlow Condensed, uppercase)  font-mono-num (JetBrains Mono)
Layout     .section (1240px)  .section-wide  .section-narrow  .section-pad
Surfaces   .panel  .panel-flat
Controls   .btn + .btn-primary .btn-outline .btn-dark .btn-ghost .btn-danger .btn-sm .btn-lg
           .field  .field-label
Badges     .badge + .badge-gold .badge-success .badge-warning .badge-danger .badge-quiet
Motifs     .flag-band  .flag-band-sm  .flag-band-gold  .livery  .speed-stripes  .grid-lines  .brackets
Motion     .reveal  .is-visible  .page-enter
Type util  .font-display  .font-mono-num  .prose-rs
```

Do **not** use the legacy names (`bg-alt`, `text-ink`, `text-muted-light`,
`bg-accent`, `card`, `card-flat`, `bg-graphite`, `bg-sky`, `prose-arm`) in new
markup. They exist only as a compatibility layer for pages not yet migrated.

## Components you should reuse

| Import | Purpose |
| --- | --- |
| `@/components/site/PageHeader` | `PageHeader` (title, lead, children) and `Breadcrumbs` (items array) |
| `@/components/ui/Reveal` | scroll reveal wrapper, `delay` in ms |
| `@/components/ui/Accordion` | `question` + children disclosure |
| `@/components/ui/FormBits` | `Field`, `FormMessage`, `Stars` |
| `@/components/site/CopyButton` | clipboard copy |
| `@/components/site/FaqExplorer` | FAQ search + chips |
| `@/components/site/PostBody` | markdown article body |
| `@/components/ui/ProductCard` / `ProductCardCompact` / `ProductRow` | catalogue cards |
| `@/components/ui/ScrollRail` | horizontal snap rail |
| `@/components/site/Spotlight` | full-bleed rotating product |
| `@/components/site/BrandsMarquee` / `ReviewsMarquee` | marquees |
| `@/components/site/Logo` | `Logo`, `LogoMark` |
| `@/components/site/HeroBackground` | hero image layer |

## Page skeleton

```tsx
export default async function SomePage() {
  const t = await getDict();
  const locale = await getLocale();

  return (
    <div className="page-enter">
      <PageHeader title={t.some.title} lead={t.some.lead}>
        {/* optional actions */}
      </PageHeader>

      <section className="section section-pad">
        <h2 className="font-display text-[28px] leading-none text-white sm:text-[36px]">…</h2>
        <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">…</p>
        …
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />

      <section className="section section-pad bg-asphalt">
        …
      </section>
    </div>
  );
}
```

Alternate the surface on every second band (`bg-pit` / `bg-asphalt`) and put a
`.flag-band-sm` strip between bands so the rhythm reads as a pit lane.

## Section heading pattern (no eyebrow)

```tsx
<h2 className="font-display text-[28px] leading-none text-white sm:text-[36px]">
  {title}
</h2>
{lead && (
  <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">{lead}</p>
)}
```

The lead always sits **under** the headline, never floated in a right column.

## Metadata

Every page exports `generateMetadata` using `pageMetadata` from `@/lib/seo`:

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({ title: t.x.title, description: t.x.description, path: "/x", locale });
}
```

Keep the existing `generateMetadata` of each page, just make sure the values
come from the dictionary.

## Dictionaries

`src/lib/i18n/dictionaries/fr.ts` is the source of truth for the shape.
`src/lib/i18n/dictionaries/en.ts` must mirror it exactly. `t` is accessed as
`t.<section>.<key>`. Explore the dictionary before you write copy, and use only
keys that already exist. If a page genuinely needs a new string, add it to
**both** `fr.ts` and `en.ts` under the existing section, keeping the key order
identical in both files.

## Rules of thumb for making each page different

Do not build every page the same way. Vary the composition:

- a full-bleed image band with an overlaid statement,
- a two-column split (sticky rail + content),
- a numbered index list,
- a telemetry grid of figures,
- a card wall with a different card shape,
- a timeline or stepper,
- a table-like spec sheet built with grid rows and hairline dividers.

Never repeat the same layout twice across two pages.

## Verify before you finish

Run:

```
node node_modules\typescript\bin\tsc --noEmit
```

It must report no error for the files you touched. Fix anything you broke.
Do not run a production build; another agent is doing that.
