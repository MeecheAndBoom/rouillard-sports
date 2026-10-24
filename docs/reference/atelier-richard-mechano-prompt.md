# Atelier Richard Méchano — Master Build Prompt (Apple.com-grade, Next.js 16.4.0)

Copy/paste this entire document into your AI agent as the single instruction to build the site. It mirrors the architecture, patterns, and conventions of the reference project `tony-used-campers` while adapting to a spare parts ecommerce/catalog model with the requested payment-proof workflow.

## 1. Project Identity
- Company: Atelier Richard Méchano
- Industry: Automotive/machine spare parts, restoration, maintenance parts
- URL (target): https://www.atelier-richard-mechano.com (use www/apex 308→www convention if desired)
- Branding: Premium, minimalist, Apple.com-inspired (soft neutrals, generous whitespace, refined typography, fluid motion, hardware-accelerated, zero decorative bloat)
- Vibe: Precision workshop meets luxury editorial. Technical without looking industrial-clunky. Clean, calm, confident.

## 2. Core Principles (Apple.com look)
- Restraint: minimal chrome, generous breathing room, strong hierarchy
- Typography-first: system font stack or premium serif/sans with optical sizing, tight tracking, high contrast, fluid type scale (clamp)
- Spatial rhythm: 4pt/8pt scale (4,8,12,16,20,24,32,40,48,56,64,72,80,96). Consistent padding/gaps.
- Layout: asymmetric when useful, generous max-widths, balanced grids, gapless bento only when intentional. Avoid cards-inside-cards.
- Surfaces: solid whites, soft grays (#f5f5f7, #fafafa), pure blacks (#111111/#000), hairline borders (#e5e5e5/#d2d2d2), subtle depth (no heavy drop shadows).
- Motion: fluid, interruptible, spring-like (match existing `motion` usage). Respect `prefers-reduced-motion`. Sub-150ms micro-interactions, tasteful page transitions avoided unless purposeful.
- Imagery: editorial, high-res, soft lighting, product-led (parts on clean neutral backgrounds). Prefer Cloudinary-optimized responsive images.
- Accessibility: WCAG 2.2 AA, semantic HTML, focus rings, alt text, aria labels, keyboard nav, logical heading order (no artificial eyebrow headings unless specified).
- Mobile-first, responsive. Admin uses tiles/cards on small screens (never tables). Public uses clean grids/lists.

## 3. Tech Stack (Exact Match)
Mirror `tony-used-campers` exactly:
- Next.js: 16.4.0 (App Router, React Server Components where appropriate)
- React: 19.3.0, React DOM 19.3.0
- TypeScript: ^5
- Tailwind CSS: ^4 with `@tailwindcss/turbopack`
- Mongoose: ^9.11.1 (MongoDB)
- Cloudinary: ^2.11.0 (signed direct uploads, folder structure, destroy on delete)
- Nodemailer: ^10.0.16 + @react-email/components ^1.0.12 + @react-email/render ^2.1.0 (Zoho SMTP)
- jose: ^6.2.12 (JWT sessions)
- bcryptjs: ^3.0.3
- motion: ^14.0.0
- zod: ^4.6.5
- zustand: ^5.0.15
- Font Awesome: ^7.3.1 (only icon set allowed)
- ESLint: ^9 + eslint-config-next 16.4.0

Do not introduce other UI libs/icons. Follow existing code style, naming, structure.

## 4. Environment & Config
Required env vars (dev + prod). Treat env-first, Settings fallback for Cloudinary (same pattern as project): `MONGODB_URI`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SITE_URL` (or `NEXT_PUBLIC_SITE_URL`), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (true), `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (e.g. "Atelier Richard Méchano <sales@atelier-richard-mechano.com>"), `NOTIFICATION_EMAIL` (default sales@...). All emails from sender+notification only to `sales@atelier-richard-mechano.com` unless specified. Chatway/widget only on public pages (if used, same rule). 

## 5. Site Architecture & Routes
Public (App Router `(site)` group):
- `/` Home (hero, featured parts, categories by Make/Model/Brand, trust, testimonials)
- `/browse` or `/catalog` Catalog (PLP) with filters: Make, Model, Brand, Year/Range, Category, Subcategory, Condition (New/Refurb/Used), Price range, In-stock
- `/shop` alias to catalog or keep `/shop`? Include `/shop` + `/catalog` + `/browse` for SEO; also `/shop/[slug]` PDP
- `/shop/[slug]` Product detail (fitment/compatibility, specs, images, stock, related)
- `/cart` Bag
- `/checkout` Checkout (with payment method choice + optional payment proof upload UI)
- `/checkout/success/[ref]` Order confirmed
- `/track` Track order (lookup by ref+email) — includes payment proof upload section when applicable
- `/blog` + `/blog/[slug]`
- `/about` About Us
- `/contact` Contact Us
- `/help` Help / FAQ
- `/retrieve-quote` Retrieve Quote (form)
- `/sell` or `/sell-parts` (optional)
- `/affiliate-program` Affiliate Program
- `/resources` Resources
- Legal: `/legal/[slug]` with Privacy Policy, Terms of Service, Legal Notice, Return Policy, Cancellation Policy, Shipping Policy, Delivery Policy, Privacy & Terms, Regulatory Compliance
- `/testimonials`, `/why-buy-from-us`, `/first-time-buyers`, `/sitemap`, `/robots.txt`, `/sitemap.xml`

Admin (`/admin`): Overview, Orders, Products, Blog, Categories, Reviews, Enquiries, Settings, Back to site. Use cards/tiles on small screens, no tables. Include all CRUD with ImageUploader.

## 6. Data Models (Mongoose)
Adapt schemas to spare parts. Keep same patterns (timestamps, indexes). 

### Product (Spare Parts)
Fields:
- slug (unique, index)
- title (required)
- partNumber (required, index, unique or per brand) e.g. "ARM-12345"
- sku (optional, index)
- brand (required) — manufacturer/brand
- make (required) — vehicle/machine make (e.g. Peugeot, Citroën, Renault, etc., or general)
- model (required) — model(s) comma or array
- yearFrom/yearTo or yearRange string (compatibility)
- fitment: string[] or text (what fits)
- condition: "new"|"refurb"|"used" default "new"
- category (required, index) e.g. Engine, Transmission, Electrical, Brakes, Body, Suspension, Fuel, Cooling, Interior, Tools, Gaskets, Filters
- subcategory (optional)
- type? optional
- price (required, number)
- listPrice? (number)
- stock (number, required, >=0, index)
- weightKg? (number), dimensions? {l,w,h,unit}
- specs: Record<string,string> or flexible
- description (string, markdown-friendly)
- features: string[]
- images: string[] (Cloudinary URLs)
- status: "live"|"draft" default "live", index
- featured: boolean default false
- tags: string[]
- oemNumbers?: string[]
- createdAt/updatedAt

Model: `Product` collection.

### Categories
Keep structure (name, image, slug). Support Make/Model/Brand taxonomy optionally (separate or use category tree). Also add `type: 'category'|'make'|'brand'|'model'`.

### Order (update with payment proof)
Extend existing Order with payment proof flow:
- payment: {
  - method (string, required) — chosen at checkout (from Settings payment methods)
  - methodOther? string
  - label? string, instructions? string
  - amountDue? number, dueDate? Date
  - status: "pending"|"awaiting-proof"|"proof-submitted"|"received" default "pending"
  - receivedAt? Date
  - requireProofUpload?: boolean (admin-controlled per order or derived)
  - proofMethod?: "email"|"upload" (how admin requested: send email with details OR show stored details + require upload)
  - paymentDetails?: string (admin-entered default payment details to show to customer when proofMethod='upload')
  - proof?: {
      url: string (Cloudinary)
      publicId?: string
      uploadedAt: Date
      uploadedBy?: string (customer email/ref or 'customer')
      note?: string
    }
- status enum extend to include sensible states: "Placed","Awaiting Payment","Payment Pending","Awaiting Payment Proof","Payment Proof Submitted","Payment Received","Preparing","Ready for Pickup","Out for Delivery","Completed","Cancelled"

Track page + admin must reflect these.

### Other models (Settings, Blog, Review, Enquiry, Admin) unchanged in core, extend Settings with payment methods (array) as is.

## 7. Payment Flow (Key Difference)
Current: admin emails payment details after order placed. 
New:
- Admin can choose per order (or globally default) whether to: (a) **Send via email** (existing behavior) — email contains payment details; customer pays as instructed. (b) **Provide stored payment details + require screenshot upload** — show default payment details on Track/Checkout success context; customer uploads payment proof (screenshot) to Track Order page (or Checkout/Order context). Once uploaded, order status becomes `Payment Proof Submitted`; admin reviews and marks as `Payment Received` (or moves to Preparing).

Implementation:
- Checkout creates order with status `Placed`/`Awaiting Payment`.
- Admin (Orders detail) can set: `payment.proofMethod` = 'email'|'upload', `payment.paymentDetails` (rich text/simple), `payment.requireProofUpload`, `payment.status` appropriately.
- When `proofMethod='upload'`, Track page shows "Payment instructions" block (from `payment.paymentDetails`) + "Upload payment proof" section (image upload to Cloudinary folder `tuc/uploads/payments` or `atelier/payments/proofs`, signed upload). Accept JPG/PNG/WebP up to 10MB.
- On upload, save `payment.proof` and set status to `Payment Proof Submitted` + add to `statusHistory`.
- Admin can Approve/Reject proof, add note, set `Payment Received`.
- Emails: keep sender/recipient policy (sales@atelier-richard-mechano.com). Notify admin on proof submission.

## 8. Image Uploads (Cloudinary)
- Signed uploads via `/api/cloudinary/sign` (admin-guarded or auth-guarded where customer uploads? Customer uploads payment proof — must be authenticated by order ref+email lookup; allow signed upload scoped to `atelier/uploads/payments` folder, 10MB). 
- Folders: `atelier/uploads/products`, `atelier/uploads/blog`, `atelier/uploads/categories`, `atelier/uploads/payments`, `atelier/uploads/hero`.
- Reuse ImageUploader component, adapt labels. Multiple images for products (gallery), single for hero/category.
- On delete, destroy from Cloudinary.

## 9. Design System (Apple.com)
- Colors: bg #fff, surface-alt #f5f5f7, ink #111111, muted #6e6e73, line #e5e5e5, accent #0071e3 (Apple blue) or #0066cc, success #34c759, danger #ff3b30
- Type: Inter/system-ui/SF Pro-like. Use fluid clamp for h1-h6. Letter-spacing refined, leading relaxed.
- Radius: 12–16px (cards), 10–14px (inputs/buttons), full for pills
- Spacing: 4pt scale, section padding py-16/20/24 md:py-24/28
- Buttons: .btn, .btn-primary, .btn-ghost, .btn-danger (match existing)
- Fields: .field, .field-label (match)
- Cards: subtle, border or bg-alt. Tiles on mobile everywhere admin lists.
- Grids: CSS Grid, auto-fit/minmax for catalog.

## 10. Pages & Sections (Full List)
Include every requested page with clean Apple-like sections. Add breadcrumbs, JSON-LD (Product, BreadcrumbList, Organization, BlogPosting), SEO meta (title/description/keywords), canonical, OG/Twitter.

## 11. Admin Dashboard
Same nav + Overview, Orders (tiles on mobile, includes payment proof column/actions), Products (spare-parts schema), Categories, Blog, Reviews, Enquiries, Settings (Cloudinary, SMTP, site, payment methods, global proof-email toggle). Mobile cards, not tables.

## 12. Skills Inventory to Document
Create `atelier-skills.md` listing: Next.js App Router, RSC/Server Actions, Mongoose models, Zod validation, JWT auth (jose), Cloudinary signed uploads, Nodemailer+React Email, Zustand cart, SEO/JSON-LD, Tailwind v4, TypeScript, accessibility, tiles pattern, etc. (mirror all skills used in current project + new payment-proof flow).

## 13. Implementation Requirements
- Follow existing file structure exactly (`src/app`, `src/components/{site,admin,ui,seo}`, `src/lib/{actions,models}`, `src/emails`, `src/store`, `src/styles`)
- No breaking conventions. Keep commit style (name/email as given). 
- Type-safe end-to-end, server actions for mutations.
- Preserve Font Awesome only, no eyebrow headings, tiles on small screens.
- All emails from `sales@atelier-richard-mechano.com` only.
- Build must pass (`tsc --noEmit`, `next build`) with no new lint errors.

## 14. Research Directive (Internet)
Research: Apple.com IA/visual language, spare parts UX (eBay Motors/Parts, RockAuto, ECS Tuning, Pelican Parts, OEM parts, fitment search UX), automotive fitment (Year/Make/Model filters, VIN lookup optional), B2B/B2C parts, EU/US compliance pages, payment proof UX, order tracking. Synthesize into best-in-class, cleaner than competitors. Do not copy, distill principles.

## 15. Deliverables
1. Full working codebase matching above
2. `.env.example` with all vars
3. `README.md` with setup (Mongo, Cloudinary, Zoho SMTP)
4. `atelier-skills.md` (skills used + mapping)
5. This prompt preserved as `docs/atelier-prompt.md`

Start by scaffolding with same structure, generate types/schemas first, then public UI, then admin, then order+payment-proof flow, then polish. Test end-to-end (uploads, emails, order lifecycle).
