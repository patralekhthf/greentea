"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DISH_TYPES } from "@/lib/catalog";

const QUICK_CATEGORIES = DISH_TYPES.slice(0, 4);

export default function ShopCategoryQuickLinks() {
  const router   = useRouter();
  const pathname = usePathname();
  const rawParams = useSearchParams();
  const searchParams = rawParams ?? new URLSearchParams();

  const activeCategory = searchParams.get("dish");

  const handleClick = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("dish") === slug) {
        // Already active — toggle off
        params.delete("dish");
      } else {
        params.set("dish", slug);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_CATEGORIES.map(({ label, slug }) => {
        const isActive = activeCategory === slug;
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
