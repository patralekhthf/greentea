# Green Tea Portal — Claude Context

## Project Identity
- **Repo:** https://github.com/patralekhthf/greentea.git
- **Local:** /Users/patralekh/Documents/Claude/Projects/GreenTea
- **GitHub account:** patralekhthf
- **This is NOT patralekh.com** — completely separate repo, separate Neon project, separate Netlify site, separate Fly.io app, separate Razorpay account

## What We're Building
Premium organic green & herbal tea commerce platform. India = direct checkout (Razorpay). USA/UK/AU = Amazon redirect only.

## Stack (do not suggest alternatives)
| Layer | Choice |
|---|---|
| Frontend | Next.js 16, App Router, Turbopack |
| UI | React 19, TypeScript strict |
| Styling | Tailwind CSS v4 + @tailwindcss/postcss |
| ORM | Prisma 7 + @prisma/adapter-pg + pg (NOT Neon adapter) |
| Database | Neon PostgreSQL — separate project from patralekh.com |
| API | Next.js API Routes (no Express/NestJS) |
| Hosting | Netlify (frontend + API), Fly.io (Go service), Neon (DB) |
| Email | Resend |
| Payments | Razorpay (India only, Phase 1) |
| Images | Cloudinary (folder prefix: gt/) |
| Geo-IP | ipapi.co (free, no key) |
| Go service | services/analytics/ — stdlib net/http + pgx + Docker |

## Database Rules
- All tables prefixed `tblgt_` — e.g. `tblgt_products`, `tblgt_orders`
- Prisma model names are PascalCase without prefix — e.g. `Product`, `Order`
- Use `@prisma/adapter-pg` + `pg` driver, NOT `@neondatabase/serverless`
- Prisma 7 breaking change: `url` is NOT in `schema.prisma`; it lives in `prisma.config.ts` under `datasource.url`
- Adapter (`PrismaPg`) is passed to `PrismaClient` constructor in `lib/db.ts`
- Migrations: `npm run db:migrate` locally, `npm run db:migrate:deploy` in CI

## Architecture Rules
- Modular monolith — no microservices
- Admin portal lives at `app/(admin)/` route group, protected by middleware
- Go analytics service lives at `services/analytics/` with its own Dockerfile + fly.toml
- Each feature's frontend and API routes are co-located in the Next.js app

## Commerce Rules
| Country | Code | Commerce | Currency |
|---|---|---|---|
| India | IN | Cart + Razorpay checkout | INR ₹ |
| USA | US | Amazon redirect | USD $ |
| UK | GB | Amazon redirect | GBP £ |
| Australia | AU | Amazon redirect | AUD A$ |

Country detected via: manual override > cookie > ipapi.co > browser locale > India (default)

## Key Environment Variables
```
DATABASE_URL                   # Neon connection string (pooled)
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RESEND_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
ADMIN_JWT_SECRET
ANALYTICS_SERVICE_URL          # Fly.io Go service
ANALYTICS_SERVICE_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

## Naming Conventions
- DB tables: `tblgt_` + snake_case
- Components: PascalCase `.tsx`
- API routes: kebab-case (`/api/notify-me`, `/api/payments/webhook`)
- Cloudinary folders: `gt/<entity>/<type>/`
- Order numbers: `GT-YYYYMMDD-XXXX`
- Git branches: `feature/<description>`

## Docs in This Folder
- `BRD_46_SECTIONS.docx` — Business Requirements Document
- `TECH_SPEC_40_SECTIONS.docx` — Original tech spec (not followed — stack above overrides)
- `TECH_SPEC_CUSTOM.docx` — Our actual tech spec aligned to this stack
