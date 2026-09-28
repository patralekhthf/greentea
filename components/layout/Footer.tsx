import Link from "next/link";
import Image from "next/image";
import { BRAND_TAGLINE, COOK_WITH, DISH_TYPES } from "@/lib/catalog";

const SHOP_LINKS = [
  { label: "All Premixes", href: "/shop" },
  ...DISH_TYPES.slice(0, 4).map((d) => ({ label: d.label, href: `/shop?dish=${d.slug}` })),
  { label: "Teas (coming soon)", href: "/teas" },
];

const COOK_WITH_LINKS = [
  ...COOK_WITH.slice(0, 3).map((c) => ({ label: c.label, href: `/shop?cookWith=${c.slug}` })),
  { label: "No Onion No Garlic", href: "/shop?nog=1" },
  { label: "Farmers Market (Delhi)", href: "/farmers-market" },
];

const COMPANY_LINKS = [
  { label: "About Us",    href: "/about" },
  { label: "Blog",        href: "/blog" },
  { label: "Contact",     href: "/contact" },
  { label: "Bulk Orders", href: "/contact#bulk" },
  { label: "Track Order", href: "/track" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",   href: "/legal/privacy" },
  { label: "Terms & Conditions", href: "/legal/terms" },
  { label: "Refund Policy",    href: "/legal/refund" },
  { label: "Shipping Policy",  href: "/legal/shipping" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/brand/kanta-greens-logo.png"
                alt=""
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="flex flex-col leading-none">
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Kanta Greens
                </span>
                <span className="text-[10px] text-white/60 mt-1">{BRAND_TAGLINE}</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Ready-to-cook masala premixes. Add water, heat, and a home-style dish is ready in minutes.
            </p>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {["Homemade taste", "Cook easy", "100% veg premixes"].map((b) => (
                <span
                  key={b}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/20"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-white/50">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cook with */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-white/50">
              Cook With
            </h3>
            <ul className="space-y-2.5">
              {COOK_WITH_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-white/50">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-white/50">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Kanta Greens. All rights reserved.
          </p>
          <p className="text-xs text-white/40 text-center">
            Made in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
