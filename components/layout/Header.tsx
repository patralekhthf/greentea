"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LocationSwitcher from "./LocationSwitcher";
import { BRAND_TAGLINE } from "@/lib/catalog";
import { useSiteCart, siteCartUnits } from "@/lib/site-cart";

const NAV: { label: string; href: string; soon?: boolean }[] = [
  { label: "Premixes", href: "/shop" },
  { label: "Blog",     href: "/blog" },
  { label: "Teas",     href: "/teas", soon: true },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
];

function SoonPill() {
  return (
    <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded-full align-middle">
      Soon
    </span>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useSiteCart();
  const cartCount = siteCartUnits(cart);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/brand/kanta-greens-logo.png"
              alt=""
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <span className="flex flex-col leading-none">
              <span
                className="font-display text-xl font-bold text-brand-green tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Kanta Greens
              </span>
              <span className="hidden sm:block text-[10px] text-brand-muted mt-1">{BRAND_TAGLINE}</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-brand-green hover:bg-brand-mint rounded-lg transition-colors"
              >
                {item.label}
                {item.soon && <SoonPill />}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LocationSwitcher />

            {/* Website cart (all-India). The Farmers Market WhatsApp cart has its own panel. */}
            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Cart"}
              className="relative p-2 rounded-lg hover:bg-brand-mint transition-colors text-brand-muted hover:text-brand-green"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.857-7.152a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-brand-mint transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-brand-border py-3 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-brand-dark hover:text-brand-green hover:bg-brand-mint rounded-lg transition-colors"
              >
                {item.label}
                {item.soon && <SoonPill />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
