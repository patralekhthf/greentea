import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";
import DeliveryZoneMap from "@/components/local/DeliveryZoneMap";
import FarmersMarketProductCard from "@/components/local/FarmersMarketProductCard";
import CartFab from "@/components/local/CartFab";

export const metadata: Metadata = {
  title: "Farmers Market — Fresh Local Delivery",
  description:
    "Get ultra-fresh, zero-preservative teas delivered locally. Order via WhatsApp, pay via UPI or GPay.",
};

export const dynamic = "force-dynamic";

export default async function FarmersMarketPage() {
  // Fetch zone config — must be active
  const zone = await db.localDeliveryZone.findUnique({ where: { id: "default" } });
  if (!zone || !zone.isActive) notFound();

  // Fetch products available in India with primary image + IN config
  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      countryConfigs: { some: { country: { code: "IN" }, isAvailable: true } },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1, select: { cloudinaryPublicId: true } },
      countryConfigs: { where: { country: { code: "IN" } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-green via-brand-mid to-brand-dark text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-5 border border-brand-gold/30">
              <span>🌱</span>
              <span>Local Farmers Market · {zone.addressLabel}</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ultra-Fresh Teas, <br className="hidden sm:block" />
              <span className="text-brand-sage">Delivered Locally</span>
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-2xl">
              Every order is freshly packed the night before or same morning it ships — you get a full 14 days of freshness from the day you receive it. Order via WhatsApp, pay via UPI.
            </p>

            {/* Value chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20">
                <span>🚫</span> Zero preservatives
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20">
                <span>📦</span> Packed fresh on your order
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20">
                <span>🛵</span> Ships next working day
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20">
                <span>📅</span> Full 14 days freshness
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20">
                <span>💸</span> Pay via UPI / GPay
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/farmers-market/order"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm shadow-lg shadow-black/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/>
                </svg>
                Start your WhatsApp Cart
              </Link>
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/20 transition-colors text-sm border border-white/30"
              >
                Browse fresh teas ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Pick your blend", desc: "Browse below or tap 'Build Your Order' to select multiple products." },
              { n: "2", title: "Review & send", desc: "Choose quantity, payment method — 'Place Order' sends everything via WhatsApp." },
              { n: "3", title: "Packed fresh & shipped", desc: "We pack your order fresh the night before / same morning, and ship next working day. Full 14-day freshness guaranteed." },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-brand-mint text-brand-green font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-green mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {s.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery boundary map + address checker ─────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-sage mb-2">
            Delivery Map
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-brand-green mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Are you (or they) in our zone?
          </h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            We deliver fresh within a {zone.radiusKm} km radius of {zone.addressLabel}. Check below — or send a pincode to confirm a recipient&apos;s address.
          </p>
        </div>

        <DeliveryZoneMap
          centerLat={zone.centerLat}
          centerLng={zone.centerLng}
          radiusKm={zone.radiusKm}
          addressLabel={zone.addressLabel}
        />
      </section>

      {/* ── Products grid ────────────────────────────────────────────── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-brand-green mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What&apos;s fresh today
            </h2>
            <p className="text-sm text-brand-muted">
              Tap any tea to choose size &amp; quantity. Keep adding to your WhatsApp Cart until you&apos;re done.
            </p>
          </div>
          <Link
            href="/farmers-market/order"
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-mid transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            🛒 View WhatsApp Cart
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-brand-muted py-20">No teas available right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => {
              const config = p.countryConfigs[0];
              const imageUrl = p.images[0]?.cloudinaryPublicId
                ? buildImageUrl(p.images[0].cloudinaryPublicId, TRANSFORMS.productCard)
                : null;

              return (
                <FarmersMarketProductCard
                  key={p.id}
                  product={{
                    id:        p.id,
                    sku:       p.sku ?? p.slug.toUpperCase().slice(0, 8),
                    name:      p.name,
                    slug:      p.slug,
                    tagline:   p.tagline,
                    price:     config?.price ? Number(config.price) : 0,
                    salePrice: config?.salePrice ? Number(config.salePrice) : null,
                    sizes:     p.packagingSizes,
                    imageUrl,
                  }}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Floating WhatsApp Cart pill */}
      <CartFab />

      {/* ── Payment / trust footer ───────────────────────────────────── */}
      <section className="bg-brand-mint border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3
            className="text-xl font-bold text-brand-green mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Paying is as easy as ordering
          </h3>
          <p className="text-sm text-brand-muted mb-6 max-w-xl mx-auto">{zone.paymentNote}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {[
              { icon: "💬", label: "WhatsApp Pay" },
              { icon: "🟢", label: "GPay" },
              { icon: "🟣", label: "PhonePe" },
              { icon: "🔵", label: "Paytm" },
              { icon: "🏦", label: "Any UPI" },
              { icon: "💵", label: "Cash on delivery" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2 bg-white border border-brand-border px-4 py-2 rounded-full text-sm font-medium text-brand-dark">
                <span>{m.icon}</span> {m.label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
