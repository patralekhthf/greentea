"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DISH_TYPES } from "@/lib/catalog";

const QUICK_CATEGORIES = DISH_TYPES.slice(0, 4);

export default function ShopCategoryQuickLinks() {
  const router   = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const activeDishes = (searchParams.get("dish") ?? "").split(",").filter(Boolean);

  function handleClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    // Same multi-select list as the sidebar's Dish Type filter
    const current = (params.get("dish") ?? "").split(",").filter(Boolean);
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    if (next.length) params.set("dish", next.join(","));
    else params.delete("dish");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_CATEGORIES.map(({ label, slug }) => {
        const isActive = activeDishes.includes(slug);
        return (
          <button
            key={slug}
            onClick={() => handleClick(slug)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              isActive
                ? "bg-brand-green text-white border-brand-green"
                : "bg-white text-brand-muted border-brand-border hover:border-brand-sage hover:text-brand-green"
            }`}
          >
            {label}
            {isActive && (
              <span className="ml-1.5 opacity-75">✕</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
