import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Kanta Greens on WhatsApp or phone for orders, bulk enquiries and support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const wa = `https://wa.me/${BUSINESS.customerCareE164}?text=${encodeURIComponent("Hi Kanta Greens!")}`;
  return (
    <div className="bg-brand-cream min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Contact Us
        </h1>
        <p className="text-brand-muted mb-10">Questions about an order, a recipe or bulk packs? We&apos;re happy to help.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl border border-brand-border p-6 hover:shadow-md transition-shadow">
            <p className="text-2xl mb-2">💬</p>
            <p className="font-bold text-brand-green">WhatsApp / Call</p>
            <p className="text-sm text-brand-dark mt-1">{BUSINESS.customerCare}</p>
            <p className="text-xs text-brand-muted mt-2">Fastest for order help. Share your order number.</p>
          </a>
          <div className="bg-white rounded-2xl border border-brand-border p-6">
            <p className="text-2xl mb-2">📍</p>
            <p className="font-bold text-brand-green">{BUSINESS.name}</p>
            {BUSINESS.addressLines.map((l) => <p key={l} className="text-sm text-brand-dark">{l}</p>)}
          </div>
        </div>

        <section id="bulk" className="mt-10 bg-white rounded-2xl border border-brand-border p-6 scroll-mt-24">
          <h2 className="text-lg font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>Bulk & gifting orders</h2>
          <p className="text-sm text-brand-dark">
            Ordering for an event, office or festive gifting? Message us on WhatsApp with the premixes and quantities you need and we&apos;ll send a quote.
          </p>
        </section>

        <p className="text-sm text-brand-muted mt-10">
          Already ordered? <Link href="/track" className="underline">Track your order</Link>.
        </p>
      </div>
    </div>
  );
}
