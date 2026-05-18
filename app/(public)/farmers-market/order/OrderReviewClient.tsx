"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  products: Product[];
  whatsappNumber: string;
  addressLabel: string;
  radiusKm: number;
};

const PAYMENT_METHODS = [
  { id: "gpay",        label: "Google Pay (GPay)", icon: "🟢" },
  { id: "phonepe",     label: "PhonePe",           icon: "🟣" },
  { id: "paytm",       label: "Paytm",             icon: "🔵" },
  { id: "upi",         label: "Other UPI App",     icon: "🏦" },
  { id: "whatsapp_pay",label: "WhatsApp Pay",      icon: "💬" },
  { id: "cod",         label: "Cash on Delivery",  icon: "💵" },
] as const;

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

export default function OrderReviewClient({ products, whatsappNumber, addressLabel, radiusKm }: Props) {
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [payment, setPayment]      = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [step, setStep]            = useState<"select" | "review">("select");

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function buildWhatsAppMessage(): string {
    const lines: string[] = [];
    lines.push("🛒 *New Farmers Market Order*");
    lines.push("");
    if (customerName.trim()) {
      lines.push(`👤 *Customer:* ${customerName.trim()}`);
      lines.push("");
    }
    lines.push("*Items:*");
    cart.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. *${item.product.name}* (${item.product.sku}) × ${item.quantity} = ${formatINR(item.product.price * item.quantity)}`
      );
    });
    lines.push("");
    lines.push(`💰 *Total:* ${formatINR(subtotal)}`);
    lines.push("");
    const payLabel = PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? payment;
    lines.push(`💳 *Payment method:* ${payLabel}`);
    if (payment !== "cod") {
      lines.push("");
      lines.push(`Please share your ${payLabel} ID / QR so I can make the payment.`);
    }
    lines.push("");
    lines.push(`📍 Delivery within ${radiusKm} km of ${addressLabel}`);
    return lines.join("\n");
  }

  function placeOrder() {
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const canPlace = cart.length > 0 && payment !== "";

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white border-b border-brand-border sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/farmers-market" className="text-sm text-brand-muted hover:text-brand-green">
              ← Back to Market
            </Link>
            <span className="text-brand-border">|</span>
            <h1 className="text-lg font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
              {step === "select" ? "Select Products" : "Review Order"}
            </h1>
          </div>
          {cart.length > 0 && step === "select" && (
            <button
              onClick={() => setStep("review")}
              className="flex items-center gap-2 bg-brand-green text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-mid transition-colors"
            >
              Review Order ({itemCount})
            </button>
          )}
        </div>
      </div>

      {step === "select" ? (
        /* ── Product Selection ────────────────────────────────── */
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-brand-muted mb-6">
            Tap products to add them to your order. You can adjust quantities in the next step.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                    inCart ? "border-brand-green ring-2 ring-brand-sage/30" : "border-brand-border"
                  }`}
                  onClick={() => addToCart(p)}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-16 h-16 rounded-lg bg-brand-mint overflow-hidden relative">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍵</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-green truncate">{p.name}</p>
                      <p className="text-xs text-brand-muted font-mono">{p.sku}</p>
                      <p className="text-sm font-semibold text-brand-dark mt-0.5">{formatINR(p.price)}</p>
                    </div>

                    {/* Cart indicator */}
                    {inCart && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating cart summary */}
          {cart.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <button
                onClick={() => setStep("review")}
                className="flex items-center gap-3 bg-brand-green text-white font-semibold px-6 py-3.5 rounded-full shadow-xl shadow-brand-green/30 hover:bg-brand-mid transition-colors"
              >
                <span>Review Order</span>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {itemCount} items · {formatINR(subtotal)}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Order Review ─────────────────────────────────────── */
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cart items */}
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-brand-border">
              <h2 className="text-sm font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
                Your Items
              </h2>
            </div>
            <div className="divide-y divide-brand-border">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Thumbnail */}
                  <div className="shrink-0 w-14 h-14 rounded-lg bg-brand-mint overflow-hidden relative">
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🍵</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-dark truncate">{item.product.name}</p>
                    <p className="text-xs text-brand-muted font-mono">{item.product.sku} · {formatINR(item.product.price)} each</p>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-brand-dark">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-brand-green">{formatINR(item.product.price * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-xs text-red-400 hover:text-red-600 mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="px-5 py-4 bg-brand-mint/50 border-t border-brand-border flex justify-between items-center">
              <span className="text-sm font-medium text-brand-muted">Subtotal ({itemCount} items)</span>
              <span className="text-lg font-bold text-brand-green">{formatINR(subtotal)}</span>
            </div>
          </div>

          {/* Customer name (optional) */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 mb-6">
            <label className="block text-sm font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Your Name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="So the seller knows who you are"
              className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
            />
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 mb-6">
            <h2 className="text-sm font-bold text-brand-green mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Payment Method
            </h2>
            <p className="text-xs text-brand-muted mb-4">
              The seller will share their payment ID after you place the order.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    payment === m.id
                      ? "border-brand-green bg-brand-mint text-brand-green ring-2 ring-brand-sage/30"
                      : "border-brand-border text-brand-dark hover:border-brand-sage hover:bg-brand-mint/50"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order summary preview */}
          {canPlace && (
            <div className="bg-brand-mint rounded-2xl border border-brand-border p-5 mb-6">
              <h3 className="text-xs font-bold text-brand-green uppercase tracking-wider mb-3">
                Message Preview
              </h3>
              <pre className="whitespace-pre-wrap text-xs text-brand-dark font-mono leading-relaxed bg-white rounded-xl p-4 border border-brand-border">
                {buildWhatsAppMessage()}
              </pre>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStep("select")}
              className="flex-1 px-5 py-3 border border-brand-border rounded-full text-sm font-semibold text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
            >
              ← Add More Items
            </button>
            <button
              onClick={placeOrder}
              disabled={!canPlace}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#25D366]/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/>
              </svg>
              Place Order via WhatsApp
            </button>
          </div>

          {/* How it works after placement */}
          <div className="mt-8 bg-white rounded-2xl border border-brand-border p-5">
            <h3 className="text-sm font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
              What happens next?
            </h3>
            <ol className="space-y-2 text-sm text-brand-muted">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">1</span>
                <span>Your order details are sent to us on WhatsApp</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">2</span>
                <span>We confirm availability and share our payment ID (UPI/GPay/PhonePe)</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">3</span>
                <span>You make the payment and share the screenshot</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">4</span>
                <span>We pack your tea fresh the night before / same morning and ship next working day</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-mint text-brand-green text-xs font-bold flex items-center justify-center">5</span>
                <span>You receive it with a full 14 days of freshness — no preservatives needed!</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
