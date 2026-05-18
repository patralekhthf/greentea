"use client";

import { useEffect, useState } from "react";

type Zone = {
  isActive:       boolean;
  addressLabel:   string;
  centerLat:      number;
  centerLng:      number;
  radiusKm:       number;
  whatsappNumber: string;
  upiVpa:         string;
  upiPayeeName:   string;
  upiInstructions: string;
  bannerText:     string;
  freshnessNote:  string;
  paymentNote:    string;
};

const EMPTY: Zone = {
  isActive:       false,
  addressLabel:   "",
  centerLat:      28.5355,   // Default: South Delhi area
  centerLng:      77.2120,
  radiusKm:       5,
  whatsappNumber: "919XXXXXXXXX",
  upiVpa:         "",
  upiPayeeName:   "",
  upiInstructions: "",
  bannerText:     "You're in our local delivery zone — get ultra-fresh teas via WhatsApp.",
  freshnessNote:  "Zero preservatives. Fresh for 14 days from packaging.",
  paymentNote:    "Pay via WhatsApp, GPay, or any UPI app.",
};

const INPUT = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white";
const LABEL = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function FarmersMarketClient() {
  const [zone, setZone]       = useState<Zone>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const [err, setErr]         = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/local-zone");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setZone({
            isActive:       Boolean(data.isActive),
            addressLabel:   data.addressLabel ?? "",
            centerLat:      Number(data.centerLat),
            centerLng:      Number(data.centerLng),
            radiusKm:       Number(data.radiusKm),
            whatsappNumber: data.whatsappNumber ?? "",
            upiVpa:          data.upiVpa ?? "",
            upiPayeeName:    data.upiPayeeName ?? "",
            upiInstructions: data.upiInstructions ?? "",
            bannerText:     data.bannerText ?? EMPTY.bannerText,
            freshnessNote:  data.freshnessNote ?? EMPTY.freshnessNote,
            paymentNote:    data.paymentNote ?? EMPTY.paymentNote,
          });
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  function set<K extends keyof Zone>(key: K, value: Zone[K]) {
    setZone((z) => ({ ...z, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMsg(""); setErr("");
    try {
      const res = await fetch("/api/admin/local-zone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zone),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMsg("Saved.");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setErr("Geolocation not supported");
      return;
    }
    setErr("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("centerLat", parseFloat(pos.coords.latitude.toFixed(6)));
        set("centerLng", parseFloat(pos.coords.longitude.toFixed(6)));
        setMsg("Set to your current location. Click Save to persist.");
      },
      (e) => setErr(`Geolocation: ${e.message}`),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const mapPreviewSrc = `https://www.google.com/maps?q=${zone.centerLat},${zone.centerLng}&z=12&output=embed`;
  const mapsLink      = `https://www.google.com/maps?q=${zone.centerLat},${zone.centerLng}`;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Farmers Market — Local Zone</h1>
      <p className="text-sm text-gray-500 mb-6">
        Customers within <strong>{zone.radiusKm} km</strong> of your warehouse will see the Farmers Market option.
        They order via WhatsApp and pay via UPI. Move the pin or change the radius any time.
      </p>

      {err && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{err}</div>
      )}
      {msg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">{msg}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-6">
          {/* Activation */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={zone.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="w-5 h-5 accent-brand-green"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Activate Farmers Market</div>
                <div className="text-xs text-gray-500">When off, no local detection runs and the banner stays hidden.</div>
              </div>
            </label>
          </div>

          {/* Address + WhatsApp */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Warehouse details</h3>
            <div>
              <label className={LABEL}>Address label *</label>
              <input
                value={zone.addressLabel}
                onChange={(e) => set("addressLabel", e.target.value)}
                className={INPUT}
                placeholder="e.g. Hauz Khas Warehouse, Delhi"
              />
            </div>
            <div>
              <label className={LABEL}>WhatsApp number * (digits only with country code)</label>
              <input
                value={zone.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                className={INPUT}
                placeholder="919XXXXXXXXX"
              />
              <p className="text-xs text-gray-400 mt-1">
                Example: <code>919999988888</code>. Don&apos;t include +, spaces, or dashes.
              </p>
            </div>
          </div>

          {/* Map / coordinates */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Center pin &amp; radius</h3>
              <button
                onClick={useMyLocation}
                className="text-xs font-semibold text-brand-green hover:text-brand-mid"
              >
                📍 Use my current location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Latitude *</label>
                <input
                  type="number"
                  step="0.000001"
                  value={zone.centerLat}
                  onChange={(e) => set("centerLat", parseFloat(e.target.value))}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Longitude *</label>
                <input
                  type="number"
                  step="0.000001"
                  value={zone.centerLng}
                  onChange={(e) => set("centerLng", parseFloat(e.target.value))}
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Radius: <span className="text-brand-green">{zone.radiusKm} km</span></label>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={zone.radiusKm}
                onChange={(e) => set("radiusKm", parseFloat(e.target.value))}
                className="w-full accent-brand-green"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 km</span>
                <span>10 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Map preview */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <iframe
                key={`${zone.centerLat},${zone.centerLng}`}
                src={mapPreviewSrc}
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-gray-400">
              Tip: open <a href={mapsLink} target="_blank" rel="noreferrer" className="text-brand-green hover:underline">in Google Maps</a> to fine-tune the pin, then copy lat/lng back here.
            </p>
          </div>

          {/* UPI Payment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">UPI Payment</h3>
              <p className="text-xs text-gray-400 mt-1">
                Customers see a per-order QR code (with the exact amount pre-filled) on the checkout page.
                Leave VPA blank to disable the in-checkout payment step.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>UPI VPA *</label>
                <input
                  value={zone.upiVpa}
                  onChange={(e) => set("upiVpa", e.target.value.trim())}
                  className={INPUT}
                  placeholder="kumarikanta218@oksbi"
                />
                <p className="text-[10px] text-gray-400 mt-1">Format: name@bank</p>
              </div>
              <div>
                <label className={LABEL}>Payee Display Name</label>
                <input
                  value={zone.upiPayeeName}
                  onChange={(e) => set("upiPayeeName", e.target.value)}
                  className={INPUT}
                  placeholder="Kanta Kumari"
                />
                <p className="text-[10px] text-gray-400 mt-1">Shown in the customer&apos;s UPI app.</p>
              </div>
            </div>
            <div>
              <label className={LABEL}>UPI Instructions (optional)</label>
              <textarea
                rows={2}
                value={zone.upiInstructions}
                onChange={(e) => set("upiInstructions", e.target.value)}
                className={`${INPUT} resize-none`}
                placeholder="e.g. After paying, share the screenshot on WhatsApp — we'll ship as soon as we verify."
              />
            </div>
            {zone.upiVpa && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                ✅ In-checkout UPI is enabled. Customers will see a dynamic QR + intent link for {zone.upiPayeeName || "the payee"} ({zone.upiVpa}).
              </p>
            )}
          </div>

          {/* Customer-facing copy */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Customer-facing copy</h3>
            <div>
              <label className={LABEL}>Sticky banner text</label>
              <input
                value={zone.bannerText}
                onChange={(e) => set("bannerText", e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Freshness note</label>
              <input
                value={zone.freshnessNote}
                onChange={(e) => set("freshnessNote", e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Payment note</label>
              <input
                value={zone.paymentNote}
                onChange={(e) => set("paymentNote", e.target.value)}
                className={INPUT}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-mid disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
