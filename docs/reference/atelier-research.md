# Atelier Richard Méchano — Research & Competitive Analysis

## Competitive Benchmarks (analyzed for UX)
- Apple.com: minimal chrome, generous whitespace, fluid type, clear CTAs, product-led imagery, restraint in motion
- Pelican Parts (pelicanparts.com): strong fitment (Year/Make/Model), parts diagrams, catalog depth
- ECS Tuning (ecstuning.com): clean PLP/PDP, fitment validation, specs
- RockAuto (rockauto.com): comprehensive catalog, fast filtering, OEM crossref
- OEM parts sites: technical clarity, part numbers prominent

## UX Principles to Adopt
- Part number front-and-center on PDP/list
- Fitment/compatibility block (Make/Model/Year, OE refs)
- Stock status (In stock/Low/Out of stock)
- Clean filters: Make→Model→Year drilldown
- Image-first, neutral backgrounds
- Mobile tiles over tables
- Payment proof UX: clear instructions + upload zone with preview
- Track page with status timeline + proof review context
- Minimal checkout (name/email/phone + delivery/pickup + payment method)

## Content Suggestions
- Company: Atelier Richard Méchano — precision spare parts, restoration, workshop
- Tone: technical, precise, European workshop aesthetic
- Pages: comprehensive legal set (shipping/delivery/return/cancel/regulatory)
- FAQ: fitment, shipping, returns, payment, proof upload

## Technical Notes
- Keep exact stack (Next 16.4.0/React 19.3.0)
- Use signed Cloudinary uploads (customer + admin)
- Zoho SMTP only
- Mongo models mirror existing patterns
- Tiles on mobile everywhere
