import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { buildImageUrl } from "@/lib/cloudinary-url";
import { BRAND_TAGLINE, DISH_TYPES } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import { DELIVERY_PROMISE } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Kanta Greens is a delicacy of Kittu's Kitchen: healthy, hygienic, homemade masala premixes for busy bees who still want real home food.",
  alternates: { canonical: "/about" },
};

export const dynamic = "force-dynamic";

// ─── Story copy ───────────────────────────────────────────────────────────────
// Edit freely: everything here is drawn from the pack wording. Add the founder's
// own story (who Kittu is, how it started) when you're ready.
const STORY = {
  heading: "Real home food, for busy bees",
  paragraphs: [
    "Kanta Greens is a delicacy of Kittu's Kitchen. Every premix starts as a masala we'd cook with at home: the same spices, in the same proportions, blended so you don't have to.",
    "We know weeknights are busy. Chopping, roasting and grinding a dozen spices isn't always possible, but ready meals never taste like home. Our premixes sit in between: you still cook with fresh paneer, chana or vegetables, and we take care of the masala.",
    "Every pack is made in small batches in New Delhi, the way we'd make it for our own family: healthy, hygienic and homemade.",
  ],
};

const PROMISES = [
  { icon: "🌿", title: "100% natural ingredients", desc: "Real spices, dals and dried herbs. Nothing you wouldn't use at home." },
  { icon: "🎨", title: "No artificial colours", desc: "The colour in your sambhar or chhole comes from the spices themselves." },
  { icon: "🏠", title: "Healthy, hygienic, homemade", desc: "Made in small batches in a home-style kitchen, not a factory line." },
  { icon: "⏱️", title: "Quick & easy to cook", desc: "Mix with water, cook, add your fresh ingredients. That's it." },
];

const STEPS = [
  { n: "1", title: "Mix", desc: "Stir the premix into water, exactly as the pack says." },
  { n: "2", title: "Cook", desc: "Heat it in a pan or pressure cooker until the masala comes together." },
  { n: "3", title: "Add & serve", desc: "Add paneer, chana or vegetables, finish with a tadka if you like, and serve." },
];

export default async function AboutPage() {
  const [premixes, hero] = await Promise.all([
    db.product.findMany({
      where: { productLine: "PREMIX", status: "PUBLISHED" },
      select: { dishType: true, noOnionGarlic: true },
    }),
    db.banner.findFirst({
      where: { position: "hero", isActive: true, country: { code: "IN" } },
      select: { imageUrl: true },
    }),
  ]);

  const total = premixes.length;
  const nog = premixes.filter((p) => p.noOnionGarlic).length;
  const byDish = DISH_TYPES.map((d) => ({ ...d, count: premixes.filter((p) => p.dishType === d.slug).length })).filter(
    (d) => d.count > 0
  );

  return (
    <div className="bg-brand-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-green text-white">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/brand/kanta-greens-logo.png"
                alt=""
                width={56}
                height={56}
                className="rounded-full ring-2 ring-white/20"
                priority
              />
              <p className="text-sm text-white/70">{BRAND_TAGLINE}</p>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The taste of a home kitchen,
              <br />
              <span className="text-brand-sage">packed for your busy week</span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed max-w-xl">
              We make masala premixes the way we cook for our own family, so you can put real, home-style food
              on the table in minutes.
            </p>
          </div>

          {hero?.imageUrl && (
            <div className="relative hidden lg:block">
              <div className="absolute -inset-3 rounded-[2rem] border border-white/15 pointer-events-none" />
              <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                <Image
                  src={buildImageUrl(hero.imageUrl, "w_700,h_875,c_fill,f_webp,q_auto")}
                  alt="A spread of dishes made with Kanta Greens premixes"
                  fill
                  sizes="(max-width: 1024px) 0px, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">Our story</p>
        <h2
          className="text-3xl sm:text-4xl font-bold text-brand-green mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {STORY.heading}
        </h2>
        <div className="space-y-5 text-brand-dark/85 text-lg leading-relaxed">
          {STORY.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "first-letter:text-5xl first-letter:font-bold first-letter:text-brand-green first-letter:float-left first-letter:mr-2 first-letter:leading-none" : ""}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* ── Numbers ──────────────────────────────────────────────────────── */}
      {total > 0 && (
        <section className="bg-white border-y border-brand-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: String(total), label: "premixes and counting" },
              { value: String(nog), label: "No Onion No Garlic options" },
              { value: "3–4", label: "servings from every pack" },
              { value: "100%", label: "vegetarian range" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
                  {s.value}
                </p>
                <p className="text-sm text-brand-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Promises ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">What goes into every pack</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
            Our promise to your kitchen
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROMISES.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl border border-brand-border p-6 hover:shadow-md transition-shadow">
              <span className="text-3xl block mb-4">{p.icon}</span>
              <h3 className="font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {p.title}
              </h3>
              <p className="text-sm text-brand-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── No onion no garlic ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-brand-mint border border-brand-border p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
          <span className="text-6xl" aria-hidden>🧅</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Made for every kitchen, including yours
            </h2>
            <p className="text-brand-dark/80 leading-relaxed max-w-2xl">
              Many families cook without onion and garlic, for faith, fasting or simply taste. So most of our range is made
              that way, and our paneer tikka and chhole come in both versions. Look for the{" "}
              <strong>No Onion · No Garlic</strong> badge.
            </p>
          </div>
          <Link
            href="/shop?nog=1"
            className="inline-flex justify-center bg-brand-green text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-mid transition-colors text-sm whitespace-nowrap"
          >
            See No Onion No Garlic →
          </Link>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">Make your day easy</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
              With our recipe, it&apos;s three steps
            </h2>
          </div>
          <ol className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <li key={s.n} className="text-center">
                <span
                  className="inline-flex w-14 h-14 rounded-full bg-brand-green text-white text-xl font-bold items-center justify-center mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.n}
                </span>
                <h3 className="text-lg font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-brand-muted leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── The range ────────────────────────────────────────────────────── */}
      {byDish.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-3">The range</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
                From breakfast to dessert
              </h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-brand-green hover:text-brand-mid">
              Shop all premixes →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {byDish.map((d) => (
              <Link
                key={d.slug}
                href={`/shop?dish=${d.slug}`}
                className="group bg-white rounded-2xl border border-brand-border p-5 text-center hover:border-brand-sage hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-4xl block mb-3 transition-transform group-hover:scale-110">{d.icon}</span>
                <p className="text-sm font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>{d.label}</p>
                <p className="text-xs text-brand-muted mt-1">
                  {d.count} {d.count === 1 ? "premix" : "premixes"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Where to buy ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-brand-border p-7">
          <span className="text-3xl block mb-3">🚚</span>
          <h3 className="text-xl font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Delivered across India
          </h3>
          <p className="text-sm text-brand-muted leading-relaxed mb-4">
            Order on this website and pay by UPI. {DELIVERY_PROMISE}
          </p>
          <Link href="/shop" className="text-sm font-semibold text-brand-green hover:text-brand-mid">Shop now →</Link>
        </div>
        <div className="bg-white rounded-2xl border border-brand-border p-7">
          <span className="text-3xl block mb-3">🌱</span>
          <h3 className="text-xl font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Local in Delhi
          </h3>
          <p className="text-sm text-brand-muted leading-relaxed mb-4">
            Near us? Our Farmers Market takes orders on WhatsApp for local delivery the next working day.
          </p>
          <Link href="/farmers-market" className="text-sm font-semibold text-brand-green hover:text-brand-mid">
            Visit the Farmers Market →
          </Link>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="bg-brand-green text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Cook something good tonight
          </h2>
          <p className="text-white/75 mb-8">
            Questions, bulk orders or just want to say hello? {BUSINESS.customerCare} on WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="bg-white text-brand-green font-semibold px-7 py-3.5 rounded-full hover:bg-brand-mint transition-colors text-sm">
              Shop Premixes
            </Link>
            <Link href="/contact" className="border border-white/40 font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors text-sm">
              Contact Us
            </Link>
          </div>
          <p className="text-xs text-white/50 mt-8">
            Our teas are <Link href="/teas" className="underline">coming soon</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
