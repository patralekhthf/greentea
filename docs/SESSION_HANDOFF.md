# Kanta Greens — Session Handoff

## Last updated
2026-09-27. Business pivot: teas on hold (no FSSAI approval), site repurposed for ready-to-cook masala premixes, India only. Phase 1 code is committed LOCALLY (not pushed, not deployed). FSSAI for premixes is almost done per the user.

## Live URLs & repo
- Live (still the OLD tea site): https://greentea-sigma.vercel.app
- Domain printed on packs: www.kantagreens.com (registered; DNS not yet pointed at Vercel)
- GitHub: https://github.com/patralekhthf/greentea, branch `main`. Local `main` is ahead of origin.
- Admin: `/admin/login`

## Infra & deploy model
- Next.js 16.2.6 App Router (Turbopack), `proxy.ts` (never add `middleware.ts`).
- Prisma 7 + `@prisma/adapter-pg` + Neon Postgres, tables prefixed `tblgt_`.
- Vercel auto-deploys every push to `main`. Build: `prisma generate && prisma migrate deploy && next build`, so pushing also migrates the production DB.
- **DO NOT PUSH** unless the user explicitly asks. User does not want deploys right now.

## Feature flags & env (names only)
- `TEA_LINE_LIVE = false` in `lib/catalog.ts`: teas show as "coming soon" on `/teas`, tea product URLs redirect to `/teas`, orders reject non-premix items. Flip to true (and deploy) when tea FSSAI clears.
- India only: `proxy.ts` pins `gt_country=IN`; `SUPPORTED_COUNTRIES = ["IN"]` in `lib/ipapi.ts`; LocationSwitcher lists India + Farmers Market.
- UPI checkout is enabled when `LocalDeliveryZone.upiVpa` is set (admin > Farmers Market).
- Env: `DATABASE_URL`, `ADMIN_JWT_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY` (optional).

## Done this session (2026-09-27)
- 2b61317 (pushed): brand assets at repo root (logo, letterhead, statement of ingredients).
- 4c121d0 (LOCAL only): premix pivot.
  - Schema: `Product.productLine` (TEA | PREMIX; existing rows backfill TEA), premix fields (spiceLevel, dishType, pairsWith, cookTimeMinutes, servings, yieldNote, cookingInstructions, isVeg, noOnionGarlic, allergens, shelfLifeMonths); `brewingInstructions` now optional. Migration `20260927100000_premix_product_line` NOT applied anywhere yet.
  - Storefront copy rewritten (home, shop, product page, header, footer, metadata, Recipes = blog). Removed invented testimonials, the 4.8 / 5,000+ badge and organic / lab-tested claims.
  - `/teas` coming-soon tab + waitlist. Newsletter form now really saves (`POST /api/newsletter`, source `teas-waitlist` / `homepage`).
  - Farmers Market lists premixes only; orders API refuses non-premix items.
  - Admin product form: product-line picker + premix details section.
- Verified: `tsc --noEmit` clean, `next build` succeeds. NOT verified in a browser (pages need the migration first).

## Launch products (11, in scripts/data/premixes.ts)
Load with `npm run db:import-premixes -- --dry-run` (validate), then `-- --yes` (upsert as Draft) or `-- --yes --publish`. It prints the DB host before writing.
- Full back-label data: Sambhar (100 g, 6 mo), Moong Dal Halwa (150 g, 4 to 5 mo, no spice level), Rawa Idli (220 g, 12 to 15 idlis, No Onion No Garlic).
- Back label pending (ingredients show "coming soon", no How to Cook tab, 100 g and 6 mo assumed): Paneer Tikka Gravy (+ NOG), Chhole Masala (+ NOG), White Gravy (NOG), All Purpose Gravy (NOG), Biryani (NOG), Coconut Chutney (NOG, dish type "Chutneys & Sides").
- Owner-approved placeholders, marked `// TODO` in the data file: prices (Rs 45 to 110), spice levels, allergens. Every product "Serves 3 to 4".
- Photos: owner will supply; upload in Admin > Products after import.
- Manufacturer address on labels: Tower S10, Flat 106, Saraswati Apartment D6, Vasant Kunj, New Delhi 110070. Customer care 9350784240.
- Some halwa mock-ups say "Kanta's Kit" instead of "Kanta Greens"; confirm the brand name on that pack.

## Uncommitted / in-flight
- `.DS_Store` only (ignore).
- Local commits not pushed: 4c121d0 (pivot), 139e614 (catalogue + import script), plus handoff commits.

## Next / pending
1. User reviews the pivot. Go-live checklist when they say deploy:
   a. Push `main` (runs the migration on Neon).
   b. Admin > Products: set every existing tea to **Published** if it should appear on `/teas` (coming soon only), or Archived to hide it.
   c. Add the 7 premixes (Draft first, then Published) with prices, SKUs, photos.
   d. Admin > Hero Images: replace the tea (Taj Mahal) hero with a premix image, 1200x1500 portrait.
   e. Admin > Farmers Market: update the banner / payment copy (DB values still mention teas); fill UPI VPA `kumarikanta218@oksbi`, payee `Kanta Kumari`.
   f. Set tea blog posts to Draft.
2. Until go-live, the live tea site should be taken offline from admin: untick Farmers Market "Active", set tea products to Draft (DB changes, no deploy).
3. Domain `kantagreens.com` -> Vercel (A `@` 76.76.21.21, CNAME `www` cname.vercel-dns.com).

## Open decisions
- Shop and product-page "Add to Cart" buttons are placeholders (they do nothing). The only working order path is the Farmers Market WhatsApp cart (Delhi zone). Wire shop buttons into the WhatsApp cart, or build Razorpay checkout for all-India?
- Admin still shows US/UK/AU pricing and hero-image slots (unused while India-only).
- Waitlist signups are stored but nothing emails them yet (Resend not wired).

## Gotchas
- **The project lives in iCloud-synced ~/Documents.** macOS "Optimize Mac Storage" offloads files (`find . -flags +dataless`). Offloaded `node_modules` makes tsc / prisma / next hang silently at 0% CPU. Fix: `npm ci` (fast) and `brctl download .` for the rest. Better: right-click the folder in Finder > "Keep Downloaded", or move the repo out of iCloud.
- iCloud also creates conflict copies named "X 2" (67 appeared in node_modules/@types after the reinstall, breaking tsc with "Cannot find type definition file for 'node 2'"). Delete a "X 2" copy only when "X" exists. A stray `.git/index 2` is harmless.
- `npm ci` now skips install scripts (prisma, sharp). Run `CHECKPOINT_DISABLE=1 ./node_modules/.bin/prisma generate` afterwards.
- Prisma CLI can hang on its telemetry check: prefix with `CHECKPOINT_DISABLE=1`. Prefer `./node_modules/.bin/<tool>` over `npx`.
- `prisma migrate diff --from-schema/--to-schema` hung; write migration SQL by hand.
- Prisma 7: use `cart: { connect: { id } }`, not scalar `cartId`, when a relation is defined; unknown fields fail at insert.
- `DATABASE_URL` in `.env.local` may be the production Neon DB: never run `prisma migrate deploy` locally.
- Pre-existing lint errors (not from this pivot): react-hooks/set-state-in-effect in LocationSwitcher, FloatingCart, LocationCheckBanner; nested components in ShopFilters.

## Docs map
- Catalogue vocabulary + flags: `lib/catalog.ts`
- Product queries: `lib/products.ts` (`getProducts({ line, dish, cookWith, spice, noOnionGarlic })`)
- Schema: `prisma/schema.prisma`; migrations `prisma/migrations/`
- Storefront: `app/(public)/{page,shop,products/[slug],teas,blog,farmers-market}`
- Cart + WhatsApp + UPI: `lib/farmers-market-cart.ts`, `components/local/*`, `app/(public)/farmers-market/order/OrderReviewClient.tsx`
- Admin: `app/admin/(portal)/*`, form `components/admin/ProductForm.tsx`
- Proxy (admin gate + India pin): `proxy.ts`
