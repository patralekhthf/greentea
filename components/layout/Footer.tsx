import Link from "next/link";

const SHOP_LINKS = [
  { label: "All Teas",        href: "/shop" },
  { label: "Green Tea",       href: "/categories/green-tea" },
  { label: "Herbal Tea",      href: "/categories/herbal-tea" },
  { label: "Ayurvedic Tea",   href: "/categories/ayurvedic-tea" },
  { label: "Gift Packs",      href: "/categories/gift-packs" },
];

const WELLNESS_LINKS = [
  { label: "Better Sleep",       href: "/wellness/better-sleep" },
  { label: "Stress Relief",      href: "/wellness/stress-relief" },
  { label: "Weight Management",  href: "/wellness/weight-management" },
  { label: "Immunity Support",   href: "/wellness/immunity-support" },
  { label: "Detox & Cleanse",    href: "/wellness/detox" },
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
  { label: "Wellness Disclaimer", href: "/legal/disclaimer" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍵</span>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Kanta Greens
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Premium organic teas for your daily wellness ritual. Sourced from India&apos;s finest gardens, crafted with care.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {["100% Organic", "Ethically Sourced", "No Additives"].map((b) => (
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

          {/* Wellness */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4 text-white/50">
              Wellness
            </h3>
            <ul className="space-y-2.5">
              {WELLNESS_LINKS.map((l) => (
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
            *These statements have not been evaluated by any regulatory authority. Our teas are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
