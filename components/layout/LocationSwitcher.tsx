"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Standard countries — drive currency/pricing
const COUNTRIES = [
  { code: "IN", name: "India",     currency: "INR", symbol: "₹",  flag: "🇮🇳" },
  { code: "US", name: "USA",       currency: "USD", symbol: "$",  flag: "🇺🇸" },
  { code: "GB", name: "UK",        currency: "GBP", symbol: "£",  flag: "🇬🇧" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", flag: "🇦🇺" },
] as const;

// Special location code for the Farmers Market view.
// Currency is forced to INR (the market only sells in India).
const FARMERS_MARKET_CODE = "DELHI_FM" as const;

type Choice =
  | { kind: "country"; code: (typeof COUNTRIES)[number]["code"]; name: string; flag: string; currency: string }
  | { kind: "market";  code: typeof FARMERS_MARKET_CODE;        name: string; flag: string; currency: string; addressLabel?: string };

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

export default function LocationSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [marketEnabled, setMarketEnabled] = useState(false);
  const [marketLabel, setMarketLabel] = useState("Delhi Farmers Market");
  const [current, setCurrent] = useState<string>("IN"); // country code OR FARMERS_MARKET_CODE
  const ref = useRef<HTMLDivElement>(null);

  // Load current preference and check if market is enabled
  useEffect(() => {
    const view = getCookie("gt_location_view");
    if (view === FARMERS_MARKET_CODE) {
      setCurrent(FARMERS_MARKET_CODE);
    } else {
      const c = getCookie("gt_country");
      if (c && COUNTRIES.find((x) => x.code === c)) setCurrent(c);
    }

    void (async () => {
      try {
        const res = await fetch("/api/local/check");
        const data = await res.json();
        if (data?.active) {
          setMarketEnabled(true);
          if (data.zone?.addressLabel) setMarketLabel(data.zone.addressLabel);
        }
      } catch {}
    })();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function selectCountry(code: (typeof COUNTRIES)[number]["code"]) {
    setCurrent(code);
    setCookie("gt_country", code);
    // Clear any farmers-market view override
    document.cookie = `gt_location_view=; path=/; max-age=0; samesite=lax`;
    setOpen(false);
    window.location.reload();
  }

  function selectMarket() {
    setCurrent(FARMERS_MARKET_CODE);
    // Force currency to INR for the farmers market view
    setCookie("gt_country", "IN");
    setCookie("gt_location_view", FARMERS_MARKET_CODE);
    setOpen(false);
    router.push("/farmers-market");
  }

  // Build the active choice for the button label
  const active: Choice =
    current === FARMERS_MARKET_CODE
      ? { kind: "market", code: FARMERS_MARKET_CODE, name: marketLabel, flag: "🌱", currency: "INR", addressLabel: marketLabel }
      : (() => {
          const c = COUNTRIES.find((x) => x.code === current) ?? COUNTRIES[0];
          return { kind: "country", code: c.code, name: c.name, flag: c.flag, currency: c.currency };
        })();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:text-brand-green transition-colors px-2 py-1 rounded-md hover:bg-brand-mint"
        aria-label="Select location"
      >
        <span>{active.flag}</span>
        <span className="hidden sm:inline">
          {active.kind === "market" ? "FM" : active.currency}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-brand-border py-1 z-50">
          {/* Countries */}
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => selectCountry(c.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-mint transition-colors ${
                current === c.code ? "text-brand-green font-semibold" : "text-brand-dark"
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span>{c.name}</span>
              <span className="ml-auto text-brand-muted">{c.currency}</span>
            </button>
          ))}

          {/* Farmers Market — special pseudo-location */}
          {marketEnabled && (
            <>
              <div className="border-t border-brand-border my-1" />
              <div className="px-4 py-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Local Markets</p>
              </div>
              <button
                onClick={selectMarket}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-mint transition-colors ${
                  current === FARMERS_MARKET_CODE ? "text-brand-green font-semibold" : "text-brand-dark"
                }`}
              >
                <span className="text-base">🌱</span>
                <div className="flex flex-col items-start min-w-0">
                  <span className="truncate">{marketLabel}</span>
                  <span className="text-[10px] text-brand-muted">Order locally via WhatsApp</span>
                </div>
                <span className="ml-auto text-brand-muted shrink-0">INR</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
