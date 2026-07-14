# Kanta Greens — Session Handoff

## Last updated
2026-05-18. Farmers Market end-to-end flow shipped: WhatsApp Cart, cart/order persistence, admin fulfillment, IP country detection, and Phase 1 in-checkout UPI payment. Waiting on user to (a) configure a custom domain and (b) fill UPI credentials in `/admin/farmers-market`.

## Live URLs & repo
- App (production preview): https://greentea-sigma.vercel.app
- GitHub: https://github.com/patralekhthf/greentea, branch `main`
- Vercel: connected to `main`; every push to `main` deploys to production
- Admin entry: `/admin/login` (redirects unauth users via `proxy.ts`)

## Infra & deploy model
- Next.js 16.2.6 (App Router, Turbopack). Uses `proxy.ts` (Next 16 renamed middleware). Do NOT create a `middleware.ts`, Next 16 errors out if both exist.
- Prisma 7 + `@prisma/adapter-pg` + Neon Postgres. All tables prefixed `tblgt_`. Connection URL set in `prisma.config.ts`, adapter passed to `PrismaClient` in `lib/db.ts`.
- Build command (runs on Vercel):
  `prisma generate && prisma migrate deploy && next build`
- Cloudinary for images. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` must be set in Vercel envs or admin previews break.
- Client-safe URL builder: `lib/cloudinary-url.ts`. Server-only SDK: `lib/cloudinary.ts`.

## Feature flags & env (names only)
- `DATABASE_URL` (Neon) — required
- `ADMIN_JWT_SECRET` — required
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — required
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required for uploads
- `RESEND_API_KEY` — optional, only if newsletter uses it
- No app-side feature flags. UPI in-checkout is toggled implicitly by whether `LocalDeliveryZone.upiVpa` is set in the DB.

## Done this session (recent commits, newest first)
- 38a6e3d — strip `referrer` from meta before spreading into order create (Order model has no referrer column, Cart does)
- c4703cf — Prisma 7 requires `cart: { connect: { id } }` for relation link, not scalar `cartId`
- a28ec60 — verify cart exists before linking; wrap create in try/catch; client parses non-JSON errors and clears stale `gt_fm_cart_id_v1`
- 111501c — hero image admin: fix landscape guidance to portrait 4:5 (1200x1500), preview thumb now uses same Cloudinary transform as home
- 3c5c3dc — feat(upi): Phase 1. New fields on LocalDeliveryZone (upiVpa, upiPayeeName, upiInstructions) and on FarmersMarketOrder (upiVpa, upiUtr, paymentSubmittedAt, paymentVerified, paymentVerifiedAt). Client-side dynamic QR (qrcode lib) with pre-filled amount + order number. Screenshot reminder in UI and in WhatsApp message. Admin drawer has Payment section + Verify toggle. Migration: `20260518100000_upi_payment_phase1`.
- cf117c4 — deleted `middleware.ts`, kept `proxy.ts`, added Vercel header fast path
- 16df177 — country IP detection via `x-vercel-ip-country` (with ipapi.co fallback in `proxy.ts`); DeliveryZoneMap auto-geolocates silently if permission already granted; FloatingCart is collapsible + draggable on desktop (position persisted to localStorage keys `gt_fm_cart_pos_v1` and `gt_fm_cart_collapsed_v1`); UPI made the only enabled payment method, others greyed out with a Soon badge
- f6dfc19 — persistent WhatsApp Cart panel, cart + order DB tables, admin `/farmers-market/orders` and `/farmers-market/carts`. Migration: `20260517210000_farmers_market_orders`.

## Uncommitted / in-flight
- `.DS_Store` modified (ignore, macOS junk).
- Nothing else uncommitted. All fixes are on `main`.
- User has NOT yet filled in UPI credentials in `/admin/farmers-market` (VPA `kumarikanta218@oksbi`, Payee `Kanta Kumari`). Until saved, the pay step is skipped and orders still work the old way.

## Next / pending
1. User to attach custom domain in Vercel. Playbook was given: apex A record `76.76.21.21`, `www` CNAME `cname.vercel-dns.com`. If Cloudflare, keep proxy off during SSL provisioning.
2. User to fill UPI VPA + Payee Name at `/admin/farmers-market` after next deploy stabilizes.
3. Phase 2 UPI (later): Razorpay UPI or Cashfree for automatic verification via webhook. Deferred until Phase 1 volume justifies it.
4. Hero image: current Taj Mahal asset is landscape and gets cropped. User needs to re-upload a 4:5 portrait crop (1200x1500).
5. No pending code work from Claude; next work starts when user reports how the redeployed checkout behaves.

## Open decisions
- Domain name: user said domain is registered but has not shared it. Waiting on the domain before DNS help can be specific.
- Whether to expand supported countries in `proxy.ts` (currently IN, US, GB, AU). Left as-is.

## Gotchas
- Prisma 7 strictness: cannot pass scalar `cartId` inside `create({ data })` when a relation `cart` is defined. Must use `cart: { connect: { id } }`. Learned the hard way in c4703cf.
- Prisma 7 rejects unknown fields at insert time. `getRequestMeta()` returns `referrer` which only exists on `FarmersMarketCart`, not `FarmersMarketOrder`. Strip it before spreading into order create (38a6e3d).
- `middleware.ts` and `proxy.ts` cannot coexist in Next 16, build errors out. Only `proxy.ts` is valid.
- `x-vercel-ip-country` is only set on Vercel edge. `proxy.ts` has an ipapi.co fallback for other hosts.
- FarmersMarket is India-only in current logic: banner only shows when `country === "IN"`, pincode regex is Indian, WhatsApp uses `wa.me/91...`, prices formatted INR, mobile validated as 10-digit Indian.
- Order POST used to silently 500 when localStorage held a stale cartId. Now verifies + auto-heals + returns `cartIdInvalid: true` to signal client to wipe the cached id.
- Vercel geo headers may reflect edge datacenter for some VPN/dev-tunnel scenarios (saw `US Phoenix` for what should be an Indian visitor). Not fatal, just logged.
- Cart is localStorage-first; server sync is debounced (350ms) and single-flight (module-level promise `createPromise`). If offline, cart still works locally; sync fails silently.

## Docs map
- Schema: `prisma/schema.prisma` (Prisma 7). Migrations under `prisma/migrations/`.
- Cart lib: `lib/farmers-market-cart.ts` (localStorage + debounced sync + `useCart` hook).
- Request meta helper (IP/geo/user-agent): `lib/request-meta.ts`.
- Cart UI: `components/local/FloatingCart.tsx` (draggable desktop panel + mobile bottom sheet).
- Add to cart modal: `components/local/QuickAddModal.tsx`.
- Delivery zone map (Leaflet): `components/local/DeliveryZoneMap.tsx`.
- UPI payment step: `components/local/UpiPaymentStep.tsx`.
- Customer order flow: `app/(public)/farmers-market/order/OrderReviewClient.tsx` (steps review > pay > sent).
- Admin farmers market: `app/admin/(portal)/farmers-market/` (FarmersMarketClient, orders, carts).
- APIs: `app/api/farmers-market/{cart,orders}/*` (public), `app/api/admin/farmers-market/*` (admin, auth via `verifyAdminToken`).
- Proxy (country detect + admin gate): `proxy.ts`.
- Admin auth: `lib/admin-auth.ts`, cookie `gt_admin_session`.
