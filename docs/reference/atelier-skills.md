# Atelier Richard Méchano — Skills Inventory

This document catalogs the technical skills, patterns, and conventions used to build this site, mirroring the reference `tony-used-campers` project while adding payment-proof workflow.

## Core Skills
- Next.js 16.4.0 App Router (RSC, Server Actions, route groups `(site)`, dynamic routes, metadata API, generateMetadata, notFound, redirect, cookies)
- React 19.3.0 + TypeScript 5 (strict types, discriminated unions, async props)
- Tailwind CSS v4 with Turbopack (design tokens via CSS classes, 4pt scale, fluid clamp, responsive grids)
- Mongoose 9.x (schemas, models, indexes, timestamps, lean queries)
- Cloudinary API v2 (signed direct uploads, foldering, public_id, destroy)
- Nodemailer 10.x + React Email (transactional emails, Zoho SMTP, sender/recipient constraints)
- jose v6 (JWT session tokens, httpOnly cookies, auth guards)
- bcryptjs (password hashing)
- motion v14 (subtle animations, spring, reduced-motion respect)
- zod v4 (schema validation)
- zustand v5 (cart state, persistence)
- Font Awesome 7.3.1 (iconography only)

## Architectural Patterns
- Server-first: fetch in RSC, mutations via Server Actions
- Env-first, DB-fallback for Cloudinary creds (Settings collection `settingsstores`)
- Admin-guarded routes + server actions
- Signed uploads endpoint (`/api/cloudinary/sign`) with admin/customer auth context
- ImageUploader reusable component (multiple, reorder, cover/Main, paste URLs)
- Tiles/cards on small screens (never tables)
- Mobile-first responsive
- SEO: metadata, canonical, OG/Twitter, JSON-LD (Product, BreadcrumbList, Organization)
- Form UX: server-side validation, redirects with errors

## New Skills (Payment-Proof Flow)
- Per-order payment proof method (`email` | `upload`)
- Customer proof upload (signed, scoped to payments folder)
- Admin proof review (approve/reject, mark received)
- Status history tracking
- Track page payment proof UI gated by order lookup (ref+email)

## Codebase Mapping
- `src/app/(site)` public
- `src/app/admin` admin
- `src/components/{site,admin,ui,seo}`
- `src/lib/{actions,models,auth,settings,cloudinary,mailer}`
- `src/emails`
- `src/store`
- `src/styles`

## Quality
- tsc --noEmit clean
- eslint clean
- accessibility AA
- no eyebrow headings
- consistent naming/style
- commit identity: MeecheAndBoom <meecheandboom@gmail.com>
