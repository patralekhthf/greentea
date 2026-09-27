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
import { BRAND_TAGLINE, DISH_TYPES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Kanta Greens — Ready-to-Cook Masala Premixes",
  description:
    "Ready-to-cook masala premixes from Kittu's Kitchen. Add water, heat, and your sambhar, chhole or paneer gravy is ready in minutes.",
};

export const dynamic = "force-dynamic";

// ─── How to use (mirrors the "How to use premix" panel on our packs) ─────────
const TRUST = [
  { icon: "💧", label: "Just add water" },
  { icon: "🔥", label: "Heat & cook" },
  { icon: "🥘", label: "Add paneer, chana or veggies" },
  { icon: "🏠", label: "Homemade taste" },
];

const STEPS = [
  {
    step: "01",
    title: "Mix with Water",
    desc: "Stir the premix into water as shown on the pack. No chopping, grinding or measuring a dozen spices.",
    icon: "💧",
  },
  {
    step: "02",
    title: "Heat & Cook",
    desc: "Cook it in a pan or pressure cooker. The masala comes together into a rich, home-style base.",
    icon: "🔥",
  },
  {
    step: "03",
    title: "Add & Serve",
    desc: "Add your paneer, chana or vegetables, give it a final tadka if you like, and serve it hot.",
    icon: "🍛",
  },
];

export default async function HomePage() {
  // Resolve country
  const cookieStore = await cookies();
  const rawCountry = cookieStore.get("gt_country")?.value ?? "IN";
  const country = isValidCountry(rawCountry) ? rawCountry : "IN";
  const { currencySymbol } = COUNTRY_CONFIG[country];

  // Parallel fetches — bestsellers + latest journal posts + country hero image
  const [bestsellers, journalPosts, heroBanner] = await Promise.all([
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
    db.banner.findFirst({
      where: {
        position:  "hero",
        isActive:  true,
        country:   { code: country },
      },
      select: { imageUrl: true, title: true },
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ─── Left: copy ─────────────────────────────────────────────── */}
            <div>
              {/* Eyebrow */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                  <span>🌿</span>
                  <span>{BRAND_TAGLINE}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-brand-gold/20 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-brand-gold/30">
                  <span>🥘</span>
                  <span>Ready-to-cook masala premixes</span>
                </div>
              </div>

              {/* Headline */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] mb-6 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Homemade Taste,
                <br />
                <span className="text-brand-sage">Ready in Minutes</span>
              </h1>

              {/* Sub */}
              <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-xl">
                Healthy, hygienic, homemade — for busy bees. Our dry masala premixes turn into sambhar,
                chhole or paneer tikka gravy with just water and heat. You add the fresh ingredients; we&apos;ve done the rest.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-brand-green font-semibold px-7 py-3.5 rounded-full hover:bg-brand-mint transition-colors text-sm shadow-lg shadow-black/10"
                >
                  Shop Premixes
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors text-sm"
                >
                  How It Works
                </a>
              </div>

              {/* Microcopy */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
                {["No chopping or grinding", "No onion no garlic options", "Order on WhatsApp in Delhi"].map((line) => (
                  <span key={line} className="inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {line}
                  </span>
                ))}
              </div>
            </div>

            {/* ─── Right: country-specific hero image (or fallback) ───────── */}
            <div className="relative hidden lg:block">
              {heroBanner?.imageUrl ? (
                <div className="relative">
                  {/* Decorative offset frame */}
                  <div className="absolute -inset-4 rounded-[2rem] border border-white/15 pointer-events-none" />
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-brand-gold/20 blur-2xl pointer-events-none" />
                  <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                    <Image
                      src={buildImageUrl(heroBanner.imageUrl, "w_800,h_1000,c_fill,f_webp,q_auto")}
                      alt={heroBanner.title ?? "Kanta Greens"}
                      fill
                      sizes="(max-width: 1024px) 0px, 50vw"
                      className="object-cover"
                      priority
                    />
                    {/* Bottom-left floating badge */}
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                        <span className="text-base">💧</span>
                        <span className="text-xs font-semibold text-brand-green">Just add water</span>
                      </div>
                      <div className="bg-brand-green/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-semibold text-white">Heat &amp; serve</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback decorative illustration when no banner uploaded
                <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden bg-gradient-to-br from-brand-sage/30 via-brand-green to-brand-dark ring-1 ring-white/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-3/5 h-3/5 text-white/15" viewBox="0 0 200 200" fill="none">
                      {/* Stylized leaf (brand mark) */}
                      <path
                        d="M100,20 C60,40 30,90 60,160 C90,140 130,100 130,55 C125,35 115,25 100,20 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M100,20 L75,155"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.5"
                      />
                      <path d="M85,60 Q92,65 95,75" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
                      <path d="M82,90 Q90,95 95,105" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
                      <path d="M78,120 Q88,125 92,135" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
                    </svg>
                  </div>
                </div>
              )}
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
      {/* SHOP BY DISH                                                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
            Shop by Dish
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-green"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What&apos;s Cooking Today?
          </h2>
          <p className="mt-4 text-brand-muted max-w-xl mx-auto">
            From a quick breakfast to Sunday&apos;s chhole, there&apos;s a premix for it.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DISH_TYPES.map((d) => (
            <Link
              key={d.slug}
              href={`/shop?dish=${d.slug}`}
              className="group flex flex-col items-center text-center p-6 rounded-2xl border border-brand-border bg-white hover:border-brand-sage hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-4xl mb-3 transition-transform group-hover:scale-110">{d.icon}</span>
              <h3
                className="text-sm font-bold text-brand-green group-hover:text-brand-mid"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {d.label}
              </h3>
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
                Our Premixes
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-brand-green"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pick Tonight&apos;s Dish
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
              Our premixes are arriving soon. Check back shortly.
            </p>
          )}

          {/* Mobile view-all */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors"
            >
              View All Premixes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-brand-cream py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">
              How It Works
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-brand-green"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three Steps to Dinner
            </h2>
            <p className="mt-4 text-brand-muted max-w-xl mx-auto">
              Every pack has its own instructions printed on the back. This is the idea.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line — visible on desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-brand-border" aria-hidden />

            {STEPS.map((r) => (
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
              From Kittu&apos;s Kitchen
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-brand-green mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Home Cooking,
              <br />Without the Prep
            </h2>
            <p className="text-brand-muted leading-relaxed mb-5">
              Every Kanta Greens premix is a delicacy of Kittu&apos;s Kitchen: healthy, hygienic, homemade masalas, packed for busy bees who still want real home food.
            </p>
            <p className="text-brand-muted leading-relaxed mb-8">
              The spices are already blended in the right proportions. You bring the fresh paneer, chana or vegetables, and a home-style dish is ready in minutes.
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
              { icon: "🥄", title: "No Measuring",        desc: "Every spice is already in the pack, in the right amount." },
              { icon: "🍳", title: "Cook Easy",           desc: "Water, heat and your fresh ingredients. That's the recipe." },
              { icon: "🧄", title: "No Onion No Garlic",  desc: "Separate packs for households that skip onion and garlic." },
              { icon: "💬", title: "Order on WhatsApp",   desc: "Local delivery in Delhi through our Farmers Market." },
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
      {/* TEAS — COMING SOON                                                       */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-green text-white py-16 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-brand-gold/20 border border-brand-gold/30 px-3 py-1.5 rounded-full mb-5">
            Coming soon
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kanta Greens Teas
          </h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">
            Our tea collection isn&apos;t available to order yet. Join the waitlist and we&apos;ll tell you the day it launches.
          </p>
          <Link
            href="/teas"
            className="inline-flex items-center gap-2 bg-white text-brand-green font-semibold px-7 py-3.5 rounded-full hover:bg-brand-mint transition-colors text-sm"
          >
            Join the Tea Waitlist →
          </Link>
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
                Recipes
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-brand-green"
                style={{ fontFamily: "var(--font-display)" }}
              >
                From Kittu&apos;s Kitchen
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
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🍲</div>
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
              All Recipes
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
            New premixes, recipes and launch offers, straight to your inbox. No spam, ever.
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
