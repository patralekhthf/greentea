import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";
import NewsletterForm from "@/components/ui/NewsletterForm";

export const metadata: Metadata = {
  title: "Teas — Coming Soon",
  description: "Kanta Greens teas are coming soon. Join the waitlist to hear the day they launch.",
};

export const dynamic = "force-dynamic";

/**
 * The tea line is on hold (TEA_LINE_LIVE = false in lib/catalog.ts).
 * Published teas are shown as a preview only: no prices, no product pages,
 * no add-to-cart. Visitors can join a waitlist instead.
 */
export default async function TeasComingSoonPage() {
  const teas = await getProducts({ line: "TEA", sort: "featured" });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-green text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-brand-gold/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-brand-gold/30 mb-5">
            Coming soon
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kanta Greens Teas
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto">
            We&apos;re getting our tea collection ready. It isn&apos;t available to order yet.
            Join the waitlist and we&apos;ll email you the day it launches.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2
          className="text-2xl font-bold text-brand-green mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Get notified at launch
        </h2>
        <p className="text-sm text-brand-muted mb-6">One email when our teas go live. Nothing else.</p>
        <NewsletterForm
          source="teas-waitlist"
          buttonLabel="Join the waitlist"
          successTitle="You're on the list!"
          successText="We'll email you as soon as our teas launch."
        />
      </section>

      {/* Preview grid */}
      {teas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2
            className="text-xl font-bold text-brand-green mb-6 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A first look at what&apos;s coming
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {teas.map((t) => {
              const imageUrl = t.primaryImage ? buildImageUrl(t.primaryImage, TRANSFORMS.productCard) : null;
              return (
                <div
                  key={t.id}
                  className="relative rounded-2xl border border-brand-border bg-white overflow-hidden"
                  aria-label={`${t.name}, coming soon`}
                >
                  <div className="relative aspect-square bg-brand-mint">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={t.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover grayscale-[35%] opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-50">🍵</div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-brand-gold text-white px-2.5 py-1 rounded-full">
                      Coming soon
                    </span>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-brand-green text-sm leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {t.name}
                    </h3>
                    {t.tagline && <p className="text-xs text-brand-muted mt-1 line-clamp-2">{t.tagline}</p>}
                    <p className="text-xs font-semibold text-brand-gold mt-3">Not available to order yet</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cross-sell */}
      <section className="bg-white border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-brand-muted mb-4">In the meantime, our masala premixes are ready to order.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-green text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-mid transition-colors text-sm"
          >
            Shop Premixes →
          </Link>
        </div>
      </section>
    </div>
  );
}
