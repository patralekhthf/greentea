"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, Circle as LeafletCircle } from "leaflet";

type Props = {
  centerLat: number;
  centerLng: number;
  radiusKm:  number;
  addressLabel: string;
};

type CheckResult = {
  inZone: boolean;
  distanceKm: number;
  pincodeLabel?: string;
};

export default function DeliveryZoneMap({
  centerLat,
  centerLng,
  radiusKm,
  addressLabel,
}: Props) {
  const mapRef          = useRef<HTMLDivElement | null>(null);
  const mapInstance     = useRef<LeafletMap | null>(null);
  const userMarkerRef   = useRef<LeafletMarker | null>(null);
  const radiusCircleRef = useRef<LeafletCircle | null>(null);

  const [pincode, setPincode]   = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult]     = useState<CheckResult | null>(null);
  const [error, setError]       = useState("");

  // ─── Initialise the Leaflet map once ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      // Inject Leaflet CSS once (Next bundles don't auto-import it)
      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-leaflet-css", "true");
        document.head.appendChild(link);
      }
      if (cancelled || !mapRef.current) return;

      // Initial zoom — sized so the radius fits comfortably
      const zoom = radiusKm <= 3 ? 14 : radiusKm <= 7 ? 13 : radiusKm <= 15 ? 12 : radiusKm <= 30 ? 11 : 10;

      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([centerLat, centerLng], zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Centre marker (warehouse)
      const centreIcon = L.divIcon({
        className: "",
        html:
          '<div style="background:#1f3d2b;border:2px solid white;border-radius:9999px;width:18px;height:18px;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
        iconSize:  [18, 18],
        iconAnchor:[9, 9],
      });
      L.marker([centerLat, centerLng], { icon: centreIcon })
        .addTo(map)
        .bindPopup(`<strong>${addressLabel}</strong><br/>Delivery centre`);

      // Delivery boundary circle
      const circle = L.circle([centerLat, centerLng], {
        radius: radiusKm * 1000, // metres
        color: "#1f3d2b",
        fillColor: "#7ab87a",
        fillOpacity: 0.18,
        weight: 2,
      }).addTo(map);

      mapInstance.current     = map;
      radiusCircleRef.current = circle;
    })();

    return () => { cancelled = true; };
  }, [centerLat, centerLng, radiusKm, addressLabel]);

  // ─── Address check ──────────────────────────────────────────────────────
  async function checkPincode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError("Enter a valid 6-digit Indian pincode.");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/local/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lookup failed");
        return;
      }
      setResult({ inZone: data.inZone, distanceKm: data.distanceKm, pincodeLabel: data.pincodeLabel });

      // Drop a marker for the resolved pincode location on the map
      if (mapInstance.current && typeof data.resolvedLat === "number" && typeof data.resolvedLng === "number") {
        const L = (await import("leaflet")).default;
        if (userMarkerRef.current) userMarkerRef.current.remove();
        const youIcon = L.divIcon({
          className: "",
          html:
            '<div style="background:#d4a04a;border:2px solid white;border-radius:9999px;width:16px;height:16px;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
          iconSize:  [16, 16],
          iconAnchor:[8, 8],
        });
        userMarkerRef.current = L.marker([data.resolvedLat, data.resolvedLng], { icon: youIcon })
          .addTo(mapInstance.current)
          .bindPopup(`Pincode ${pincode}`)
          .openPopup();
        const bounds = L.latLngBounds([
          [centerLat, centerLng],
          [data.resolvedLat, data.resolvedLng],
        ]).pad(0.4);
        mapInstance.current.fitBounds(bounds);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setChecking(false);
    }
  }

  async function checkWithGeolocation() {
    setError("");
    setResult(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      return;
    }
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/local/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Check failed");
          } else {
            setResult({ inZone: data.inZone, distanceKm: data.distanceKm });
            // Place a marker on the map
            if (mapInstance.current) {
              const L = (await import("leaflet")).default;
              if (userMarkerRef.current) userMarkerRef.current.remove();
              const youIcon = L.divIcon({
                className: "",
                html:
                  '<div style="background:#d4a04a;border:2px solid white;border-radius:9999px;width:16px;height:16px;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
                iconSize:  [16, 16],
                iconAnchor:[8, 8],
              });
              userMarkerRef.current = L.marker([pos.coords.latitude, pos.coords.longitude], { icon: youIcon })
                .addTo(mapInstance.current)
                .bindPopup("You are here")
                .openPopup();
              // Fit both points
              const bounds = L.latLngBounds([
                [centerLat, centerLng],
                [pos.coords.latitude, pos.coords.longitude],
              ]).pad(0.4);
              mapInstance.current.fitBounds(bounds);
            }
          }
        } catch {
          setError("Network error. Try again.");
        } finally {
          setChecking(false);
        }
      },
      (err) => {
        setError(`Could not get location: ${err.message}`);
        setChecking(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      {/* Map */}
      <div ref={mapRef} className="w-full h-72 sm:h-96 bg-brand-mint" />

      {/* Checker */}
      <div className="p-5 sm:p-6 border-t border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-brand-green mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Check if you&apos;re in our delivery zone
            </h3>
            <p className="text-xs text-brand-muted">
              The shaded green area is our {radiusKm} km delivery radius around {addressLabel}.
            </p>
          </div>
          <button
            onClick={checkWithGeolocation}
            disabled={checking}
            className="text-xs font-semibold text-brand-green hover:text-brand-mid disabled:opacity-50 whitespace-nowrap self-start"
          >
            📍 Use my location
          </button>
        </div>

        <form onSubmit={checkPincode} className="flex gap-2 mb-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Enter your 6-digit pincode"
            className="flex-1 px-4 py-2.5 text-sm border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
          />
          <button
            type="submit"
            disabled={checking}
            className="px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-full hover:bg-brand-mid disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {checking ? "Checking…" : "Check"}
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 mb-2">{error}</p>
        )}

        {result && (
          <div
            className={`rounded-xl p-4 text-sm ${
              result.inZone
                ? "bg-green-50 border border-green-200 text-green-900"
                : "bg-amber-50 border border-amber-200 text-amber-900"
            }`}
          >
            {result.inZone ? (
              <>
                <p className="font-semibold">✅ Yes — you&apos;re in our delivery zone!</p>
                <p className="text-xs mt-1 opacity-80">
                  ~{result.distanceKm} km from our warehouse
                  {result.pincodeLabel ? ` · ${result.pincodeLabel.split(",").slice(0, 2).join(",")}` : ""}.
                  Scroll down to order via WhatsApp.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">📍 Not quite — you&apos;re outside our local zone</p>
                <p className="text-xs mt-1 opacity-80">
                  Roughly {result.distanceKm} km from our warehouse (we deliver within {radiusKm} km).
                  You can still order online with regular shipping — free over ₹499.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
