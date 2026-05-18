"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Cart = {
  id:             string;
  status:         "ACTIVE" | "CONVERTED" | "ABANDONED";
  items:          { sku: string; name: string; size: string; quantity: number; price: number }[];
  itemCount:      number;
  subtotal:       string;
  customerName:   string | null;
  customerMobile: string | null;
  city:           string | null;
  countryCode:    string | null;
  ipAddress:      string | null;
  createdAt:      string;
  lastSeenAt:     string;
  updatedAt:      string;
  order?:         { id: string; orderNumber: string } | null;
};

type Stats = { active: number; converted: number; abandoned: number };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:     "bg-blue-100 text-blue-800",
  CONVERTED:  "bg-green-100 text-green-800",
  ABANDONED:  "bg-gray-100 text-gray-700",
};

function formatINR(n: string | number) {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return `₹${v.toFixed(0)}`;
}

function formatRelative(s: string) {
  const d   = new Date(s);
  const ms  = Date.now() - d.getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1)   return "just now";
  if (min < 60)  return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `${h}h ago`;
  const day = Math.floor(h / 24);
  return `${day}d ago`;
}

export default function CartsClient() {
  const [carts, setCarts]     = useState<Cart[]>([]);
  const [stats, setStats]     = useState<Stats>({ active: 0, converted: 0, abandoned: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"" | Cart["status"]>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const url = filter ? `/api/admin/farmers-market/carts?status=${filter}` : "/api/admin/farmers-market/carts";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCarts(data.carts);
        setStats(data.stats);
      }
      setLoading(false);
    })();
  }, [filter]);

  const conversionRate = stats.converted + stats.active + stats.abandoned > 0
    ? Math.round((stats.converted / (stats.converted + stats.active + stats.abandoned)) * 100)
    : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmers Market — Carts</h1>
          <p className="text-sm text-gray-500 mt-1">Live carts, conversions and abandons.</p>
        </div>
        <Link
          href="/admin/farmers-market/orders"
          className="text-sm text-brand-green hover:underline"
        >
          View orders →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Stat label="Active carts"    value={String(stats.active)}    tone="blue" />
        <Stat label="Converted"       value={String(stats.converted)} tone="green" />
        <Stat label="Abandoned"       value={String(stats.abandoned)} tone="gray" />
        <Stat label="Conversion rate" value={`${conversionRate}%`}    tone="amber" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <FilterChip active={filter === ""}          onClick={() => setFilter("")}>All</FilterChip>
        <FilterChip active={filter === "ACTIVE"}    onClick={() => setFilter("ACTIVE")}>Active</FilterChip>
        <FilterChip active={filter === "CONVERTED"} onClick={() => setFilter("CONVERTED")}>Converted</FilterChip>
        <FilterChip active={filter === "ABANDONED"} onClick={() => setFilter("ABANDONED")}>Abandoned</FilterChip>
      </div>

      {/* Carts table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-500">Loading…</p>
        ) : carts.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No carts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Cart ID</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-left px-4 py-3">Subtotal</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Started</th>
                  <th className="text-left px-4 py-3">Last seen</th>
                  <th className="text-left px-4 py-3">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.id.slice(-8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.itemCount} item{c.itemCount === 1 ? "" : "s"}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {c.items.slice(0, 2).map((i) => i.name).join(", ")}
                        {c.items.length > 2 ? `, +${c.items.length - 2} more` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatINR(c.subtotal)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {c.city || "—"} {c.countryCode ? `· ${c.countryCode}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500" title={new Date(c.createdAt).toLocaleString()}>
                      {formatRelative(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500" title={new Date(c.lastSeenAt).toLocaleString()}>
                      {formatRelative(c.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3">
                      {c.order ? (
                        <Link
                          href="/admin/farmers-market/orders"
                          className="text-xs font-mono text-brand-green hover:underline"
                        >
                          {c.order.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "gray" | "amber" }) {
  const tones: Record<typeof tone, string> = {
    blue:  "border-blue-100",
    green: "border-green-100",
    gray:  "border-gray-100",
    amber: "border-amber-100",
  };
  return (
    <div className={`bg-white rounded-2xl border-2 ${tones[tone]} px-5 py-4`}>
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
