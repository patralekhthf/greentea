"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type Order = {
  id:                 string;
  orderNumber:        string;
  status:             string;
  customerName:       string | null;
  customerMobile:     string;
  paymentMethod:      string;
  items:              { sku: string; name: string; size: string; quantity: number; price: number }[];
  itemCount:          number;
  subtotal:           string;
  city:               string | null;
  countryCode:        string | null;
  whatsappSentAt:     string | null;
  paidAt:             string | null;
  shippedAt:          string | null;
  deliveredAt:        string | null;
  createdAt:          string;
  internalNotes:      string | null;
  // Phase 1 UPI
  upiVpa:             string | null;
  upiUtr:             string | null;
  paymentSubmittedAt: string | null;
  paymentVerified:    boolean;
  paymentVerifiedAt:  string | null;
};

const STATUS_OPTIONS = [
  "PLACED", "CONFIRMED", "PAYMENT_AWAITED", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED",
] as const;

const STATUS_COLORS: Record<string, string> = {
  PLACED:          "bg-blue-100 text-blue-800",
  CONFIRMED:       "bg-indigo-100 text-indigo-800",
  PAYMENT_AWAITED: "bg-amber-100 text-amber-800",
  PAID:            "bg-emerald-100 text-emerald-800",
  PACKED:          "bg-teal-100 text-teal-800",
  SHIPPED:         "bg-violet-100 text-violet-800",
  DELIVERED:       "bg-green-100 text-green-800",
  CANCELLED:       "bg-red-100 text-red-800",
};

function formatINR(n: string | number) {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return `₹${v.toFixed(0)}`;
}

function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function OrdersClient() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>("");
  const [search, setSearch]   = useState("");
  const [open, setOpen]       = useState<Order | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/farmers-market/orders?${params.toString()}`);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => { void load(); }, [filter]);

  const stats = useMemo(() => {
    const total      = orders.length;
    const delivered  = orders.filter((o) => o.status === "DELIVERED").length;
    const inFlight   = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length;
    const revenue    = orders
      .filter((o) => !["CANCELLED"].includes(o.status))
      .reduce((s, o) => s + parseFloat(o.subtotal), 0);
    return { total, delivered, inFlight, revenue };
  }, [orders]);

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/admin/farmers-market/orders/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      if (open?.id === id) setOpen({ ...open, ...updated });
    }
  }

  async function saveNotes(id: string, notes: string) {
    const res = await fetch(`/api/admin/farmers-market/orders/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ internalNotes: notes }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, internalNotes: notes } : o)));
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmers Market — Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Fulfillment workflow for local WhatsApp orders.</p>
        </div>
        <Link
          href="/admin/farmers-market/carts"
          className="text-sm text-brand-green hover:underline"
        >
          View carts &amp; analytics →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Stat label="Total orders"   value={String(stats.total)} />
        <Stat label="In flight"      value={String(stats.inFlight)} />
        <Stat label="Delivered"      value={String(stats.delivered)} />
        <Stat label="Revenue (live)" value={formatINR(stats.revenue)} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === ""} onClick={() => setFilter("")}>All</FilterChip>
          {STATUS_OPTIONS.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</FilterChip>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); void load(); }}
          className="ml-auto flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, name, mobile…"
            className="px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage"
          />
          <button type="submit" className="px-4 py-2 text-sm bg-brand-green text-white rounded-full hover:bg-brand-mid">Search</button>
        </form>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No orders match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Placed</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{o.customerName || "—"}</p>
                      <p className="text-xs text-gray-500">+91 {o.customerMobile}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{o.itemCount} item{o.itemCount === 1 ? "" : "s"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatINR(o.subtotal)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-sage ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setOpen(o)}
                        className="text-xs font-semibold text-brand-green hover:underline"
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {open && (
        <OrderDetailDrawer
          order={open}
          onClose={() => setOpen(null)}
          onStatusChange={(s) => updateStatus(open.id, s)}
          onSaveNotes={(n) => saveNotes(open.id, n)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
        active ? "bg-brand-green text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-sage"
      }`}
    >
      {children}
    </button>
  );
}

function OrderDetailDrawer({
  order, onClose, onStatusChange, onSaveNotes,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (s: string) => void;
  onSaveNotes: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(order.internalNotes ?? "");
  useEffect(() => { setNotes(order.internalNotes ?? ""); }, [order.id, order.internalNotes]);

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="ml-auto w-full max-w-xl bg-white h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-mono">{order.orderNumber}</p>
            <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600 leading-none">×</button>
        </header>

        <div className="p-6 space-y-6">
          {/* Status pill + workflow */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</p>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={`text-sm font-semibold px-3 py-2 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-sage ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          {/* Customer */}
          <Section title="Customer">
            <KV k="Name"          v={order.customerName || "—"} />
            <KV k="Mobile"        v={`+91 ${order.customerMobile}`} />
            <KV k="Payment"       v={order.paymentMethod} />
          </Section>

          {/* Items table */}
          <Section title="Items">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2">SKU</th>
                    <th className="text-left px-3 py-2">Item</th>
                    <th className="text-left px-3 py-2">Size</th>
                    <th className="text-right px-3 py-2">Qty</th>
                    <th className="text-right px-3 py-2">Price</th>
                    <th className="text-right px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-mono">{i.sku}</td>
                      <td className="px-3 py-2 text-gray-900">{i.name}</td>
                      <td className="px-3 py-2">{i.size}</td>
                      <td className="px-3 py-2 text-right">{i.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatINR(i.price)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatINR(i.price * i.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-white">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right font-semibold text-gray-700">Subtotal</td>
                    <td className="px-3 py-2 text-right font-bold text-brand-green">{formatINR(order.subtotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment (UPI)">
            {order.upiUtr ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-emerald-900">Customer says paid</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    order.paymentVerified
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-200 text-amber-900"
                  }`}>
                    {order.paymentVerified ? "✓ Verified" : "Unverified"}
                  </span>
                </div>
                <KV k="UTR / Ref" v={order.upiUtr} />
                <KV k="Paid to VPA" v={order.upiVpa ?? "—"} />
                <KV k="Submitted at" v={formatDate(order.paymentSubmittedAt)} />
                {order.paymentVerified && (
                  <KV k="Verified at" v={formatDate(order.paymentVerifiedAt)} />
                )}
                <div className="pt-2">
                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/admin/farmers-market/orders/${order.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentVerified: !order.paymentVerified }),
                      });
                      if (res.ok) {
                        const updated = await res.json();
                        // crude refresh — parent state updates via prop on next open
                        Object.assign(order, updated);
                        // force re-render
                        setNotes((n) => n);
                      }
                    }}
                    className={`w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                      order.paymentVerified
                        ? "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {order.paymentVerified ? "Mark as unverified" : "Mark as verified ✓"}
                  </button>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    Cross-check the UTR <span className="font-mono">{order.upiUtr}</span> in your UPI app&apos;s transaction history before verifying.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-900">
                  Customer hasn&apos;t submitted a UTR yet — payment will be coordinated over WhatsApp.
                </p>
              </div>
            )}
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            <KV k="Order placed"     v={formatDate(order.createdAt)} />
            <KV k="WhatsApp sent"    v={formatDate(order.whatsappSentAt)} />
            <KV k="Paid (claimed)"   v={formatDate(order.paidAt)} />
            <KV k="Payment verified" v={formatDate(order.paymentVerifiedAt)} />
            <KV k="Shipped"          v={formatDate(order.shippedAt)} />
            <KV k="Delivered"        v={formatDate(order.deliveredAt)} />
          </Section>

          {/* Location */}
          <Section title="Customer Location (at order time)">
            <KV k="City"             v={order.city ?? "—"} />
            <KV k="Country"          v={order.countryCode ?? "—"} />
          </Section>

          {/* Internal notes */}
          <Section title="Internal notes">
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onSaveNotes(notes)}
              placeholder="Add a note for your team — saved on blur."
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage"
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-900 font-medium text-right">{v}</span>
    </div>
  );
}
