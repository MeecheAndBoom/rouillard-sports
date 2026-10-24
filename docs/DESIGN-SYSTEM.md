# Rouillard Sport — Interface System

Read this before touching any page. Every rule here is enforced by the shared
components in `src/components/`.

## 1. Design read

**Motorsport parts house for race drivers and teams.** Industrial pit-lane
language: carbon-black surfaces, gold machined hardware, white markings,
chequered-flag motifs, telemetry type for numbers. Technical, fast, precise.
Never playful, never soft, never "premium lifestyle".

Dials: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 6`, `VISUAL_DENSITY 6`.

## 2. Non-negotiables

| Rule | Detail |
| --- | --- |
| One theme | The whole site is dark (pit). No section inverts to white. |
| One accent | Gold `#c9a227`. Never blue, purple, teal, red. Status colors only for status. |
| One shape | Square. `border-radius: 0` everywhere (chips, buttons, cards, inputs). |
| No eyebrows | Never a small uppercase label above a heading. Headings speak alone. |
| No em-dash | Use a period, comma, colon or hyphen. Never `—` or `–` in visible copy. |
| No decorative dots | No coloured dot before a nav item, badge or list row. |
| Motion | Motion must be motivated: hierarchy, feedback, storytelling, state change. |
| Icons | Font Awesome 7 only (`fa-solid`, `fa-regular`). No inline SVG icons. |
| Images | Real photography from `public/images/**`. No div-built fake UI. |
| Mid dot `·` | Maximum one per line. Prefer hairlines or columns. |

## 3. Colour tokens

```
pit       #08090a   page ground
asphalt   #0e1012   alternating band
panel     #14171a   card
panel-2   #1b1f23   raised / inset
line      #2a2e34   hairline
line-soft #1a1d21   quiet divider

paper      #f2f3f4  primary text
muted      #9aa2ab  secondary text
muted-dim  #7b838d  tertiary text / placeholders

gold       #c9a227  accent, links, primary CTA
gold-light #e8c766  hover / emphasis
gold-dark  #8c6e14  deep gold
gold-ink   #0a0b0c  text on gold

success #46b95c   warning #d29922   danger #ff5f52
```

Tailwind class names: `bg-pit`, `bg-asphalt`, `bg-panel`, `bg-panel-2`,
`border-line`, `border-line-soft`, `text-paper`, `text-muted`, `text-muted-dim`,
`bg-gold`, `text-gold`, `text-gold-light`, `bg-gold-ink`.

## 4. Type

- `--font-display` → Barlow Condensed 600/700/800. All `h1`-`h6` are uppercase.
- `--font-body` → Barlow 400/500/600/700. Body copy, nav, buttons.
- `--font-mono` → JetBrains Mono. Part numbers, prices, stock counts, references.

Sizes (desktop / mobile):

```
h1 hero      clamp(2.5rem, 6vw, 4.25rem)   line-height 0.95
h2 section   clamp(1.75rem, 3.2vw, 2.5rem) line-height 1
h3 card      1.25rem
lead         1.0625rem / 1.7            colour muted
body         1rem / 1.65                colour paper
caption      0.8125rem
micro        0.6875rem uppercase 0.1em  colour muted
```

Use `.font-mono-num` for anything numeric (prices, quantities, references).

## 5. Shared classes (globals.css)

Layout
- `.section` (1240px) `.section-wide` (1440px) `.section-narrow` (860px)
- `.section-pad` vertical rhythm `clamp(3.5rem, 7vw, 6.5rem)`

Surfaces
- `.panel` (hover lifts + gold border), `.panel-flat` (no hover)
- `.tile` = `.panel` alias used by product cards

Controls
- `.btn` + `.btn-primary` `.btn-outline` `.btn-dark` `.btn-ghost` `.btn-danger`
  `.btn-sm` `.btn-lg`
- `.field` `.field-label` — square, gold focus ring
- `.badge` + `.badge-gold` `.badge-success` `.badge-warning` `.badge-danger` `.badge-quiet`

Motifs
- `.flag-band` (28px checker) `.flag-band-sm` (14px) `.flag-band-gold`
- `.livery` gold/white/black stripe, `.speed-stripes`, `.grid-lines`
- `.brackets` gold corner reticle (needs `relative` on the parent)

Motion
- `.reveal` + `.is-visible` (handled by `<Reveal>`), `.page-enter`

## 6. Page skeleton

```
<div className="page-enter">
  <PageHeader title lead>        <- every inner page starts here
  <section className="section section-pad"> ... </section>
</div>
```

Alternate surfaces with `bg-asphalt` on every second band, and separate them
with a `.flag-band-sm` strip (6-10px tall) so the rhythm reads as a pit lane.

## 7. Section heading pattern

No eyebrow. One of:

```tsx
<h2 className="font-display text-[28px] leading-none text-white sm:text-[36px]">
  {title}
</h2>
{lead && <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">{lead}</p>}
```

The lead sits **under** the headline, never floated in a right-hand column.

## 8. Buttons

- Primary: `.btn.btn-primary` — gold fill, ink text. One per view.
- Secondary: `.btn.btn-outline` — gold hairline.
- Tertiary: `.btn.btn-ghost` — bare gold text with arrow.
- Labels are short and never wrap at desktop (max ~3 words).

## 9. Cards

Square, 1px `--color-line` border, `bg-panel`. On hover the border turns gold
and the card lifts 4px. Images are `object-cover` inside a fixed aspect ratio
so grids never shift. Never nest a card inside a card.

## 10. Data display

- Prices: `.font-mono-num`, 1.25rem, white. Discount in `text-muted` with
  `line-through`. Part numbers: `.font-mono-num text-[0.8125rem] text-muted`.
- Stock: `.badge-success` / `.badge-warning` / `.badge-danger` with a Font
  Awesome glyph, never a bare coloured dot.
- Specifications: 2-column card grid or grouped rows with hairline dividers.
  Never a 10-row table with borders on every cell.

## 11. Forms

- Label above the input, uppercase micro label, helper below, error below.
- Inputs square, `bg-pit`, gold focus ring.
- Two columns at `md`, one column on mobile. Never a table layout.

## 12. Files to reuse

| Component | Purpose |
| --- | --- |
| `@/components/site/PageHeader` | page masthead + `Breadcrumbs` |
| `@/components/ui/Reveal` | scroll reveal (wrap sections and cards) |
| `@/components/ui/ProductCard` | grid product card |
| `@/components/ui/ProductCardCompact` | rail tile |
| `@/components/ui/ProductRow` | list row |
| `@/components/ui/ScrollRail` | horizontal snap rail with arrows |
| `@/components/ui/Accordion` | FAQ / legal disclosure |
| `@/components/ui/FormBits` | `Field`, `FormMessage`, `Stars` |
| `@/components/site/AddToCart` | add-to-cart button |
| `@/components/site/Spotlight` | full-bleed rotating product |
| `@/components/site/BrandsMarquee` | brand logo band |
| `@/components/site/ReviewsMarquee` | review strip |

## 13. i18n

Every string comes from the dictionary (`t.*`). Never hardcode user-visible
copy in a component or page. `fr.ts` is the source of truth for the type
shape; `en.ts` must mirror it exactly.
