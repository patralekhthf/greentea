# Kanta Greens: Session Handoff

## Last updated
2026-09-27. Premix storefront is LIVE on www.kantagreens.com with website cart + UPI checkout, admin order management, About/Contact/policy pages and 11 recipe posts. Teas are a "coming soon" tab (no FSSAI approval yet). One small local commit (recipe scripts) plus this handoff are unpushed.

## Live URLs & repo
- Production: https://www.kantagreens.com (also https://greentea-sigma.vercel.app)
- Admin: /admin/login. Key pages: Admin > Products, Website Orders (/admin/orders), Farmers Market (zone, UPI, orders, carts), Hero Images, Blog.
- GitHub: https://github.com/patralekhthf/greentea, branch `main`
- Vercel project auto-deploys `main`. Neon Postgres (host ep-silent-fire...), Cloudinary for images.

## Infra & deploy model
- Next.js 16.2.6 (App Router, Turbopack), `proxy.ts` (never add `middleware.ts`), Prisma 7 + `@prisma/adapter-pg`, tables prefixed `tblgt_`.
- Vercel build: `prisma generate && prisma migrate deploy && next build`. Every push to `main` deploys AND migrates the prod DB.
- **Pushing needs explicit owner approval every single time** (Vercel free tier throttles and caps deploys; no preview branches either). Commit locally, batch work, ask before pushing. This also applies to /SC.
- Owner treats production as the test system (no real customers yet), so DB data changes there are OK; pushes still need approval.
- Content that lives in the DB or Cloudinary goes live without a deploy: products, hero image, blog posts, zone/UPI settings.
- Local dev: `npm run dev` (port 3000). Browser-preview launch config lives in the session folder `/Users/patralekh/Documents/Codex/Projects/Green Tea Portal/.claude/launch.json` (runs `npm --prefix <repo> run dev`).
- Checks: `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/eslint <paths>`, `./node_modules/.bin/next build` (skips migrate).

## Feature flags & env
- `TEA_LINE_LIVE = false` (lib/catalog.ts): teas show on /teas as coming soon; tea product URLs redirect there; orders reject non-premix items.
- India only: `proxy.ts` pins `gt_country=IN`; `SUPPORTED_COUNTRIES = ["IN"]` (lib/ipapi.ts); location switcher shows India + Farmers Market.
- UPI: VPA + payee in `LocalDeliveryZone` (Admin > Farmers Market > UPI Payment), shared by website checkout and Farmers Market. Currently the owner's small-business UPI ID (kumarikanta218@oksbi, Kanta Kumari).
- Delivery (website orders): Rs 60 first pack + Rs 5 each additional (lib/shipping.ts). Promise: ships 1 to 2 working days, delivered 3 to 7.
- Env names: `DATABASE_URL`, `ADMIN_JWT_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY` (not wired yet).

## Done this session (2026-09-27)
- Business pivot: tea on hold, site repurposed for masala premixes (4c121d0). Product line enum, premix fields, No Onion No Garlic flag, veg mark, new shop filters, product page, home/About copy, logo, India-only.
- Catalogue: 11 premixes imported and published with photos (scripts/data/premixes.ts, `npm run db:import-premixes`). Sambhar, Moong Dal Halwa, Rawa Idli have full back-label data; 8 others show "coming soon" for ingredients and method.
- Hero image: premix spread with the All Purpose Gravy pack composited in, set as India hero (Cloudinary gt/hero/dh1bffewyjqeiptjrnw9).
- Website cart + checkout (cbe9722): separate from the WhatsApp cart; /cart, /checkout (address, UPI QR, UTR), /track (status, courier, pay later); Admin > Website Orders (verify/clear UTR, ship with courier + AWB, deliver, cancel). Orders `KG-YYYYMMDD-NNNN` (IST), server re-prices from DB.
- About page (4f2e0dd), Contact + draft policy pages /legal/{shipping,refund,terms,privacy}.
- Multi-select shop filters (6b826cf): comma lists in URL, OR within a group, AND across groups.
- Second approved push (b3a79f2) is live; verified pages and a live add-to-cart through checkout.
- 11 recipe blog posts published directly to the DB (`npm run db:import-recipes -- --yes`), covers at gt/blog/recipes/<slug>. Live on /blog.

## Uncommitted / in-flight
- Local, not pushed: 5f38fe1 (recipe data, covers, import script; scripts only, not part of the site) and this handoff commit. Safe to include in the next approved push.
- `.DS_Store` modified (ignore, never commit).
- Test order `KG-20260928-0001` ("Test Customer (Claude)", UTR TESTUTR00001) is in the prod DB for the owner to try the admin flow; cancel or delete afterwards.

## Next / pending
0. **REMIND OWNER RIGHT AFTER THE NEXT PUSH:** submit https://www.kantagreens.com/sitemap.xml in Google Search Console and Bing Webmaster Tools. First confirm the live sitemap returns 200 (it 404s until SEO commit d83d954 is deployed).
1. SEO batch DONE locally (d83d954, not pushed): sitemap.xml, robots.txt (AI crawlers explicitly allowed), /llms.txt, canonicals, JSON-LD (Organization, Product, BlogPosting), Recipes label renamed to Blog. Needs the next approved push. Owner should also check the Vercel Firewall has no "AI Bots" block rule on.
2. Owner to place a real small UPI order from a phone and verify it in Admin > Website Orders.
3. Owner to review live drafts: Refund policy (48h reporting, replacement/refund, 5 to 7 day UPI refund are Claude's proposal), About story (STORY block in app/(public)/about/page.tsx).
4. Back labels for 8 premixes (Paneer Tikka x2, Chhole x2, White Gravy, All Purpose, Biryani, Coconut Chutney): update scripts/data/premixes.ts and scripts/data/recipes.ts, re-run both imports (no deploy).
5. Photos still missing: Sambhar front, Paneer Tikka x2, Chhole regular.
6. Later: Razorpay (owner deferred), order confirmation emails (Resend), FSSAI licence number on site when issued, teas relaunch when FSSAI clears.

## Open decisions
- Approve the SEO batch above?
- Farmers Market zone still labelled "home location" with 2.5 km radius; banner/payment copy in DB may still mention teas (admin settings).
- Admin still shows US/UK/AU pricing and hero slots (unused while India-only).

## Gotchas
- Repo lives in iCloud-synced ~/Documents. macOS offloads files (`find . -flags +dataless`) and creates conflict copies named "X 2" / "X 3.ts" (seen in node_modules/@types and .next/types). Symptoms: tsc/prisma/next hang at 0% CPU, or "Cannot find type definition file for 'node 2'", or duplicate-identifier errors from `.next/types/* 3.ts`. Fix: `npm ci`, delete "X N" copies only where the original exists, delete them from .next freely. Best fix: Finder > Keep Downloaded, or move the repo out of iCloud.
- `npm ci` skips install scripts: run `CHECKPOINT_DISABLE=1 ./node_modules/.bin/prisma generate` after. Prisma CLI hangs on telemetry without `CHECKPOINT_DISABLE=1`. Prefer `./node_modules/.bin/<tool>` over npx.
- `prisma migrate diff` hung; write migration SQL by hand. `DATABASE_URL` in .env.local IS the prod Neon DB: only run `prisma migrate deploy` locally deliberately (additive migrations were applied this way while testing).
- Prisma 7: relation writes need `cart: { connect: { id } }`, not scalar FKs; unknown fields fail at insert.
- `lib/cloudinary.ts` imports "server-only", so tsx scripts must configure the Cloudinary SDK directly.
- Blog markdown (components/ui/SimpleMarkdown.tsx) supports ## headings, - bullets, **bold**, *italic*, ---. No numbered lists or links; write steps as "**1.** ..." paragraphs.
- Blog is an SEO channel: keep all posts (old tea posts too) published; no product links in posts unless asked.
- Browser preview: pane must be visible for screenshots; emulated viewports ignore window.scrollTo on some pages; the shop sidebar filters only render at lg width.

## Docs map
- This file: docs/SESSION_HANDOFF.md (load with /RC)
- Catalogue vocabulary + flags: lib/catalog.ts; business details: lib/business.ts; delivery rule: lib/shipping.ts
- Carts: lib/site-cart.ts (website), lib/farmers-market-cart.ts (WhatsApp); pricing/order numbers: lib/site-orders.ts
- Data + import scripts: scripts/data/premixes.ts, scripts/data/recipes.ts, scripts/import-premixes.ts, scripts/import-recipes.ts, images in scripts/data/images/
- Schema + migrations: prisma/schema.prisma, prisma/migrations/
- Storefront pages: app/(public)/*; admin: app/admin/(portal)/*; APIs: app/api/*
