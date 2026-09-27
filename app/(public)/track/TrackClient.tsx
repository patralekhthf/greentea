"use client";

import { useState } from "react";
import Link from "next/link";
import UpiPaymentStep from "@/components/local/UpiPaymentStep";
import { DELIVERY_PROMISE } from "@/lib/shipping";

type Upi = { vpa: string; payeeName: string; instructions: string };
type Tracked = {
  orderId: string;
  orderNumber: string;
  placedAt: string;
  orderStatus: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentSubmitted: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  items: { name: string; size: string | null; quantity: number; total: number }[];
  shipTo: string | null;
  tracking: { courier: string; trackingNumber: string; trackingUrl: string | null; shippedAt: string | null; deliveredAt: string | null } | null;
};

const inr = (n: number) => `₹${n.toFixed(0)}`;
const STEPS = ["Placed", "Payment confirmed", "Shipped", "Delivered"] as const;

function stepIndex(o: Tracked) {
  if (o.orderStatus === "DELIVERED") return 3;
  if (o.orderStatus === "SHIPPED") return 2;
  if (o.paymentStatus === "SUCCESS" || o.orderStatus === "CONFIRMED") return 1;
  return 0;
}

export default function TrackClient({ upi }: { upi: Upi | null }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [order, setOrder] = useState<Tracked | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const q = new URLSearchParams({ orderNumber: orderNumber.trim(), mobile });
      const res = await fetch(`/api/orders/track?${q}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setOrder(null); setError(data.error ?? "Order not found."); return; }
      setOrder(data as Tracked);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitUtr(utr: string) {
    if (!order) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr, mobile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Could not save your payment reference."); return; }
      await lookup();
    } finally {
      setPaying(false);
    }
  }

  const canPay = order && upi && order.paymentStatus === "PENDING" && !order.paymentSubmitted && order.orderStatus !== "CANCELLED";

  return (
    <div className="min-h-[70vh] bg-brand-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-brand-green mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Track your order
        </h1>
        <p className="text-sm text-brand-muted mb-6">
          Enter the order number from your confirmation (it starts with KG-) and the mobile you used at checkout.
          Farmers Market orders are tracked on WhatsApp.
        </p>

        <form onSubmit={lookup} className="bg-white rounded-2xl border border-brand-border p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-semibold text-brand-muted mb-1.5">Order number</span>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="KG-20260927-0001"
              className="w-full px-4 py-2.5 text-sm font-mono border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-brand-muted mb-1.5">Mobile</span>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              placeholder="10-digit mobile"
              className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !orderNumber || mobile.length !== 10}
            className="px-6 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-mid disabled:opacity-50"
          >
            {loading ? "Checking…" : "Track"}
          </button>
        </form>

        {error && <p className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</p>}

        {order && (
          <div className="mt-6 space-y-6">
            <section className="bg-white rounded-2xl border border-brand-border p-5">
              <div className="flex flex-wrap justify-between gap-2 mb-5">
                <p className="font-mono text-sm">{order.orderNumber}</p>
                <p className="text-xs text-brand-muted">
                  Placed {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {order.orderStatus === "CANCELLED" ? (
                <p className="text-sm font-semibold text-red-700 bg-red-50 rounded-xl px-4 py-3">This order was cancelled.</p>
              ) : (
                <ol className="grid grid-cols-4 gap-2 text-center">
                  {STEPS.map((label, i) => {
                    const done = i <= stepIndex(order);
                    return (
                      <li key={label}>
                        <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-brand-green text-white" : "bg-brand-mint text-brand-muted"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <p className={`text-[11px] mt-1.5 ${done ? "text-brand-green font-semibold" : "text-brand-muted"}`}>{label}</p>
                      </li>
                    );
                  })}
                </ol>
              )}

              {order.paymentStatus === "PENDING" && order.paymentSubmitted && order.orderStatus !== "CANCELLED" && (
                <p className="text-xs text-brand-muted mt-4">We&apos;ve received your UPI reference and are confirming the payment.</p>
              )}
              {order.tracking && (
                <div className="mt-5 p-4 bg-brand-mint rounded-xl text-sm">
                  <p><strong>{order.tracking.courier}</strong> · <span className="font-mono">{order.tracking.trackingNumber}</span></p>
                  {order.tracking.trackingUrl && (
                    <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-brand-green underline text-xs">
                      Track with the courier →
                    </a>
                  )}
                </div>
              )}
              {order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
                <p className="text-xs text-brand-muted mt-4">🚚 {DELIVERY_PROMISE}</p>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-brand-border p-5 text-sm">
              <ul className="space-y-1.5 mb-3">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span>{i.name} {i.size && <span className="text-brand-muted">({i.size})</span>} × {i.quantity}</span>
                    <span>{inr(i.total)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-brand-border pt-2 space-y-1">
                <div className="flex justify-between text-brand-muted"><span>Delivery</span><span>{inr(order.shipping)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-brand-green">{inr(order.total)}</span></div>
              </div>
              {order.shipTo && <p className="text-xs text-brand-muted mt-3">Shipping to {order.shipTo}</p>}
            </section>

            {canPay && (
              <UpiPaymentStep
                variant="site"
                orderNumber={order.orderNumber}
                amount={order.total}
                upi={upi!}
                onSubmit={submitUtr}
                submitting={paying}
              />
            )}
          </div>
        )}

        <p className="text-xs text-brand-muted mt-10">
          Need help? <Link href="/contact" className="underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
