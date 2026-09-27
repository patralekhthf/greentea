"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  subtotal: string;
  shippingAmount: string;
  totalAmount: string;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  orderStatus: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentReference: string | null;
  paymentSubmittedAt: string | null;
  paymentVerifiedAt: string | null;
  createdAt: string;
  items: { id: string; productNameSnapshot: string; skuSnapshot: string | null; sizeSnapshot: string | null; quantity: number; unitPrice: string; totalPrice: string }[];
  address: { fullName: string; addressLine1: string; addressLine2: string | null; city: string; state: string; pincode: string } | null;
  tracking: { courierName: string; trackingNumber: string; trackingUrl: string | null; shippedAt: string | null; deliveredAt: string | null } | null;
};

const VIEWS = [
  { key: "to-verify", label: "Verify payment" },
  { key: "to-ship",   label: "To ship" },
  { key: "shipped",   label: "Shipped" },
  { key: "unpaid",    label: "Not paid yet" },
  { key: "all",       label: "All" },
] as const;

const inr = (v: string | number) => `₹${Number(v).toFixed(0)}`;
const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

function statusBadge(o: Order) {
  if (o.orderStatus === "CANCELLED") return ["Cancelled", "bg-gray-100 text-gray-600"];
  if (o.orderStatus === "DELIVERED") return ["Delivered", "bg-green-100 text-green-800"];
  if (o.orderStatus === "SHIPPED") return ["Shipped", "bg-violet-100 text-violet-800"];
  if (o.paymentStatus === "SUCCESS") return ["Paid · to ship", "bg-emerald-100 text-emerald-800"];
  if (o.paymentReference) return ["Verify payment", "bg-amber-100 text-amber-800"];
  return ["Awaiting payment", "bg-blue-50 text-blue-700"];
}

export default function WebsiteOrdersClient() {
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("to-verify");
  const [q, setQ] = useState("");
  // Results remember which query produced them, so "loading" is derived rather than set in an effect
  const [result, setResult] = useState<{ key: string; orders: Order[] } | null>(null);
  const [searchKey, setSearchKey] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState<Order | null>(null);
  const key = `${view}|${searchKey}|${refresh}`;
  const loading = result?.key !== key;
  const orders = result?.orders ?? [];

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ view, ...(searchKey ? { q: searchKey } : {}) });
    fetch(`/api/admin/orders?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Order[]) => { if (!cancelled) setResult({ key, orders: data }); });
    return () => { cancelled = true; };
  }, [key, view, searchKey]);

  async function act(id: string, body: Record<string, string>) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "Update failed"); return; }
    setOpen(data);
    setRefresh((n) => n + 1);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Website Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          All-India orders paid by UPI. Verify each UTR in your bank / UPI app before marking it paid.
          Farmers Market (WhatsApp) orders are under Farmers Market → Orders.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full ${view === v.key ? "bg-brand-green text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-sage"}`}
          >
            {v.label}
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); setSearchKey(q.trim()); }} className="ml-auto flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order #, name, mobile, UTR…"
            className="px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage"
          />
          <button className="px-4 py-2 text-sm bg-brand-green text-white rounded-full">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No orders here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Ship to</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">UTR</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => {
                const [label, tone] = statusBadge(o);
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{o.orderNumber}</p>
                      <p className="text-xs text-gray-400">{when(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-gray-500">+91 {o.customerMobile}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{o.address ? `${o.address.city}, ${o.address.pincode}` : "—"}</td>
                    <td className="px-4 py-3 font-semibold">{inr(o.totalAmount)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{o.paymentReference ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tone}`}>{label}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setOpen(o)} className="text-xs font-semibold text-brand-green hover:underline">Open →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {open && <OrderDrawer order={open} onClose={() => setOpen(null)} onAction={(b) => act(open.id, b)} />}
    </div>
  );
}

function OrderDrawer({ order, onClose, onAction }: { order: Order; onClose: () => void; onAction: (b: Record<string, string>) => void }) {
  const [courier, setCourier] = useState(order.tracking?.courierName ?? "");
  const [awb, setAwb] = useState(order.tracking?.trackingNumber ?? "");
  const [trackUrl, setTrackUrl] = useState(order.tracking?.trackingUrl ?? "");
  const cancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40" onClick={onClose}>
      <div className="ml-auto w-full max-w-xl bg-white h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
          <div>
            <p className="font-mono text-xs text-gray-500">{order.orderNumber}</p>
            <h2 className="text-lg font-bold">{order.customerName}</h2>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
        </header>

        <div className="p-6 space-y-6 text-sm">
          {/* Payment */}
          <section className="rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">1 · Payment (UPI)</h3>
            {order.paymentStatus === "SUCCESS" ? (
              <p className="text-emerald-700">✓ Verified {when(order.paymentVerifiedAt)} · UTR <span className="font-mono">{order.paymentReference}</span></p>
            ) : order.paymentReference ? (
              <>
                <p>Customer submitted UTR <span className="font-mono font-semibold">{order.paymentReference}</span> at {when(order.paymentSubmittedAt)}.</p>
                <p className="text-xs text-gray-500 mt-1">Check that {inr(order.totalAmount)} with this UTR reached your UPI account.</p>
                {!cancelled && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onAction({ action: "verify-payment" })} className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full">Payment received ✓</button>
                    <button
                      onClick={() => confirm("Clear this UTR? The customer can then pay again from Track Order.") && onAction({ action: "reject-payment" })}
                      className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-full"
                    >
                      Not found — clear UTR
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Not paid yet. The customer can pay from the Track Order page.</p>
            )}
          </section>

          {/* Shipping */}
          <section className="rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">2 · Shipping</h3>
            {order.address && (
              <p className="mb-3 leading-relaxed">
                {order.address.fullName}<br />{order.address.addressLine1}
                {order.address.addressLine2 && <><br />{order.address.addressLine2}</>}
                <br />{order.address.city}, {order.address.state} {order.address.pincode}
                <br />+91 {order.customerMobile} · {order.customerEmail}
              </p>
            )}
            {order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED" ? (
              <p>
                {order.tracking?.courierName} · <span className="font-mono">{order.tracking?.trackingNumber}</span> · shipped {when(order.tracking?.shippedAt ?? null)}
                {order.orderStatus === "DELIVERED" && <><br />✓ Delivered {when(order.tracking?.deliveredAt ?? null)}</>}
              </p>
            ) : null}
            {order.orderStatus === "CONFIRMED" && (
              <div className="grid grid-cols-2 gap-2">
                <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Courier (e.g. Delhivery)" className="px-3 py-2 border border-gray-200 rounded-lg" />
                <input value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="Tracking / AWB number" className="px-3 py-2 border border-gray-200 rounded-lg font-mono" />
                <input value={trackUrl} onChange={(e) => setTrackUrl(e.target.value)} placeholder="Tracking link (optional)" className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg" />
                <button
                  onClick={() => onAction({ action: "mark-shipped", courierName: courier, trackingNumber: awb, trackingUrl: trackUrl })}
                  disabled={!courier.trim() || !awb.trim()}
                  className="col-span-2 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-full disabled:opacity-40"
                >
                  Mark as shipped
                </button>
              </div>
            )}
            {order.orderStatus === "SHIPPED" && (
              <button onClick={() => onAction({ action: "mark-delivered" })} className="mt-3 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-full">
                Mark as delivered
              </button>
            )}
            {order.orderStatus === "PLACED" && <p className="text-xs text-gray-500">Verify the payment first.</p>}
          </section>

          {/* Items */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</h3>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-500">
                <tr><th className="text-left p-2">SKU</th><th className="text-left p-2">Item</th><th className="text-left p-2">Size</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="p-2 font-mono">{i.skuSnapshot ?? "—"}</td>
                    <td className="p-2">{i.productNameSnapshot}</td>
                    <td className="p-2">{i.sizeSnapshot ?? "—"}</td>
                    <td className="p-2 text-right">{i.quantity}</td>
                    <td className="p-2 text-right">{inr(i.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr><td colSpan={4} className="p-2 text-right text-gray-500">Delivery</td><td className="p-2 text-right">{inr(order.shippingAmount)}</td></tr>
                <tr><td colSpan={4} className="p-2 text-right font-semibold">Total</td><td className="p-2 text-right font-bold">{inr(order.totalAmount)}</td></tr>
              </tfoot>
            </table>
          </section>

          {!cancelled && order.orderStatus !== "DELIVERED" && (
            <button
              onClick={() => confirm(`Cancel ${order.orderNumber}? Refund any payment manually.`) && onAction({ action: "cancel" })}
              className="text-xs text-red-600 hover:underline"
            >
              Cancel order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
