import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/ui/NewsletterForm";

export const metadata: Metadata = {
  title: "Kanta Greens — Premium Organic Teas",
  description:
    "Discover premium organic green and herbal teas crafted for your wellness journey. Sourced from India's finest gardens.",
};

// ─── Wellness categories ──────────────────────────────────────────────────────
const WELLNESS = [
  {
    icon: "🌙",
    title: "Better Sleep",
    desc: "Calming blends to help you unwind and sleep deeper.",
    href: "/wellness/better-sleep",
  },
  {
    icon: "🧘",
    title: "Stress Relief",
    desc: "Adaptogenic herbs to quiet the mind and ease tension.",
    href: "/wellness/stress-relief",
  },
  {
    icon: "🌿",
    title: "Detox & Cleanse",
    desc: "Purifying blends to support your body's natural detox.",
    href: "/wellness/detox",
  },
  {
    icon: "🛡️",
    title: "Immunity Support",
    desc: "Antioxidant-rich teas to strengthen your defences.",
    href: "/wellness/immunity-support",
  },
  {
    icon: "⚖️",
    title: "Weight Management",
    desc: "Metabolism-boosting green teas to support your goals.",
    href: "/wellness/weight-management",
  },
  {
    icon: "⚡",
    title: "Energy & Focus",
    desc: "Clean energy without the crash — naturally caffeinated.",
    href: "/wellness/energy-focus",
  },
];

// ─── Placeholder featured products ───────────────────────────────────────────
const PLACEHOLDER_PRODUCTS = [
  {
    name: "Tulsi Green Tea",
    tagline: "Stress Relief · Immunity",
    rating: 4.8,
    reviews: 2140,
    badge: "Bestseller",
  },
  {
    name: "Chamomile Calm",
    tagline: "Better Sleep · Relaxation",
    rating: 4.9,
    reviews: 1870,
    badge: "Top Rated",
  },
  {
    name: "Detox Spice Blend",
    tagline: "Detox · Digestion",
    rating: 4.7,
    reviews: 1320,
    badge: "New",
  },
  {
    name: "Ashwagandha Gold",
    tagline: "Stress Relief · Energy",
    rating: 4.8,
    reviews: 980,
    badge: "Ayurvedic",
  },
];

// ─── Trust points ─────────────────────────────────────────────────────────────
const TRUST = [
  { icon: "🌱", label: "100% Organic" },
  { icon: "🔬", label: "Lab Certified" },
  { icon: "🚫", label: "No Additives" },
  { icon: "🤝", label: "Ethically Sourced" },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-green">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <span>🌿</span>
              <span>Premium Organic · Wellness Teas</span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nature&apos;s Finest,
              <br />
              <span className="text-brand-sage">Steeped in Care</span>
            </h1>

            {/* Sub */}
            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Premium organic teas sourced from India&apos;s finest gardens — crafted for your daily wellness ritual, not just your cup.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-brand-green font-semibold px-7 py-3.5 rounded-full hover:bg-brand-mint transition-colors text-sm"
              >
                Shop All Teas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/wellness"
                className="inline-flex items-center gap-2 bg-transparent text-white border border-white/40 font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                Explore Wellness
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────────── */}
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

      {/* ── Wellness categories ───────────────────────────────────────────────── */}
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
              className="group flex flex-col items-center text-center p-5 rounded-2xl border border-brand-border bg-white hover:border-brand-sage hover:shadow-md transition-all"
            >
              <span className="text-3xl mb-3">{w.icon}</span>
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

      {/* ── Featured products ─────────────────────────────────────────────────── */}
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {PLACEHOLDER_PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="group rounded-2xl border border-brand-border overflow-hidden hover:shadow-lg transition-all bg-brand-cream"
              >
                {/* Image placeholder */}
                <div className="aspect-square bg-brand-mint flex items-center justify-center relative">
                  <span className="text-5xl">🍵</span>
                  <span className="absolute top-3 left-3 text-xs font-semibold bg-brand-green text-white px-2.5 py-1 rounded-full">
                    {p.badge}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="font-bold text-brand-green text-sm mb-0.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p.name}
                  </h3>
                  <p className="text-xs text-brand-muted mb-3">{p.tagline}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-brand-gold text-sm">★</span>
                    <span className="text-xs font-semibold text-brand-dark">{p.rating}</span>
                    <span className="text-xs text-brand-muted">({p.reviews.toLocaleString()})</span>
                  </div>

                  {/* CTA — non-functional Phase 1 */}
                  <button
                    disabled
                    className="w-full text-xs font-semibold py-2.5 rounded-full border border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Coming soon"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand story strip ─────────────────────────────────────────────────── */}
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-mid transition-colors"
            >
              Our Story
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div key={f.title} className="p-5 rounded-2xl border border-brand-border bg-white">
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

      {/* ── Newsletter ────────────────────────────────────────────────────────── */}
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
