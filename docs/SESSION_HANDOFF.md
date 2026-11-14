# Kanta Greens / RasoiVita: Session Handoff

## Last updated
2026-11-13. Storefront rebranded to RasoiVita ("A Delicacy of Kanta Greens"; Kanta Greens stays the company). 7 premixes live with RasoiVita front/back photos at Rs 309 to 399; 4 marked out of stock. SEO, llms.txt and WhatsApp/Meta product feed are live. Everything is pushed (last code push e5de875).

## Live URLs & repo
- Production: https://www.kantagreens.com (also https://greentea-sigma.vercel.app)
- Admin: /admin/login. Key pages: Admin > Products, Website Orders (/admin/orders), Farmers Market (zone, UPI, orders, carts), Hero Images, Blog.
- Machine-readable: /sitemap.xml (DB, hourly), /robots.txt, /llms.txt (DB, hourly), /feeds/products.csv (Meta Commerce Manager + Google Merchant format, DB, hourly).
- GitHub: https://github.com/patralekhthf/greentea, branch `main`
- Vercel project auto-deploys `main`. Neon Postgres (host ep-silent-fire...), Cloudinary (cloud dvvjjcrby) for images.

## Infra & deploy model
- Next.js 16.2.6 (App Router, Turbopack), `proxy.ts` (never add `middleware.ts`), Prisma 7 + `@prisma/adapter-pg`, tables prefixed `tblgt_`.
- Vercel build: `prisma generate && prisma migrate deploy && next build`. Every push to `main` deploys AND migrates the prod DB.
- **Pushing needs explicit owner approval every single time** (Vercel free tier caps deploys; no preview branches). Commit locally, batch, ask. Applies to /SC too.
- **Push as patralekhthf.** The active `gh` account on this Mac is `divyampat` (403 on this repo). Push without switching the global account:
  `git -c credential.helper= -c 'credential.helper=!f() { echo username=patralekhthf; echo "password=$(gh auth token --user patralekhthf)"; }; f' push origin main`
- Owner treats production as the test system (no real customers yet), so DB data changes there are OK; pushes still need approval.
- Content in the DB or Cloudinary goes live without a deploy: products, prices, stock, photos, hero, blog posts, zone/UPI settings.
- Local dev: `npm run dev` (port 3000). Checks: `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/eslint <paths>`, `./node_modules/.bin/next build` (skips migrate). Two lint errors in components/layout/LocationSwitcher.tsx are pre-existing.

## Feature flags & env
- `TEA_LINE_LIVE = false` (lib/catalog.ts): teas on /teas as coming soon; tea URLs redirect there; orders reject non-premix items; teas excluded from sitemap/feed/llms.txt.
- Brand constants: `BRAND_NAME = "RasoiVita"`, `BRAND_TAGLINE = "A Delicacy of Kanta Greens"` (lib/catalog.ts); `BUSINESS.name = "Kanta Greens"`, `BUSINESS.brand = "RasoiVita"` (lib/business.ts). Site URL + crawler lists in lib/site.ts.
- India only: `proxy.ts` pins `gt_country=IN`; `SUPPORTED_COUNTRIES = ["IN"]`.
- UPI: VPA + payee in `LocalDeliveryZone` (Admin > Farmers Market > UPI Payment), shared by website checkout and Farmers Market.
- Delivery (website orders): Rs 60 first pack + Rs 5 each additional (lib/shipping.ts). Ships 1 to 2 working days, delivered 3 to 7.
- Env names: `DATABASE_URL`, `ADMIN_JWT_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY` (not wired yet).

## Catalogue state (prod DB, 2026-11-13)
| Premix | SKU | Price | Stock | Photos |
|---|---|---|---|---|
| Coconut Chutney | KG-CCH-100 | 309 | OUT_OF_STOCK | old Kanta Greens |
| All Purpose Gravy | KG-APG-100 | 319 | live | RasoiVita front+back |
| Sambhar | KG-SAM-100 | 329 | live | RasoiVita front+back |
| Chhole Masala | KG-CHM-100 | 339 | live | RasoiVita front+back |
| Chhole Masala (NOG) | KG-CHM-NOG-100 | 339 | OUT_OF_STOCK | old Kanta Greens |
| Paneer Tikka Gravy | KG-PTG-100 | 349 | live | RasoiVita front+back |
| Paneer Tikka Gravy (NOG) | KG-PTG-NOG-100 | 349 | OUT_OF_STOCK | none |
| Rawa Idli | KG-RID-220 | 359 | live | RasoiVita front+back |
| White Gravy | KG-WGR-100 | 369 | live | RasoiVita front+back |
| Biryani | KG-BIR-100 | 379 | OUT_OF_STOCK | old Kanta Greens |
| Moong Dal Halwa | KG-MDH-150 | 399 | live | RasoiVita front+back |
- All 7 live premixes have full back-label data (ingredients, method, weight, shelf life, allergens). The 4 out-of-stock ones still show "coming soon" for ingredients/method.
- White Gravy and All Purpose Gravy labels list onion + garlic powder, so their No Onion No Garlic flag was turned OFF (products + 2 recipe posts).
- Teas in DB have junk prices (two at Rs 1, Triphala sale price above price, a lowercase "lavender tea" entry). Hidden from customers; fix before relaunch.

## Done this session (2026-09-27 to 2026-11-13)
- SEO + AI crawlers (d83d954): sitemap.xml, robots.txt (explicitly allows GPTBot, ClaudeBot, PerplexityBot etc.), /llms.txt, metadataBase + canonicals (shop filter URLs collapse to /shop), JSON-LD (Organization/WebSite, Product + Breadcrumb, BlogPosting), JPG OG images, "Recipes" label renamed to "Blog".
- Product feed /feeds/products.csv (eea8827); manual WhatsApp catalog sheet docs/whatsapp-catalog-items.csv (columns: Name, Price (Recommended), Sale Price, Description, Link, Item Code, Country of origin).
- Prices raised to Rs 309 to 399, keeping relative order (DB + scripts/data/premixes.ts, 65240c5).
- RasoiVita pack photos (1feeac9): source PNGs in ~/Downloads/Rasoi Vita (tall 1476x3200 garden shots). Cropped to 1600px squares around the pack with blurred same-scene sides; uploaded as gt/products/premix/<slug>-front|back; old photos detached from products (still in Cloudinary). Files in scripts/data/images/<slug>-front.jpg / -back.jpg.
- Back-label data for Paneer Tikka, Chhole, White Gravy, All Purpose; recipe posts now say "RasoiVita <product>" (d38d6bc; both imports re-run).
- Hero: RasoiVita Paneer Tikka photo replaces old composite (24ca855; Cloudinary gt/hero/rasoivita-paneer-tikka, banner "Hero - IN").
- Brand text (e5de875): header/footer wordmark "RasoiVita™" + tagline, titles "%s | RasoiVita", home "RasoiVita by Kanta Greens ...", JSON-LD brand, feed brand, llms.txt. Kanta Greens kept for seller, copyright, contact, legal, blog author, Teas. "Kittu's Kitchen" removed; headings now "From Our Kitchen". Logo image (leafy K monogram) unchanged.
- Pushes: eea8827 (2026-09-27) and e5de875 (2026-11-13), both verified live.

## Uncommitted / in-flight
- Nothing in flight. This handoff commit is local until the owner approves a push (docs only, no deploy value).
- `.DS_Store` modified (ignore, never commit).
- Test order `KG-20260928-0001` ("Test Customer (Claude)") may still be in the prod DB; cancel or delete.

## Next / pending
1. Owner: submit https://www.kantagreens.com/sitemap.xml in Google Search Console and Bing Webmaster Tools (live, 200, ~35 URLs). Not yet confirmed done.
2. Owner: connect /feeds/products.csv in Meta Commerce Manager (Data sources > Data feed > Scheduled, daily) and link the catalog to the WhatsApp Business number; or add items by hand from the sheet (not both, or duplicates).
3. Owner: confirm White Gravy and All Purpose labels are right that they contain onion + garlic powder.
4. RasoiVita photos for Biryani, Coconut Chutney, Chhole NOG, Paneer NOG (or hide those products). Same crop pipeline as above.
5. Owner: check Vercel Firewall has no "AI Bots" block rule on.
6. Owner: real small UPI order from a phone, verified in Admin > Website Orders.
7. Owner review of live drafts: Refund policy, About story (STORY block in app/(public)/about/page.tsx).
8. Later: RasoiVita logo when designed (swap public/brand/kanta-greens-logo.png and Organization logo); Razorpay (deferred); order emails (Resend); FSSAI licence number on site; teas relaunch + clean tea prices.

## Open decisions
- Brand for teas when they relaunch (currently "Kanta Greens Teas").
- Farmers Market zone still labelled "home location", 2.5 km radius; banner/payment copy in DB may mention teas.
- Admin still shows US/UK/AU pricing and hero slots (unused while India-only).
- Optionally make patralekhthf the default gh account (`gh auth switch --user patralekhthf`).

## Gotchas
- Repo lives in iCloud-synced ~/Documents. macOS offloads files (`find . -flags +dataless`; 28k files on 2026-11-13) and makes "X 2" copies. Symptoms: dev server/tsc hang at 0% CPU, duplicate identifiers. Fix: `rm -rf .next && npm ci`, then `CHECKPOINT_DISABLE=1 ./node_modules/.bin/prisma generate`. Best fix: move repo out of iCloud or Finder > Keep Downloaded.
- Prisma CLI/tsx hang on telemetry without `CHECKPOINT_DISABLE=1`. Prefer `./node_modules/.bin/<tool>`. macOS has no `timeout`.
- `DATABASE_URL` in .env.local IS the prod Neon DB. Imports: `npm run db:import-premixes -- --dry-run` first; `--yes --skip-images` to update text without re-uploading. It overwrites ALL product text fields from scripts/data/premixes.ts, so diff against the DB first if the owner may have edited in admin. Import never deletes photos (detach old ones yourself).
- `npm run db:import-recipes -- --yes` re-uploads covers and updates posts (keeps publishedAt).
- Site shows product photos as squares (c_fill), hero as 4:5. Tall photos must be pre-cropped or packs get cut off.
- One-off DB scripts: use `pg` + `dotenv` in a .cjs file at repo root (needs node_modules), delete after. `lib/cloudinary.ts` is "server-only", configure the SDK directly.
- Prisma 7: relation writes need `connect`, not scalar FKs.
- Blog markdown (components/ui/SimpleMarkdown.tsx): ## headings, - bullets, **bold**, *italic*, ---. No numbered lists or links in posts; use "**1.** ..." paragraphs.
- Blog is an SEO channel: keep all posts published; no product links in posts unless asked.
- WhatsApp Business app cannot import a spreadsheet; bulk/sync only via Meta Commerce Manager.
- ~/Downloads/Rasoi Vita/RasoiVita_Rebrand_Prompt.md is the owner's prompt for redesigning packs with another tool; reference only.

## Docs map
- This file: docs/SESSION_HANDOFF.md (load with /RC)
- WhatsApp catalog sheet: docs/whatsapp-catalog-items.csv
- Brand + catalogue vocabulary + flags: lib/catalog.ts; company details: lib/business.ts; site URL, static pages, crawler lists: lib/site.ts; delivery: lib/shipping.ts
- SEO/AI routes: app/sitemap.ts, app/robots.ts, app/llms.txt/route.ts, app/feeds/products.csv/route.ts, components/ui/JsonLd.tsx
- Carts: lib/site-cart.ts (website), lib/farmers-market-cart.ts (WhatsApp); pricing/order numbers: lib/site-orders.ts
- Data + import scripts: scripts/data/premixes.ts, scripts/data/recipes.ts, scripts/import-premixes.ts, scripts/import-recipes.ts, images in scripts/data/images/
- Schema + migrations: prisma/schema.prisma, prisma/migrations/
- Storefront: app/(public)/*; admin: app/admin/(portal)/*; APIs: app/api/*
