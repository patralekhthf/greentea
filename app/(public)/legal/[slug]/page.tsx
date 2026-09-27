import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { DELIVERY_PROMISE, SHIPPING } from "@/lib/shipping";

const UPDATED = "27 September 2026";

type Section = { h: string; p: string[] };
type Policy = { title: string; intro: string; sections: Section[] };

const contactLine = `WhatsApp or call ${BUSINESS.customerCare}`;

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping Policy",
    intro: `We deliver Kanta Greens premixes across India. ${DELIVERY_PROMISE}`,
    sections: [
      { h: "Delivery charges", p: [
        `Delivery costs ₹${SHIPPING.firstUnit} for the first pack and ₹${SHIPPING.additionalUnit} for each additional pack in the same order. The charge is shown in your cart before you pay.`,
      ]},
      { h: "When your order ships", p: [
        "We start packing once your UPI payment is confirmed. Orders ship within 1–2 working days (Monday to Saturday, excluding public holidays).",
        "Delivery usually takes 3–7 days after dispatch, depending on your pincode. Remote areas can take longer.",
      ]},
      { h: "Tracking", p: [
        "When your order ships we add the courier name and tracking number to your order. Find it any time on the Track Order page using your order number and mobile.",
      ]},
      { h: "Farmers Market (local Delhi) orders", p: [
        "Orders placed through the Farmers Market WhatsApp cart are delivered locally within our delivery zone and ship the next working day. Delivery charges for these are confirmed on WhatsApp.",
      ]},
      { h: "Problems with delivery", p: [
        `If your parcel is delayed, damaged or missing, ${contactLine} with your order number and we'll sort it out.`,
      ]},
    ],
  },
  refund: {
    title: "Refund & Cancellation Policy",
    intro: "Our premixes are food products, so we can't take back opened packs. If something is wrong with your order, we'll make it right.",
    sections: [
      { h: "Cancelling an order", p: [
        "You can cancel any time before your order ships and we'll refund the full amount. Once it has shipped, it can't be cancelled.",
      ]},
      { h: "Damaged, wrong or missing items", p: [
        `Tell us within 48 hours of delivery: ${contactLine} with your order number and photos of the pack and the outer box.`,
        "We'll send a replacement or refund the item, whichever you prefer.",
      ]},
      { h: "What we can't refund", p: [
        "Opened or partly used packs, unless the product was damaged or defective when it arrived.",
        "Delays caused by an incorrect or incomplete address.",
      ]},
      { h: "How refunds are paid", p: [
        "Refunds go back to the UPI account you paid from, within 5–7 working days of approval.",
      ]},
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: `These terms apply when you use this website or buy from ${BUSINESS.name}. By placing an order you agree to them.`,
    sections: [
      { h: "Products", p: [
        "Our premixes are dry masala blends. Follow the method on the pack and check the ingredients and allergen information before cooking. Product photos are for illustration; packaging may vary.",
      ]},
      { h: "Prices and payment", p: [
        "Prices are in Indian Rupees and shown on each product page. Delivery is charged as described in our Shipping Policy.",
        "We currently accept payment by UPI. Your order is confirmed once we've verified the payment against the UTR / transaction reference you provide.",
        "If a price is shown incorrectly because of an error, we'll contact you before shipping and you can cancel for a full refund.",
      ]},
      { h: "Orders", p: [
        "We may decline or cancel an order, for example if a product is unavailable or the payment can't be verified. Any amount paid will be refunded in full.",
      ]},
      { h: "Delivery, cancellations and refunds", p: [
        "See our Shipping Policy and Refund & Cancellation Policy.",
      ]},
      { h: "Liability", p: [
        "To the extent permitted by law, our liability for any order is limited to the amount you paid for it.",
      ]},
      { h: "Governing law", p: [
        `These terms are governed by the laws of India. Disputes are subject to the courts of ${BUSINESS.jurisdiction}.`,
      ]},
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: `This explains what personal data ${BUSINESS.name} collects and how we use it, in line with India's Digital Personal Data Protection Act, 2023.`,
    sections: [
      { h: "What we collect", p: [
        "When you order: your name, mobile number, email, delivery address and the UPI transaction reference you give us.",
        "When you browse: basic technical information such as your IP address, approximate location and browser, and the contents of your cart.",
        "If you join our waitlist or newsletter: your email address.",
      ]},
      { h: "How we use it", p: [
        "To process, deliver and support your orders, to verify payments, to reply to your messages, and to tell you about launches you signed up for. We don't sell your data.",
      ]},
      { h: "Who we share it with", p: [
        "Only the services needed to run the shop: courier partners (name, address, mobile), and our hosting, database and image providers, who store data on our behalf.",
      ]},
      { h: "Cookies and local storage", p: [
        "We use your browser's storage to remember your cart and region. We don't use advertising cookies.",
      ]},
      { h: "Your choices", p: [
        `You can ask us to show, correct or delete your personal data, or unsubscribe from emails: ${contactLine}. We keep order records as long as the law requires.`,
      ]},
    ],
  },
};

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return policy ? { title: policy.title } : { title: "Not found" };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="bg-brand-cream min-h-[70vh]">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {policy.title}
        </h1>
        <p className="text-xs text-brand-muted mb-6">Last updated {UPDATED}</p>
        <p className="text-brand-dark leading-relaxed mb-8">{policy.intro}</p>
        <div className="space-y-7">
          {policy.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>{s.h}</h2>
              {s.p.map((para, i) => <p key={i} className="text-sm text-brand-dark leading-relaxed mb-2">{para}</p>)}
            </section>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-brand-border text-sm text-brand-muted">
          <p className="font-semibold text-brand-dark">{BUSINESS.name}</p>
          {BUSINESS.addressLines.map((l) => <p key={l}>{l}</p>)}
          <p className="mt-2">Customer care: {BUSINESS.customerCare}</p>
          <p className="mt-4 space-x-3">
            {Object.entries(POLICIES).filter(([k]) => k !== slug).map(([k, v]) => (
              <Link key={k} href={`/legal/${k}`} className="underline">{v.title}</Link>
            ))}
          </p>
        </div>
      </article>
    </div>
  );
}
