"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useSiteCart,
  setSiteCartQuantity,
  removeFromSiteCart,
  siteCartSubtotal,
  siteCartUnits,
  MAX_QTY,
} from "@/lib/site-cart";
import { DELIVERY_PROMISE, SHIPPING, shippingFor } from "@/lib/shipping";

const inr = (n: number) => `₹${n.toFixed(0)}`;

export default function CartClient() {
  const { cart, ready } = useSiteCart();
  const units = siteCartUnits(cart);
  const subtotal = siteCartSubtotal(cart);
  const shipping = shippingFor(units);

  if (!ready) return <div className="min-h-[60vh] bg-brand-cream" />;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-brand-cream">
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Your cart is empty
          </h1>
          <p className="text-sm text-brand-muted mb-6">
            Add a premix or two and they&apos;ll show up here. We deliver across India.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-brand-mid transition-colors"
          >
            Shop Premixes →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-3xl font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
            Your Cart
          </h1>
          <Link href="/shop" className="text-sm text-brand-muted hover:text-brand-green">← Continue shopping</Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-brand-border divide-y divide-brand-border">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-4 p-4 sm:p-5">
                <Link href={`/products/${item.slug}`} className="shrink-0 w-20 h-20 rounded-xl bg-brand-mint overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-3xl">🥘</span>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="font-bold text-brand-dark hover:text-brand-green leading-snug">
                    {item.name}
                  </Link>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {item.size} · {inr(item.price)} each · <span className="font-mono">{item.sku}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-brand-border rounded-full">
                      <button
                        onClick={() => setSiteCartQuantity(item.productId, item.size, item.quantity - 1)}
                        aria-label={`Decrease ${item.name}`}
                        className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-green"
                      >−</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => setSiteCartQuantity(item.productId, item.size, item.quantity + 1)}
                        disabled={item.quantity >= MAX_QTY}
                        aria-label={`Increase ${item.name}`}
                        className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-green disabled:opacity-30"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeFromSiteCart(item.productId, item.size)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="shrink-0 font-bold text-brand-green">{inr(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="bg-white rounded-2xl border border-brand-border p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-brand-green mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Order Summary
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-muted">Subtotal ({units} {units === 1 ? "pack" : "packs"})</dt>
                <dd className="font-semibold">{inr(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-muted">Delivery</dt>
                <dd className="font-semibold">{inr(shipping)}</dd>
              </div>
              <p className="text-[11px] text-brand-muted">
                {inr(SHIPPING.firstUnit)} for the first pack + {inr(SHIPPING.additionalUnit)} for each additional pack.
              </p>
              <div className="flex justify-between pt-3 border-t border-brand-border text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-bold text-brand-green">{inr(subtotal + shipping)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-5 block text-center bg-brand-green text-white font-semibold py-3.5 rounded-full hover:bg-brand-mid transition-colors"
            >
              Proceed to Checkout →
            </Link>
            <p className="text-xs text-brand-muted text-center mt-3">🚚 {DELIVERY_PROMISE}</p>
            <p className="text-xs text-brand-muted text-center mt-1">Pay securely by UPI (GPay, PhonePe, Paytm, BHIM).</p>
            <p className="text-[11px] text-brand-muted text-center mt-4 pt-4 border-t border-brand-border">
              In Delhi near us? Try our <Link href="/farmers-market" className="text-brand-green underline">Farmers Market</Link> for local WhatsApp orders.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
