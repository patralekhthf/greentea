"use client";

import { useState, useEffect, useRef } from "react";

const COUNTRIES = [
  { code: "IN", name: "India",     currency: "INR", symbol: "₹",  flag: "🇮🇳" },
  { code: "US", name: "USA",       currency: "USD", symbol: "$",  flag: "🇺🇸" },
  { code: "GB", name: "UK",        currency: "GBP", symbol: "£",  flag: "🇬🇧" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", flag: "🇦🇺" },
] as const;

type CountryCode = (typeof COUNTRIES)[number]["code"];

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

export default function CountrySwitcher() {
  const [current, setCurrent] = useState<CountryCode>("IN");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getCookie("gt_country") as CountryCode | undefined;
    if (saved && COUNTRIES.find((c) => c.code === saved)) setCurrent(saved);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function select(code: CountryCode) {
    setCurrent(code);
    setCookie("gt_country", code);
    setOpen(false);
    window.location.reload();
  }

  const active = COUNTRIES.find((c) => c.code === current)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:text-brand-green transition-colors px-2 py-1 rounded-md hover:bg-brand-mint"
        aria-label="Select country"
      >
        <span>{active.flag}</span>
        <span className="hidden sm:inline">{active.currency}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-brand-border py-1 z-50">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => select(c.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-mint transition-colors ${
                c.code === current ? "text-brand-green font-semibold" : "text-brand-dark"
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span>{c.name}</span>
              <span className="ml-auto text-brand-muted">{c.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
