"use client";

import { useState } from "react";
import Link from "next/link";
import { useSiteCart, clearSiteCart, siteCartSubtotal, siteCartUnits } from "@/lib/site-cart";
import { DELIVERY_PROMISE, shippingFor } from "@/lib/shipping";
import { EMAIL_RE, INDIAN_STATES, MOBILE_RE, PINCODE_RE } from "@/lib/india";
import UpiPaymentStep from "@/components/local/UpiPaymentStep";

type Upi = { vpa: string; payeeName: string; instructions: string };
type Placed = { orderId: string; orderNumber: string; subtotal: number; shipping: number; total: number };

const inr = (n: number) => `₹${n.toFixed(0)}`;
const INPUT = "w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-sage";

const EMPTY = { name: "", mobile: "", email: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function CheckoutClient({ upi }: { upi: Upi | null }) {
  const { cart, ready } = useSiteCart();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState<"details" | "pay" | "done">("details");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const units = siteCartUnits(cart);
  const subtotal = siteCartSubtotal(cart);
  const shipping = shippingFor(units);
  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const invalid = {
    name: form.name.trim().length < 2,
    mobile: !MOBILE_RE.test(form.mobile),
    email: !EMAIL_RE.test(form.email.trim()),
    line1: form.line1.trim().length < 5,
    city: form.city.trim().length < 2,
    state: !form.state,
    pincode: !PINCODE_RE.test(form.pincode),
  };
  const formValid = !Object.values(invalid).some(Boolean);
  const showErr = (k: keyof typeof invalid) => touched && invalid[k];

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError("");
    if (!formValid || !upi) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
          customer: { name: form.name, mobile: form.mobile, email: form.email },
          address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Something went wrong (${res.status}). Please try again.`);
        return;
      }
      setPlaced(data as Placed);
      setStep("pay");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitUtr(utr: string) {
    if (!placed) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${placed.orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr, mobile: form.mobile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save your payment reference. Please try again.");
        return;
      }
      clearSiteCart();
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return <div className="min-h-[60vh] bg-brand-cream" />;

  /* ── Done ─────────────────────────────────────────────── */
  if (step === "done" && placed) {
    return (
      <div className="min-h-[60vh] bg-brand-cream">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Thank you! Your order is placed
          </h1>
          <p className="inline-block font-mono text-sm bg-brand-mint text-brand-green px-3 py-1 rounded-full mb-4">
            {placed.orderNumber}
          </p>
          <p className="text-sm text-brand-muted mb-2">
            We&apos;ll confirm your UPI payment of <strong>{inr(placed.total)}</strong> and start packing.
          </p>
          <p className="text-sm text-brand-muted mb-8">🚚 {DELIVERY_PROMISE}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/track" className="px-6 py-3 bg-brand-green text-white text-sm font-semibold rounded-full hover:bg-brand-mid">
              Track your order
            </Link>
            <Link href="/shop" className="px-6 py-3 border border-brand-border text-sm font-semibold rounded-full hover:bg-brand-mint">
              Continue shopping
            </Link>
          </div>
          <p className="text-xs text-brand-muted mt-6">
            Save your order number. You&apos;ll need it with your mobile ({form.mobile}) to track the order.
          </p>
        </div>
      </div>
    );
  }

  /* ── Pay ──────────────────────────────────────────────── */
  if (step === "pay" && placed && upi) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white rounded-2xl border border-brand-border p-4 mb-6 text-sm flex flex-wrap justify-between gap-2">
            <span className="text-brand-muted">
              Order <span className="font-mono text-brand-dark">{placed.orderNumber}</span> · {units} {units === 1 ? "pack" : "packs"}
            </span>
            <span>
              {inr(placed.subtotal)} + {inr(placed.shipping)} delivery = <strong className="text-brand-green">{inr(placed.total)}</strong>
            </span>
          </div>
          <UpiPaymentStep
            variant="site"
            orderNumber={placed.orderNumber}
            amount={placed.total}
            upi={upi}
            onSubmit={submitUtr}
            submitting={submitting}
          />
          {error && <p className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</p>}
          <p className="text-xs text-brand-muted text-center mt-6">
            Your order is saved. If you leave this page, you can pay later: find it on the{" "}
            <Link href="/track" className="underline">Track Order</Link> page with {placed.orderNumber} and your mobile.
          </p>
        </div>
      </div>
    );
  }

  /* ── Empty ────────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-brand-cream">
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-brand-green mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Your cart is empty
          </h1>
          <Link href="/shop" className="inline-block bg-brand-green text-white text-sm font-semibold px-6 py-3 rounded-full">
            Shop Premixes →
          </Link>
        </div>
      </div>
    );
  }

  /* ── Details ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-3xl font-bold text-brand-green" style={{ fontFamily: "var(--font-display)" }}>
            Checkout
          </h1>
          <Link href="/cart" className="text-sm text-brand-muted hover:text-brand-green">← Back to cart</Link>
        </div>

        <form onSubmit={placeOrder} noValidate className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-brand-border p-5 sm:p-6">
              <h2 className="text-lg font-bold text-brand-green mb-4" style={{ fontFamily: "var(--font-display)" }}>Contact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" error={showErr("name") && "Please enter your name"} className="sm:col-span-2">
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT} autoComplete="name" />
                </Field>
                <Field label="Mobile" error={showErr("mobile") && "Enter a 10-digit Indian mobile"}>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 text-sm bg-brand-mint rounded-xl border border-brand-border">+91</span>
                    <input
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      className={INPUT}
                    />
                  </div>
                </Field>
                <Field label="Email (for your order confirmation)" error={showErr("email") && "Enter a valid email"}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={INPUT} autoComplete="email" />
                </Field>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-brand-border p-5 sm:p-6">
              <h2 className="text-lg font-bold text-brand-green mb-4" style={{ fontFamily: "var(--font-display)" }}>Delivery address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="House / flat, street" error={showErr("line1") && "Please enter your address"} className="sm:col-span-2">
                  <input value={form.line1} onChange={(e) => set("line1", e.target.value)} className={INPUT} autoComplete="address-line1" />
                </Field>
                <Field label="Area, landmark (optional)" className="sm:col-span-2">
                  <input value={form.line2} onChange={(e) => set("line2", e.target.value)} className={INPUT} autoComplete="address-line2" />
                </Field>
                <Field label="City" error={showErr("city") && "Please enter your city"}>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} className={INPUT} autoComplete="address-level2" />
                </Field>
                <Field label="Pincode" error={showErr("pincode") && "Enter a valid 6-digit pincode"}>
                  <input
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={INPUT}
                  />
                </Field>
                <Field label="State" error={showErr("state") && "Please choose your state"} className="sm:col-span-2">
                  <select value={form.state} onChange={(e) => set("state", e.target.value)} className={INPUT} autoComplete="address-level1">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </section>
          </div>

          <aside className="bg-white rounded-2xl border border-brand-border p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-brand-green mb-4" style={{ fontFamily: "var(--font-display)" }}>Your order</h2>
            <ul className="space-y-2 text-sm mb-4">
              {cart.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-3">
                  <span className="text-brand-dark">{i.name} <span className="text-brand-muted">({i.size}) × {i.quantity}</span></span>
                  <span className="shrink-0 font-semibold">{inr(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm border-t border-brand-border pt-3">
              <div className="flex justify-between"><dt className="text-brand-muted">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-brand-muted">Delivery</dt><dd>{inr(shipping)}</dd></div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-brand-border">
                <dt>Total</dt><dd className="text-brand-green">{inr(subtotal + shipping)}</dd>
              </div>
            </dl>
            {upi ? (
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full bg-brand-green text-white font-semibold py-3.5 rounded-full hover:bg-brand-mid transition-colors disabled:opacity-50"
              >
                {submitting ? "Placing order…" : "Continue to UPI Payment →"}
              </button>
            ) : (
              <p className="mt-5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Online payment isn&apos;t set up yet. Please check back soon.
              </p>
            )}
            {touched && !formValid && (
              <p className="text-xs text-red-600 text-center mt-3">Please fix the highlighted fields.</p>
            )}
            {error && <p className="mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</p>}
            <p className="text-xs text-brand-muted text-center mt-3">🚚 {DELIVERY_PROMISE}</p>
            <p className="text-[11px] text-brand-muted text-center mt-2">
              By placing this order you agree to our <Link href="/legal/terms" className="underline">Terms</Link>,{" "}
              <Link href="/legal/refund" className="underline">Refund</Link> and{" "}
              <Link href="/legal/shipping" className="underline">Shipping</Link> policies.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, error, className = "", children,
}: { label: string; error?: string | false; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-brand-muted mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}
