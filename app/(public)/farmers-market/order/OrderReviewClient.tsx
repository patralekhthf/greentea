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
import UpiPaymentStep from "@/components/local/UpiPaymentStep";

type UpiConfig = {
  vpa:          string;
  payeeName:    string;
  instructions: string;
};

type Props = {
  whatsappNumber: string;
  addressLabel:   string;
  radiusKm:       number;
  upi:            UpiConfig | null;
};

const PAYMENT_METHODS = [
  { id: "upi",          label: "Any UPI App",       icon: "🏦", enabled: true  },
  { id: "gpay",         label: "Google Pay",        icon: "🟢", enabled: false },
  { id: "phonepe",      label: "PhonePe",           icon: "🟣", enabled: false },
  { id: "paytm",        label: "Paytm",             icon: "🔵", enabled: false },
  { id: "whatsapp_pay", label: "WhatsApp Pay",      icon: "💬", enabled: false },
  { id: "cod",          label: "Cash on Delivery",  icon: "💵", enabled: false },
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
  upiUtr?: string | null;
  upiVpa?: string | null;
}): string {
  const { cart, customerName, payment, addressLabel, radiusKm, orderNumber, mobile, upiUtr, upiVpa } = opts;
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

  // Payment status — depends on whether the customer paid via the in-checkout UPI step
  if (upiUtr) {
    lines.push("");
    lines.push("✅ *PAYMENT COMPLETED VIA UPI*");
    lines.push(`🔖 *UTR / Reference:* ${upiUtr}`);
    if (upiVpa) lines.push(`💳 *Paid to:* ${upiVpa}`);
    lines.push("");
    lines.push("📸 *Sharing the payment screenshot in this chat now* — please verify and confirm shipping.");
  } else if (payment === "cod") {
    lines.push("");
    lines.push("Please confirm availability and tentative delivery date.");
  } else {
    lines.push("");
    lines.push("Please share your UPI ID / QR so I can complete the payment.");
  }

  return lines.join("\n");
}

type Step = "review" | "pay" | "sent";

export default function OrderReviewClient({ whatsappNumber, addressLabel, radiusKm, upi }: Props) {
  const cart                    = useCart();
  const [step, setStep]         = useState<Step>("review");
  const [payment, setPayment]   = useState<string>("upi");
  const [customerName, setName] = useState("");
  const [mobile, setMobile]     = useState("");
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId]   = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [orderItems, setOrderItems]   = useState<CartItem[]>([]);

  const itemCount     = cartItemCount(cart);
  const subtotal      = cartSubtotal(cart);
  const mobileDigits  = mobile.replace(/\D/g, "").slice(-10);
  const mobileValid   = /^[6-9]\d{9}$/.test(mobileDigits);
  const canPlace      = cart.length > 0 && payment !== "" && mobileValid && !submitting;
  const upiEnabled    = upi !== null;

  /** Create the order row on the server. Returns the order id+number or null on failure. */
  async function createOrder(): Promise<{ id: string; orderNumber: string } | null> {
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
    // Defensively parse — a 500 may return HTML instead of JSON
    const data = await res.json().catch(() => ({} as { error?: string; orderId?: string; orderNumber?: string; cartIdInvalid?: boolean }));
    if (!res.ok) {
      setError(data.error ?? `Server error (${res.status}) — please try again.`);
      return null;
    }
    // If the server told us our cached cartId was stale, clear it now so the
    // next "add to cart" creates a fresh one.
    if (data.cartIdInvalid && typeof window !== "undefined") {
      try { window.localStorage.removeItem("gt_fm_cart_id_v1"); } catch { /* ignore */ }
    }
    return { id: data.orderId!, orderNumber: data.orderNumber! };
  }

  /** Open WhatsApp with the assembled order message, optionally including UTR. */
  function openWhatsApp(opts: { upiUtr?: string | null }) {
    const msg = buildWhatsAppMessage({
      cart:        orderItems.length > 0 ? orderItems : cart,
      customerName,
      payment,
      addressLabel,
      radiusKm,
      orderNumber,
      mobile: mobileDigits,
      upiUtr: opts.upiUtr ?? null,
      upiVpa: upi?.vpa,
    });
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  /** Review step → submit. Creates the order then routes to either pay or sent. */
  async function handleContinue() {
    if (!canPlace) return;
    setError("");
    setSubmitting(true);
    try {
      const created = await createOrder();
      if (!created) { setSubmitting(false); return; }
      setOrderId(created.id);
      setOrderNumber(created.orderNumber);
      setOrderAmount(subtotal);
      setOrderItems(cart); // snapshot — cart may be cleared after WhatsApp opens

      // If UPI is configured, route to the payment step. Otherwise send WhatsApp now.
      if (upiEnabled) {
        setStep("pay");
      } else {
        openWhatsApp({ upiUtr: null });
        setStep("sent");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /** Pay step → user submitted UTR. Save it and open WhatsApp. */
  async function handlePaymentConfirmed(utr: string) {
    if (!orderId) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/farmers-market/orders/${orderId}/payment`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ upiUtr: utr, upiVpa: upi?.vpa }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save payment — please try again.");
        return;
      }
      openWhatsApp({ upiUtr: utr });
      setStep("sent");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /** Pay step → user wants to pay later via WhatsApp directly. */
  function handlePaymentSkipped() {
    openWhatsApp({ upiUtr: null });
    setStep("sent");
  }

  function startOver() {
    clearCart();
    setStep("review");
    setOrderId(null);
    setOrderNumber(null);
    setOrderAmount(0);
    setOrderItems([]);
    setPayment("upi");
    setName("");
    setMobile("");
  }

  /* ── Empty cart ─────────────────────────────────────────────── */
  if (cart.length === 0 && step !== "sent") {
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
  if (step === "sent") {
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

  /* ── Pay step ──────────────────────────────────────────────── */
  if (step === "pay" && upi && orderNumber) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="bg-white border-b border-brand-border sticky top-16 z-30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button onClick={() => setStep("review")} className="text-sm text-brand-muted hover:text-brand-green">
              ← Back to cart
            </button>
            <h1 className="text-base sm:text-lg font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
              Pay &amp; send
            </h1>
            <span className="text-xs font-mono text-brand-muted">{orderNumber}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <UpiPaymentStep
            orderNumber={orderNumber}
            amount={orderAmount}
            upi={upi}
            onSubmit={handlePaymentConfirmed}
            onSkip={handlePaymentSkipped}
            submitting={submitting}
          />
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}
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
            {PAYMENT_METHODS.map((m) => {
              const selected = payment === m.id;
              if (!m.enabled) {
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed relative"
                    title="Coming soon"
                  >
                    <span className="grayscale opacity-60">{m.icon}</span>
                    <span className="truncate text-left">{m.label}</span>
                    <span className="absolute top-1 right-2 text-[9px] uppercase tracking-wider font-bold text-gray-400">Soon</span>
                  </div>
                );
              }
              return (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? "border-brand-green bg-brand-mint text-brand-green ring-2 ring-brand-sage/30"
                      : "border-brand-border text-brand-dark hover:border-brand-sage hover:bg-brand-mint/50"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="truncate text-left">{m.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-brand-muted mt-3">
            More payment options coming soon. UPI works with any UPI app (GPay, PhonePe, Paytm, BHIM, etc.).
          </p>
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
          onClick={handleContinue}
          disabled={!canPlace}
          className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold px-6 py-4 rounded-full hover:bg-brand-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-green/20"
        >
          {submitting ? "Placing order…" : upiEnabled ? `Continue to Payment · ${formatINR(subtotal)}` : `Send Order via WhatsApp · ${formatINR(subtotal)}`}
          <span>→</span>
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
            {upiEnabled ? (
              <>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">1</span>
                  <span>Click <strong>Continue to Payment</strong> — we generate a UPI QR with the exact amount</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">2</span>
                  <span>Pay via GPay, PhonePe, or any UPI app — paste the UTR back here</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">3</span>
                  <span>WhatsApp opens with your full order &amp; payment reference — <strong>share the screenshot here</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">4</span>
                  <span>We verify the payment, pack fresh the night before / same morning, and ship next working day</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">5</span>
                  <span>You receive your order with a full 14 days of freshness — zero preservatives</span>
                </li>
              </>
            ) : (
              <>
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
                  <span>We pack fresh and ship next working day — 14-day freshness</span>
                </li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
