"use client";

import { useState } from "react";
import SimpleMarkdown from "@/components/ui/SimpleMarkdown";

type Props = {
  longDescription: string;
  flavourProfile: string | null;
  cookingInstructions: string | null;
  yieldNote: string | null;
  storageInstructions: string | null;
  shelfLifeMonths: number | null;
  ingredients: string;
  allergens: string | null;
  highlights: string; // may be empty
};

type TabKey = "about" | "cook" | "ingredients" | "highlights";

export default function ProductContentTabs({
  longDescription,
  flavourProfile,
  cookingInstructions,
  yieldNote,
  storageInstructions,
  shelfLifeMonths,
  ingredients,
  allergens,
  highlights,
}: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "about",       label: "About" },
    ...(cookingInstructions ? [{ key: "cook" as const, label: "How to Cook" }] : []),
    { key: "ingredients", label: "Ingredients" },
    ...(highlights.trim() ? [{ key: "highlights" as const, label: "Highlights" }] : []),
  ];
  const [active, setActive] = useState<TabKey>("about");

  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-brand-border overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              active === tab.key
                ? "text-brand-green border-b-2 border-brand-green"
                : "text-brand-muted hover:text-brand-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 sm:p-8">
        {active === "about" && (
          <div>
            <SimpleMarkdown text={longDescription} />
            {flavourProfile && (
              <div className="bg-brand-cream rounded-xl p-4 mt-6">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Flavour</p>
                <p className="text-sm text-brand-dark">{flavourProfile}</p>
              </div>
            )}
          </div>
        )}

        {active === "cook" && cookingInstructions && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 bg-brand-mint rounded-xl">
              <span className="text-3xl">🍳</span>
              <div>
                <p className="text-sm font-semibold text-brand-green">Cooking Guide</p>
                <p className="text-xs text-brand-muted">{yieldNote ?? "Just add water, heat and your ingredients"}</p>
              </div>
            </div>
            <SimpleMarkdown text={cookingInstructions} />
            {(storageInstructions || shelfLifeMonths) && (
              <div className="mt-6 p-4 bg-brand-cream rounded-xl border border-brand-border">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Storage</p>
                {storageInstructions && <p className="text-sm text-brand-dark">{storageInstructions}</p>}
                {shelfLifeMonths && (
                  <p className="text-sm text-brand-dark mt-1">
                    Best before {shelfLifeMonths} months from date of manufacture.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {active === "ingredients" && (
          <div>
            <SimpleMarkdown text={ingredients} />
            {allergens && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Allergen information</p>
                <p className="text-sm text-amber-900">{allergens}</p>
              </div>
            )}
          </div>
        )}

        {active === "highlights" && <SimpleMarkdown text={highlights} />}
      </div>
    </div>
  );
}
