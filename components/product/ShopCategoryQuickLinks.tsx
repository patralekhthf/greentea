"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const QUICK_CATEGORIES = [
  { label: "Green Tea",     slug: "green-tea"     },
  { label: "Herbal Tea",    slug: "herbal-tea"    },
  { label: "Ayurvedic Tea", slug: "ayurvedic-tea" },
  { label: "Gift Packs",    slug: "gift-packs"    },
];

export default function ShopCategoryQuickLinks() {
  const router   = useRouter();
  const pathname = usePathname();
  const rawParams = useSearchParams();
  const searchParams = rawParams ?? new URLSearchParams();

  const activeCategory = searchParams.get("category");

  const handleClick = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("category") === slug) {
        // Already active — toggle off
        params.delete("category");
      } else {
        params.set("category", slug);
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
