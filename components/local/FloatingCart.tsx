"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useCart,
  cartItemCount,
  cartSubtotal,
  updateQuantity,
  removeItem,
} from "@/lib/farmers-market-cart";

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

/**
 * Persistent cart UI for the Farmers Market.
 * - Desktop (lg+): always-expanded panel pinned to the right side, below the header
 * - Mobile (< lg): collapsed bottom bar with item count → tap to expand into a slide-up sheet
 *
 * Both views share the same scrollable item list, qty controls, and "Review & Checkout" CTA.
 */
export default function FloatingCart() {
  const cart = useCart();
  const count = cartItemCount(cart);
  const total = cartSubtotal(cart);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sheet if cart empties out
  useEffect(() => {
    if (count === 0) setMobileOpen(false);
  }, [count]);

  if (count === 0) return null;

  // The body shared by desktop panel and mobile sheet
  const itemList = (
    <div className="divide-y divide-brand-border">
      {cart.map((item) => (
        <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 px-4 py-3">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-brand-mint overflow-hidden relative">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">🍵</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-dark truncate leading-tight">{item.name}</p>
            <p className="text-[10px] font-mono text-brand-sage mt-0.5">{item.sku}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">
              {item.size} · {formatINR(item.price)} ea
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                aria-label="Decrease"
                className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green text-sm leading-none"
              >−</button>
              <span className="w-6 text-center text-xs font-bold text-brand-dark">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                aria-label="Increase"
                className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green text-sm leading-none"
              >+</button>
            </div>
            <p className="text-xs font-bold text-brand-green">{formatINR(item.price * item.quantity)}</p>
            <button
              onClick={() => removeItem(item.productId, item.size)}
              className="text-[10px] text-red-400 hover:text-red-600"
            >Remove</button>
          </div>
        </div>
      ))}
    </div>
  );

  const footer = (
    <div className="border-t border-brand-border bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-mint/50">
        <span className="text-xs font-medium text-brand-muted">Subtotal · {count} {count === 1 ? "item" : "items"}</span>
        <span className="text-base font-bold text-brand-green">{formatINR(total)}</span>
      </div>
      <Link
        href="/farmers-market/order"
        onClick={() => setMobileOpen(false)}
        className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-bold py-3.5 hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/>
        </svg>
        Review &amp; Send via WhatsApp
      </Link>
    </div>
  );

  return (
    <>
      {/* ─── Desktop: right-side fixed panel ─────────────────────────── */}
      <aside
        className="hidden lg:flex fixed right-4 top-24 bottom-4 w-80 bg-white rounded-2xl border border-brand-border shadow-xl shadow-black/10 z-30 flex-col overflow-hidden"
        aria-label="WhatsApp Cart"
      >
        <header className="px-4 py-3 border-b border-brand-border bg-brand-green text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🛒</span>
            <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
              WhatsApp Cart
            </h3>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </header>
        <div className="flex-1 overflow-y-auto">{itemList}</div>
        {footer}
      </aside>

      {/* ─── Mobile: collapsed bottom bar ──────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 right-4 z-30 bg-brand-green text-white rounded-2xl shadow-xl shadow-brand-green/30 px-4 py-3 flex items-center justify-between gap-3 hover:bg-brand-mid transition-colors"
        aria-label="Open WhatsApp Cart"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="text-base">🛒</span> WhatsApp Cart
          <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">{count}</span>
        </span>
        <span className="flex items-center gap-2 text-sm font-bold">
          {formatINR(total)} <span className="opacity-80">▲</span>
        </span>
      </button>

      {/* ─── Mobile: slide-up sheet ────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-4 py-3 border-b border-brand-border bg-brand-green text-white flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🛒</span>
                <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  WhatsApp Cart
                </h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="text-white/80 hover:text-white text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10"
              >×</button>
            </header>
            <div className="flex-1 overflow-y-auto">{itemList}</div>
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
