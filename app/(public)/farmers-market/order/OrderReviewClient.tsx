"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useCart,
  updateQuantity,
  removeItem,
  clearCart,
  getCartId,
  cartItemCount,
  cartSubtotal,
  type CartItem,
} from "@/lib/farmers-market-cart";

type Props = {
  whatsappNumber: string;
  addressLabel:   string;
  radiusKm:       number;
};

const PAYMENT_METHODS = [
  { id: "gpay",         label: "Google Pay (GPay)", icon: "🟢" },
  { id: "phonepe",      label: "PhonePe",           icon: "🟣" },
  { id: "paytm",        label: "Paytm",             icon: "🔵" },
  { id: "upi",          label: "Any UPI App",       icon: "🏦" },
  { id: "whatsapp_pay", label: "WhatsApp Pay",      icon: "💬" },
  { id: "cod",          label: "Cash on Delivery",  icon: "💵" },
] as const;

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

/** Pad a string on the right to a target visual length. */
function pad(s: string, len: number) {
  if (s.length >= len) return s.slice(0, len);
  return s + " ".repeat(len - s.length);
}

/**
 * Build a structured tabular WhatsApp message.
 * Uses a monospace code-block via triple-backticks so the table aligns
 * inside WhatsApp's "code" formatting (which renders fixed-width).
 */
function buildWhatsAppMessage(opts: {
  cart: CartItem[];
  customerName: string;
  payment: string;
  addressLabel: string;
  radiusKm: number;
  orderNumber?: string | null;
  mobile?: string;
}): string {
  const { cart, customerName, payment, addressLabel, radiusKm, orderNumber, mobile } = opts;
  const lines: string[] = [];

  lines.push("🛒 *NEW FARMERS MARKET ORDER*");
  if (orderNumber) lines.push(`📋 *Order:* ${orderNumber}`);
  lines.push("");
  if (customerName.trim()) {
    lines.push(`👤 *Customer:* ${customerName.trim()}`);
  }
  if (mobile) {
    lines.push(`📱 *Mobile:* +91 ${mobile}`);
  }
  if (customerName.trim() || mobile) lines.push("");

  lines.push("*Order Details:*");
  lines.push("```");
  // Header
  lines.push(
    pad("SKU", 12) + "| " +
    pad("Item", 22) + "| " +
    pad("Size", 7) + "| " +
    pad("Qty", 4) + "| " +
    pad("Price", 7) + "| " +
    "Total"
  );
  lines.push("-".repeat(70));
  for (const item of cart) {
    const total = item.price * item.quantity;
    lines.push(
      pad(item.sku, 12) + "| " +
      pad(item.name, 22) + "| " +
      pad(item.size, 7) + "| " +
      pad(String(item.quantity), 4) + "| " +
      pad(`₹${item.price.toFixed(0)}`, 7) + "| " +
      `₹${total.toFixed(0)}`
    );
  }
  lines.push("```");
  lines.push("");

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  lines.push(`💰 *Subtotal:* ${formatINR(subtotal)} (${itemCount} item${itemCount === 1 ? "" : "s"})`);

  const payLabel = PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? payment;
  lines.push(`💳 *Payment Method:* ${payLabel}`);
  lines.push(`📍 *Delivery:* within ${radiusKm} km of ${addressLabel}`);
  lines.push("");

  if (payment === "cod") {
    lines.push("Please confirm availability and tentative delivery date.");
  } else {
    lines.push(`Please share your ${payLabel} ID / QR so I can complete the payment.`);
  }

  return lines.join("\n");
}

export default function OrderReviewClient({ whatsappNumber, addressLabel, radiusKm }: Props) {
  const cart                    = useCart();
  const [payment, setPayment]   = useState<string>("");
  const [customerName, setName] = useState("");
  const [mobile, setMobile]     = useState("");
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]         = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const itemCount     = cartItemCount(cart);
  const subtotal      = cartSubtotal(cart);
  const mobileDigits  = mobile.replace(/\D/g, "").slice(-10);
  const mobileValid   = /^[6-9]\d{9}$/.test(mobileDigits);
  const canPlace      = cart.length > 0 && payment !== "" && mobileValid && !submitting;

  async function placeOrder() {
    if (!canPlace) return;
    setError("");
    setSubmitting(true);
    try {
      // 1) Record the order on the server (captures IP, geo, timestamps)
      const res = await fetch("/api/farmers-market/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId:         getCartId(),
          items:          cart,
          customerName,
          customerMobile: mobileDigits,
          paymentMethod:  payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order — please try again.");
        setSubmitting(false);
        return;
      }
      setOrderNumber(data.orderNumber);

      // 2) Open WhatsApp with the structured message
      const msg = buildWhatsAppMessage({
        cart, customerName, payment, addressLabel, radiusKm,
        orderNumber: data.orderNumber,
        mobile:      mobileDigits,
      });
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    clearCart();
    setSent(false);
    setOrderNumber(null);
    setPayment("");
    setName("");
    setMobile("");
  }

  /* ── Empty cart ─────────────────────────────────────────────── */
  if (cart.length === 0 && !sent) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Your WhatsApp Cart is empty
          </h1>
          <p className="text-sm text-brand-muted mb-6">
            Add a tea from the Farmers Market to get started. Choose size and quantity for each product, then place your order in one go.
          </p>
          <Link
            href="/farmers-market"
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-brand-mid transition-colors"
          >
            ← Browse Farmers Market
          </Link>
        </div>
      </div>
    );
  }

  /* ── Sent confirmation ──────────────────────────────────────── */
  if (sent) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Order sent on WhatsApp
          </h1>
          {orderNumber && (
            <p className="text-xs font-mono bg-brand-mint text-brand-green inline-block px-3 py-1 rounded-full mb-3">
              {orderNumber}
            </p>
          )}
          <p className="text-sm text-brand-muted mb-2">
            Continue the conversation with the seller in WhatsApp. They&apos;ll confirm availability and share payment details shortly.
          </p>
          <p className="text-xs text-brand-muted mb-6">
            We pack fresh the night before / same morning and ship the next working day.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={startOver}
              className="px-6 py-3 bg-brand-green text-white text-sm font-semibold rounded-full hover:bg-brand-mid transition-colors"
            >
              Clear cart & start new order
            </button>
            <Link
              href="/farmers-market"
              className="px-6 py-3 border border-brand-border text-brand-dark text-sm font-semibold rounded-full hover:bg-brand-mint transition-colors"
            >
              Back to Farmers Market
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Cart / Review ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Sticky header */}
      <div className="bg-white border-b border-brand-border sticky top-16 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <Link href="/farmers-market" className="text-sm text-brand-muted hover:text-brand-green whitespace-nowrap">
            ← Continue shopping
          </Link>
          <h1
            className="text-base sm:text-lg font-bold text-brand-green text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🛒 Your WhatsApp Cart
          </h1>
          <span className="text-xs text-brand-muted whitespace-nowrap">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cart items */}
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-brand-border bg-brand-mint/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sage">
              Items in your cart
            </p>
          </div>
          <div className="divide-y divide-brand-border">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                {/* Thumb */}
                <div className="shrink-0 w-14 h-14 rounded-lg bg-brand-mint overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍵</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand-dark truncate">{item.name}</p>
                  <p className="text-[11px] font-mono text-brand-sage">{item.sku}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block text-[11px] font-medium text-brand-green bg-brand-mint px-2 py-0.5 rounded-full">
                      {item.size}
                    </span>
                    <span className="text-[11px] text-brand-muted">{formatINR(item.price)} each</span>
                  </div>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    aria-label="Decrease"
                    className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-brand-dark">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                    aria-label="Increase"
                    className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Line total + remove */}
                <div className="shrink-0 text-right min-w-[60px]">
                  <p className="text-sm font-bold text-brand-green">{formatINR(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-[11px] text-red-400 hover:text-red-600 mt-0.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="px-5 py-4 bg-brand-mint/50 border-t border-brand-border flex justify-between items-center">
            <span className="text-sm font-medium text-brand-muted">Subtotal</span>
            <span className="text-lg font-bold text-brand-green">{formatINR(subtotal)}</span>
          </div>
        </div>

        {/* Add more CTA */}
        <div className="mb-6">
          <Link
            href="/farmers-market#products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-mid"
          >
            + Add more items
          </Link>
        </div>

        {/* Contact details */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 mb-6">
          <h2 className="text-sm font-bold text-brand-green mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Your Contact Details
          </h2>
          <p className="text-xs text-brand-muted mb-4">
            We&apos;ll only use this to coordinate your delivery.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Name <span className="text-[10px] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Mobile <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 text-sm font-medium text-brand-dark bg-brand-mint rounded-full border border-brand-border">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile"
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
                />
              </div>
              {mobile.length > 0 && !mobileValid && (
                <p className="text-xs text-red-600 mt-1.5">Enter a valid 10-digit Indian mobile number.</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 mb-6">
          <h2 className="text-sm font-bold text-brand-green mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Choose Payment Method
          </h2>
          <p className="text-xs text-brand-muted mb-4">
            The seller will share their payment ID after they receive your order on WhatsApp.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setPayment(m.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  payment === m.id
                    ? "border-brand-green bg-brand-mint text-brand-green ring-2 ring-brand-sage/30"
                    : "border-brand-border text-brand-dark hover:border-brand-sage hover:bg-brand-mint/50"
                }`}
              >
                <span>{m.icon}</span>
                <span className="truncate text-left">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message preview */}
        {cart.length > 0 && payment && mobileValid && (
          <div className="bg-brand-mint/60 rounded-2xl border border-brand-border p-5 mb-6">
            <h3 className="text-xs font-bold text-brand-green uppercase tracking-wider mb-3">
              Preview — message sent to seller
            </h3>
            <pre className="whitespace-pre-wrap text-[11px] sm:text-xs text-brand-dark font-mono leading-relaxed bg-white rounded-xl p-4 border border-brand-border overflow-x-auto">
              {buildWhatsAppMessage({ cart, customerName, payment, addressLabel, radiusKm, mobile: mobileDigits })}
            </pre>
            <p className="text-[11px] text-brand-muted mt-3">
              The seller receives the full table with SKU codes — no chance of mix-ups. A unique order number is added once you send.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Place order */}
        <button
          onClick={placeOrder}
          disabled={!canPlace}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#25D366]/20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/>
          </svg>
          {submitting ? "Placing order…" : `Send Order via WhatsApp · ${formatINR(subtotal)}`}
        </button>
        {!canPlace && cart.length > 0 && !submitting && (
          <p className="text-xs text-amber-700 text-center mt-3">
            {!mobileValid ? "Enter your mobile number to continue." : !payment ? "Select a payment method to continue." : ""}
          </p>
        )}

        {/* What happens next */}
        <div className="mt-8 bg-white rounded-2xl border border-brand-border p-5">
          <h3 className="text-sm font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
            What happens next?
          </h3>
          <ol className="space-y-2 text-sm text-brand-muted">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">1</span>
              <span>Your order table is sent to the seller on WhatsApp</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">2</span>
              <span>Seller confirms availability and shares their payment ID</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">3</span>
              <span>You pay and share the screenshot</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">4</span>
              <span>We pack fresh the night before / same morning and ship the next working day</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">5</span>
              <span>You receive your order with a full 14 days of freshness — zero preservatives</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
