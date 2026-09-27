"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { COOK_WITH, DISH_TYPES, SPICE_LEVELS } from "@/lib/catalog";

// URL params this sidebar owns (also cleared by "Clear all").
// dish / cookWith / spice are multi-select, stored as comma-separated lists (?dish=gravies,dal).
const FILTER_PARAMS = ["dish", "cookWith", "spice", "nog"] as const;

type Section = "dish" | "cookWith" | "spice" | "diet";

export default function ShopFilters({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [open, setOpen] = useState<Section[]>(["dish", "cookWith", "spice", "diet"]);

  const listOf = (key: string) => (searchParams.get(key) ?? "").split(",").filter(Boolean);
  const currentDish     = listOf("dish");
  const currentCookWith = listOf("cookWith");
  const currentSpice    = listOf("spice");
  const currentNog      = searchParams.get("nog") === "1";
  const hasFilters = FILTER_PARAMS.some((p) => searchParams.get(p));

  function navigate(params: URLSearchParams) {
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  /** Adds or removes one value from a multi-select list param. */
  function toggleValue(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    navigate(params);
  }

  function toggleNog() {
    const params = new URLSearchParams(searchParams.toString());
    if (currentNog) params.delete("nog");
    else params.set("nog", "1");
    navigate(params);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_PARAMS.forEach((p) => params.delete(p));
    navigate(params);
  }

  function toggleSection(s: Section) {
    setOpen((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
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
        <FilterSection title="Dish Type" isOpen={open.includes("dish")} onToggle={() => toggleSection("dish")}>
          {DISH_TYPES.map((d) => (
            <CheckItem
              key={d.slug}
              label={`${d.icon}  ${d.label}`}
              active={currentDish.includes(d.slug)}
              onClick={() => toggleValue("dish", d.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Cook With" isOpen={open.includes("cookWith")} onToggle={() => toggleSection("cookWith")}>
          {COOK_WITH.map((c) => (
            <CheckItem
              key={c.slug}
              label={`${c.icon}  ${c.label}`}
              active={currentCookWith.includes(c.slug)}
              onClick={() => toggleValue("cookWith", c.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Spice Level" isOpen={open.includes("spice")} onToggle={() => toggleSection("spice")}>
          {SPICE_LEVELS.map((sl) => (
            <CheckItem
              key={sl.value}
              label={`${sl.label}  ${"🌶️".repeat(sl.chillies)}`}
              active={currentSpice.includes(sl.value)}
              onClick={() => toggleValue("spice", sl.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Diet" isOpen={open.includes("diet")} onToggle={() => toggleSection("diet")}>
          <CheckItem label="No Onion · No Garlic" active={currentNog} onClick={toggleNog} />
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-brand-border pb-4">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
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
      role="checkbox"
      aria-checked={active}
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
