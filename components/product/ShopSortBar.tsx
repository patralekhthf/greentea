"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

const SORT_OPTIONS = [
  { label: "Newest",           value: "newest" },
  { label: "Bestsellers",      value: "bestseller" },
  { label: "Highest Rated",    value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

type Props = {
  total: number;
  onMobileFiltersOpen: () => void;
};

export default function ShopSortBar({ total, onMobileFiltersOpen }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const searchParams = rawSearchParams ?? new URLSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const currentSort = searchParams.get("sort") ?? "newest";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    updateParam("search", "");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">

      {/* Left: result count + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileFiltersOpen}
          className="lg:hidden flex items-center gap-2 text-sm font-medium text-brand-green border border-brand-green px-3 py-2 rounded-full hover:bg-brand-mint transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
        <p className="text-sm text-brand-muted">
          <span className="font-semibold text-brand-dark">{total}</span>{" "}
          {total === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Right: search + sort */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search teas..."
            className="pl-9 pr-8 py-2 text-sm border border-brand-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-sage w-44 sm:w-56"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="text-sm border border-brand-border rounded-full px-4 py-2 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-sage cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
