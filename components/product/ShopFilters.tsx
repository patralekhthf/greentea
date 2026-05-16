"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

const TEA_TYPES = [
  { label: "Green Tea",     slug: "green-tea" },
  { label: "Herbal Tea",    slug: "herbal-tea" },
  { label: "Ayurvedic Tea", slug: "ayurvedic-tea" },
  { label: "Floral Tea",    slug: "floral-tea" },
  { label: "Detox Tea",     slug: "detox-tea" },
  { label: "Gift Packs",    slug: "gift-packs" },
];

const WELLNESS_GOALS = [
  { label: "Better Sleep",      slug: "better-sleep" },
  { label: "Stress Relief",     slug: "stress-relief" },
  { label: "Weight Management", slug: "weight-management" },
  { label: "Immunity Support",  slug: "immunity-support" },
  { label: "Detox & Cleanse",   slug: "detox" },
  { label: "Energy & Focus",    slug: "energy-focus" },
  { label: "Digestion Support", slug: "digestion" },
  { label: "Women's Wellness",  slug: "womens-wellness" },
];

const CAFFEINE_LEVELS = [
  { label: "Caffeine-free", value: "NONE" },
  { label: "Low",           value: "LOW" },
  { label: "Medium",        value: "MEDIUM" },
  { label: "High",          value: "HIGH" },
];

type Section = "teaType" | "wellness" | "caffeine";

export default function ShopFilters({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const searchParams = rawSearchParams ?? new URLSearchParams();
  const [open, setOpen] = useState<Section[]>(["teaType", "wellness", "caffeine"]);

  const currentCategory = searchParams.get("category") ?? "";
  const currentWellness = searchParams.get("wellness") ?? "";
  const currentCaffeine = searchParams.get("caffeine") ?? "";

  const hasFilters = currentCategory || currentWellness || currentCaffeine;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === value) {
        params.delete(key); // toggle off
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("wellness");
    params.delete("caffeine");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  function toggleSection(s: Section) {
    setOpen((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function FilterSection({
    id,
    title,
    children,
  }: {
    id: Section;
    title: string;
    children: React.ReactNode;
  }) {
    const isOpen = open.includes(id);
    return (
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full py-3 text-sm font-semibold text-brand-dark hover:text-brand-green transition-colors"
        >
          {title}
          <svg
            className={`w-4 h-4 transition-transform text-brand-muted ${isOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && <div className="space-y-2 mt-1">{children}</div>}
      </div>
    );
  }

  function CheckItem({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2.5 w-full text-sm py-1 px-1 rounded-lg transition-colors ${
          active
            ? "text-brand-green font-semibold"
            : "text-brand-muted hover:text-brand-dark"
        }`}
      >
        <span
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
            active
              ? "bg-brand-green border-brand-green"
              : "border-brand-border bg-white"
          }`}
        >
          {active && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        {label}
      </button>
    );
  }

  return (
    <aside className={`${isMobile ? "w-full" : "w-64 shrink-0"}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-sage hover:text-brand-green font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-0">
        <FilterSection id="teaType" title="Tea Type">
          {TEA_TYPES.map((t) => (
            <CheckItem
              key={t.slug}
              label={t.label}
              active={currentCategory === t.slug}
              onClick={() => updateParam("category", t.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection id="wellness" title="Wellness Goal">
          {WELLNESS_GOALS.map((w) => (
            <CheckItem
              key={w.slug}
              label={w.label}
              active={currentWellness === w.slug}
              onClick={() => updateParam("wellness", w.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection id="caffeine" title="Caffeine Level">
          {CAFFEINE_LEVELS.map((c) => (
            <CheckItem
              key={c.value}
              label={c.label}
              active={currentCaffeine === c.value}
              onClick={() => updateParam("caffeine", c.value)}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}
