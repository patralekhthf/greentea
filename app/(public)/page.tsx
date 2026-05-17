import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import NewsletterForm from "@/components/ui/NewsletterForm";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import { COUNTRY_CONFIG, isValidCountry } from "@/lib/ipapi";
import { db } from "@/lib/db";
import { buildImageUrl } from "@/lib/cloudinary-url";

export const metadata: Metadata = {
  title: "Kanta Greens — Premium Organic Teas",
  description:
    "Discover premium organic green and herbal teas crafted for your wellness journey. Sourced from India's finest gardens.",
};

export const dynamic = "force-dynamic";

// ─── Wellness categories ──────────────────────────────────────────────────────
const WELLNESS = [
  { icon: "🌙", title: "Better Sleep",      desc: "Calming blends to help you unwind and sleep deeper.",     href: "/shop?wellness=better-sleep" },
  { icon: "🧘", title: "Stress Relief",     desc: "Adaptogenic herbs to quiet the mind and ease tension.",    href: "/shop?wellness=stress-relief" },
  { icon: "🌿", title: "Detox & Cleanse",   desc: "Purifying blends to support your body's natural detox.",   href: "/shop?wellness=detox" },
  { icon: "🛡️", title: "Immunity Support",  desc: "Antioxidant-rich teas to strengthen your defences.",       href: "/shop?wellness=immunity-support" },
  { icon: "⚖️", title: "Weight Management", desc: "Metabolism-boosting green teas to support your goals.",    href: "/shop?wellness=weight-management" },
  { icon: "⚡", title: "Energy & Focus",    desc: "Clean energy without the crash — naturally caffeinated.",  href: "/shop?wellness=energy-focus" },
];

const TRUST = [
  { icon: "🌱", label: "100% Organic" },
  { icon: "🔬", label: "Lab Certified" },
  { icon: "🚫", label: "No Additives" },
  { icon: "🤝", label: "Ethically Sourced" },
];

// ─── Brewing ritual steps ─────────────────────────────────────────────────────
const RITUAL = [
  {
    step: "01",
    title: "Choose Your Blend",
    desc: "Browse teas curated by wellness intention — sleep, energy, calm, immunity. Find what your body asks for today.",
    icon: "🍃",
  },
  {
    step: "02",
    title: "Brew with Care",
    desc: "Use filtered water at the right temperature. Let the leaves unfurl for 3–5 minutes. The wait is part of the ritual.",
    icon: "🫖",
  },
  {
    step: "03",
    title: "Savor the Moment",
    desc: "Sip slowly. Breathe deeply. A few quiet minutes with the right tea can reset your entire day.",
    icon: "🌅",
  },
];

// ─── Testimonials (realistic placeholders — editable later) ───────────────────
const TESTIMONIALS = [
  {
    quote:
      "I've tried every sleep tea on the market. Kanta's chamomile blend is the first one that actually lives up to the hype. My evenings feel calmer.",
    name: "Aanya Sharma",
    title: "Yoga instructor · Bengaluru",
    rating: 5,
  },
  {
    quote:
      "The Tulsi Green has become my morning non-negotiable. Smooth, no bitterness, and I feel genuinely sharper through the day.",
    name: "Rohan Mehta",
    title: "Product designer · Mumbai",
    rating: 5,
  },
  {
    quote:
      "Beautiful packaging, thoughtful blends, and you can taste the difference. This is the first tea brand that feels like it's made with intention.",
    name: "Priya Iyer",
    title: "Wellness writer · Delhi",
    rating: 5,
  },
];

// Country-specific trust microcopy shown under the hero CTAs
const HERO_TRUST_COPY: Record<
  "IN" | "US" | "GB" | "AU",
  { shipping: string; freshness: string; testing: string }
> = {
  IN: {
    shipping:  "Free shipping over ₹499",
    freshness: "100-day freshness guarantee",
    testing:   "Lab-tested for purity",
  },
  US: {
    shipping:  "Free shipping with Amazon Prime",
    freshness: "100-day freshness guarantee",
    testing:   "Lab-tested for purity",
  },
  GB: {
    shipping:  "Free delivery via Amazon UK",
    freshness: "100-day freshness guarantee",
    testing:   "Lab-tested for purity",
  },
  AU: {
    shipping:  "Free delivery via Amazon AU",
    freshness: "100-day freshness guarantee",
    testing:   "Lab-tested for purity",
  },
};

// Country-specific secondary CTA
const HERO_SECONDARY_CTA: Record<
  "IN" | "US" | "GB" | "AU",
  { label: string; href: string }
> = {
  IN: { label: "Explore Bestsellers",  href: "/shop?sort=bestseller" },
  US: { label: "Shop on Amazon US",    href: "/shop?sort=bestseller" },
  GB: { label: "Shop on Amazon UK",    href: "/shop?sort=bestseller" },
  AU: { label: "Shop on Amazon AU",    href: "/shop?sort=bestseller" },
};

export default async function HomePage() {
  // Resolve country
  const cookieStore = await cookies();
  const rawCountry = cookieStore.get("gt_country")?.value ?? "IN";
  const country = isValidCountry(rawCountry) ? rawCountry : "IN";
  const { currencySymbol } = COUNTRY_CONFIG[country];
  const trustCopy = HERO_TRUST_COPY[country];
  const secondaryCta = HERO_SECONDARY_CTA[country];

  // Parallel fetches — bestsellers + latest journal posts
  const [bestsellers, journalPosts] = await Promise.all([
    getProducts({ country, sort: "bestseller" }).then((p) => p.slice(0, 4)),
    db.blog.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
      },
    }),
  ]);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                     */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-brand-green">
        {/* Decorative organic shapes */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[24rem] h-[24rem] rounded-full bg-white/[0.04] pointer-events-none" />

        {/* Subtle leaf flourish — top right */}
        <svg
          className="absolute top-12 right-12 w-32 h-32 text-white/[0.06] hidden md:block pointer-events-none"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50,5 C25,25 15,55 35,85 C50,75 70,55 65,30 C60,15 55,8 50,5 Z" />
          <path d="M50,5 L50,90" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            {/* Eyebrow with rating */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                <span>🌿</span>
                <span>Premium Organic · Wellness Teas</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-brand-gold/20 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-brand-gold/30">
                <span className="text-brand-gold">★</span>
                <span>4.8 · Loved by 5,000+ tea drinkers</span>
              </div>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nature&apos;s Finest,
              <br />
              <span className="text-brand-sage">Steeped in Care</span>
            </h1>

            {/* Sub */}
            <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-xl">
              Premium organic teas sourced from India&apos;s finest gardens — crafted for your daily wellness ritual, not just your cup.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-brand-green font-semibold px-7 py-3.5 rounded-full hover:bg-brand-mint transition-colors text-sm shadow-lg shadow-black/10"
              >
                Shop All Teas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                {secondaryCta.label}
              </Link>
            </div>

            {/* Trust microcopy — country-aware */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
              {[trustCopy.shipping, trustCopy.freshness, trustCopy.testing].map((line) => (
                <span key={line} className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TRUST BAR                                                                */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-mint border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-sm font-medium text-brand-green">
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* WELLNESS GOALS                                                           */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
            Shop by Wellness Goal
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-green"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Find Your Perfect Blend
          </h2>
          <p className="mt-4 text-brand-muted max-w-xl mx-auto">
            Every body is different. Every cup should be too.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {WELLNESS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="group flex flex-col items-center text-center p-5 rounded-2xl border border-brand-border bg-white hover:border-brand-sage hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-3xl mb-3 transition-transform group-hover:scale-110">{w.icon}</span>
              <h3
                className="text-sm font-bold text-brand-green mb-1.5 group-hover:text-brand-mid"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {w.title}
              </h3>
              <p className="text-xs text-brand-muted leading-snug hidden sm:block">{w.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* BESTSELLERS — real DB products                                           */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-brand-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
                Our Bestsellers
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-brand-green"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Loved by Thousands
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {bestsellers.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  country={country}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-muted py-12">
              Our blends are arriving soon. Check back shortly.
            </p>
          )}

          {/* Mobile view-all */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors"
            >
              View All Teas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* BREWING RITUAL                                                           */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
              The Kanta Ritual
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-brand-green"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three Steps to a Better Day
            </h2>
            <p className="mt-4 text-brand-muted max-w-xl mx-auto">
              Tea isn&apos;t just a drink — it&apos;s a pause. A return to yourself.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line — visible on desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-brand-border" aria-hidden />

            {RITUAL.map((r) => (
              <div key={r.step} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative w-24 h-24 rounded-full bg-white border-2 border-brand-sage flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-4xl">{r.icon}</span>
                  <span
                    className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {r.step}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold text-brand-green mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {r.title}
                </h3>
                <p className="text-sm text-brand-muted leading-relaxed max-w-xs">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* BRAND STORY                                                              */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
              Our Promise
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-brand-green mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Wellness is a Ritual,
              <br />Not a Product
            </h2>
            <p className="text-brand-muted leading-relaxed mb-5">
              At Kanta Greens, we believe the best teas are the ones you reach for every morning — not because you have to, but because they make you feel genuinely good.
            </p>
            <p className="text-brand-muted leading-relaxed mb-8">
              Every blend is formulated with intention. Every ingredient is chosen for its proven wellness benefit. Every batch is lab-tested before it reaches you.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors group"
            >
              Our Story
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🌱", title: "Organically Grown",   desc: "Certified organic farms, no pesticides." },
              { icon: "🔬", title: "Lab Tested",          desc: "Every batch tested for purity and potency." },
              { icon: "📦", title: "Freshly Packed",      desc: "Sealed within 48 hours of blending." },
              { icon: "🌍", title: "Global Reach",        desc: "Available on Amazon in US, UK, and AU." },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-2xl border border-brand-border bg-white hover:shadow-md transition-shadow">
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3
                  className="text-sm font-bold text-brand-green mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {f.title}
                </h3>
                <p className="text-xs text-brand-muted leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-green text-white py-20 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
              What Customers Say
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Real Cups. Real Stories.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 flex flex-col"
              >
                {/* Stars */}
                <div className="flex text-brand-gold mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                {/* Quote */}
                <blockquote className="text-white/90 text-sm leading-relaxed mb-6 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                {/* Attribution */}
                <div className="pt-5 border-t border-white/10">
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {t.name}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* FROM THE JOURNAL                                                         */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {journalPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
                From the Journal
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-brand-green"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Stories, Tips & Rituals
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors group"
            >
              Read All
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {journalPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-[16/10] bg-brand-mint overflow-hidden">
                  {post.coverImageUrl ? (
                    <Image
                      src={buildImageUrl(post.coverImageUrl, "w_500,h_315,c_fill,f_webp,q_auto")}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🍵</div>
                  )}
                </div>
                <div className="p-5">
                  {post.publishedAt && (
                    <p className="text-xs text-brand-muted mb-2">
                      {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                  <h3
                    className="text-base font-bold text-brand-green leading-snug mb-2 group-hover:text-brand-mid transition-colors line-clamp-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-brand-muted leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile read-all */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors"
            >
              Read All Posts
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* NEWSLETTER                                                               */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-mint border-t border-brand-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <span className="text-3xl block mb-4">📬</span>
          <h2
            className="text-2xl sm:text-3xl font-bold text-brand-green mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Stay in the Loop
          </h2>
          <p className="text-brand-muted mb-8">
            New blends, wellness tips, and launch offers — straight to your inbox. No spam, ever.
          </p>
          <NewsletterForm />
          <p className="text-xs text-brand-muted mt-4">
            By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </>
  );
}
