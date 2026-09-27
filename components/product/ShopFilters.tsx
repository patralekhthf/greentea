"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { COOK_WITH, DISH_TYPES, SPICE_LEVELS } from "@/lib/catalog";

// URL params this sidebar owns (also cleared by "Clear all")
const FILTER_PARAMS = ["dish", "cookWith", "spice", "nog"] as const;

type Section = "dish" | "cookWith" | "spice" | "diet";

export default function ShopFilters({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const searchParams = rawSearchParams ?? new URLSearchParams();
  const [open, setOpen] = useState<Section[]>(["dish", "cookWith", "spice", "diet"]);

  const currentDish     = searchParams.get("dish") ?? "";
  const currentCookWith = searchParams.get("cookWith") ?? "";
  const currentSpice    = searchParams.get("spice") ?? "";
  const currentNog      = searchParams.get("nog") ?? "";

  const hasFilters = FILTER_PARAMS.some((p) => searchParams.get(p));

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
    FILTER_PARAMS.forEach((p) => params.delete(p));
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
        <FilterSection id="dish" title="Dish Type">
          {DISH_TYPES.map((d) => (
            <CheckItem
              key={d.slug}
              label={`${d.icon}  ${d.label}`}
              active={currentDish === d.slug}
              onClick={() => updateParam("dish", d.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection id="cookWith" title="Cook With">
          {COOK_WITH.map((c) => (
            <CheckItem
              key={c.slug}
              label={`${c.icon}  ${c.label}`}
              active={currentCookWith === c.slug}
              onClick={() => updateParam("cookWith", c.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection id="spice" title="Spice Level">
          {SPICE_LEVELS.map((sl) => (
            <CheckItem
              key={sl.value}
              label={`${sl.label}  ${"🌶️".repeat(sl.chillies)}`}
              active={currentSpice === sl.value}
              onClick={() => updateParam("spice", sl.value)}
            />
          ))}
        </FilterSection>

        <FilterSection id="diet" title="Diet">
          <CheckItem
            label="No Onion · No Garlic"
            active={currentNog === "1"}
            onClick={() => updateParam("nog", "1")}
          />
        </FilterSection>
      </div>
    </aside>
  );
}
