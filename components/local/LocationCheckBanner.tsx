"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type CheckResult = {
  active:      boolean;
  inZone:      boolean;
  distanceKm?: number;
  resolvedFrom?: "geo" | "pincode" | null;
  pincodeLabel?: string;
  zone?: {
    addressLabel:   string;
    radiusKm:       number;
    whatsappNumber: string;
    bannerText:     string;
    freshnessNote:  string;
    paymentNote:    string;
  };
};

const COOKIE_NAME = "gt_local_check";   // value: "in", "out", or "skip"
const COOKIE_DAYS = 7;

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;)\\s*" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function LocationCheckBanner({ country }: { country: string }) {
  const pathname = usePathname();
  const [state, setState] = useState<"hidden" | "prompt" | "pincode" | "in" | "out" | "checking">("hidden");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [zoneActive, setZoneActive] = useState<boolean | null>(null);

  // Only show in India + only when zone is active + only if not on farmers-market page itself
  const path = pathname ?? "/";
  const eligible = country === "IN" && !path.startsWith("/farmers-market") && !path.startsWith("/admin");

  useEffect(() => {
    if (!eligible) { setState("hidden"); return; }

    // Check if zone is enabled before showing anything
    void (async () => {
      try {
        const probe = await fetch("/api/local/check");
        const data  = await probe.json().catch(() => ({}));
        if (!data?.active) {
          setZoneActive(false);
          setState("hidden");
          return;
        }
        setZoneActive(true);
      } catch {
        setZoneActive(false);
        setState("hidden");
        return;
      }

      const prior = getCookie(COOKIE_NAME);
      if (prior === "in" || prior === "out" || prior === "skip") {
        // Try auto-loading from previous decision
        if (prior === "in") setState("in");
        else setState("hidden");
        return;
      }
      setState("prompt");
    })();
  }, [eligible]);

  if (state === "hidden" || !eligible || zoneActive === false) return null;

  async function checkWithGeolocation() {
    if (!navigator.geolocation) {
      setState("pincode");
      return;
    }
    setState("checking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/local/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          const data = (await res.json()) as CheckResult;
          handleResult(data);
        } catch {
          setState("pincode");
        }
      },
      () => setState("pincode"),
      { timeout: 8000, maximumAge: 60_000 }
    );
  }

  async function checkWithPincode(e?: React.FormEvent) {
    e?.preventDefault();
    setPincodeError("");
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeError("Enter a valid 6-digit Indian pincode.");
      return;
    }
    setState("checking");
    try {
      const res = await fetch("/api/local/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode }),
      });
      const data = (await res.json()) as CheckResult & { error?: string };
      if (!res.ok) {
        setPincodeError(data.error ?? "Lookup failed");
        setState("pincode");
        return;
      }
      handleResult(data);
    } catch {
      setPincodeError("Network error. Try again.");
      setState("pincode");
    }
  }

  function handleResult(data: CheckResult) {
    setResult(data);
    if (data.inZone) {
      setCookie(COOKIE_NAME, "in", COOKIE_DAYS);
      setState("in");
    } else {
      setCookie(COOKIE_NAME, "out", COOKIE_DAYS);
      setState("out");
    }
  }

  function dismiss() {
    setCookie(COOKIE_NAME, "skip", COOKIE_DAYS);
    setState("hidden");
  }

  // ─── Render different states ──────────────────────────────────────────

  // IN ZONE — sticky promo
  if (state === "in") {
    return (
      <div className="sticky top-0 z-40 bg-gradient-to-r from-brand-green via-brand-mid to-brand-green text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">🌱</span>
            <p className="text-sm text-white/95 truncate">
              <span className="font-semibold">You&apos;re in our local zone!</span>{" "}
              <span className="hidden sm:inline">{result?.zone?.bannerText ?? "Ultra-fresh teas via WhatsApp."}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/farmers-market"
              className="bg-white text-brand-green text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-brand-mint transition-colors whitespace-nowrap"
            >
              Farmers Market →
            </Link>
            <button onClick={dismiss} aria-label="Dismiss" className="text-white/70 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // INITIAL PROMPT
  if (state === "prompt" || state === "checking") {
    return (
      <div className="sticky top-0 z-40 bg-brand-mint border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">📍</span>
            <p className="text-sm text-brand-dark truncate">
              <span className="font-semibold">Get ultra-fresh teas locally.</span>{" "}
              <span className="hidden sm:inline text-brand-muted">Check if you&apos;re in our delivery area.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={checkWithGeolocation}
              disabled={state === "checking"}
              className="bg-brand-green text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-brand-mid disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {state === "checking" ? "Checking…" : "Check Now"}
            </button>
            <button onClick={dismiss} aria-label="Dismiss" className="text-brand-muted hover:text-brand-dark p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PINCODE FALLBACK
  if (state === "pincode") {
    return (
      <div className="sticky top-0 z-40 bg-brand-mint border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <form onSubmit={checkWithPincode} className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg shrink-0">📮</span>
            <span className="text-sm font-medium text-brand-dark hidden sm:inline shrink-0">Enter your pincode:</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="110001"
              className="px-3 py-1.5 text-sm border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-sage w-24"
            />
            <button
              type="submit"
              className="bg-brand-green text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-brand-mid transition-colors whitespace-nowrap"
            >
              Check
            </button>
            {pincodeError && (
              <span className="text-xs text-red-600 hidden md:inline truncate">{pincodeError}</span>
            )}
          </form>
          <button onClick={dismiss} aria-label="Dismiss" className="text-brand-muted hover:text-brand-dark p-1 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {pincodeError && (
          <div className="md:hidden max-w-7xl mx-auto px-4 pb-2 text-xs text-red-600">{pincodeError}</div>
        )}
      </div>
    );
  }

  // OUT OF ZONE — brief acknowledgement
  if (state === "out") {
    return (
      <div className="sticky top-0 z-40 bg-brand-cream border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg shrink-0">📍</span>
            <p className="text-sm text-brand-dark truncate">
              <span className="font-semibold">You&apos;re outside our local zone</span>
              {result?.distanceKm ? <span className="text-brand-muted"> · ~{result.distanceKm} km away</span> : null}
              <span className="text-brand-muted hidden sm:inline"> — order online with free shipping over ₹499.</span>
            </p>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-brand-muted hover:text-brand-dark p-1 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
