"use client";

import { useState } from "react";
import SimpleMarkdown from "@/components/ui/SimpleMarkdown";
import AllergenGrid from "@/components/product/AllergenGrid";
import { BUSINESS } from "@/lib/business";
import { detectAllergens, hasIngredientList, splitIngredients } from "@/lib/allergens";

type Props = {
  longDescription: string;
  flavourProfile: string | null;
  cookingInstructions: string | null;
  yieldNote: string | null;
  storageInstructions: string | null;
  ingredients: string;
  allergens: string | null;
  highlights: string; // may be empty
};

type TabKey = "about" | "cook" | "ingredients" | "allergens" | "highlights";

// Every panel is rendered into the HTML and inactive ones are only hidden, so
// search engines and AI crawlers can read ingredients, method and allergens.
export default function ProductContentTabs({
  longDescription,
  flavourProfile,
  cookingInstructions,
  yieldNote,
  storageInstructions,
  ingredients,
  allergens,
  highlights,
}: Props) {
  const labelData = hasIngredientList(ingredients);
  const ingredientItems = labelData ? splitIngredients(ingredients) : [];
  const showAllergens = labelData || Boolean(allergens?.trim());

  const tabs: { key: TabKey; label: string }[] = [
    { key: "about",       label: "About" },
    ...(cookingInstructions ? [{ key: "cook" as const, label: "How to Cook" }] : []),
    { key: "ingredients", label: "Ingredients" },
    ...(showAllergens ? [{ key: "allergens" as const, label: "Allergens" }] : []),
    ...(highlights.trim() ? [{ key: "highlights" as const, label: "Highlights" }] : []),
  ];
  const [active, setActive] = useState<TabKey>("about");

  const panel = (key: TabKey) => ({
    id: `panel-${key}`,
    role: "tabpanel" as const,
    "aria-labelledby": `tab-${key}`,
    hidden: active !== key,
  });

  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      {/* Tab bar */}
      <div role="tablist" className="flex border-b border-brand-border overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`panel-${tab.key}`}
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
        <section {...panel("about")}>
          <SimpleMarkdown text={longDescription} />
          {flavourProfile && (
            <div className="bg-brand-cream rounded-xl p-4 mt-6">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Flavour</p>
              <p className="text-sm text-brand-dark">{flavourProfile}</p>
            </div>
          )}
        </section>

        {cookingInstructions && (
          <section {...panel("cook")}>
            <div className="flex items-center gap-3 mb-6 p-4 bg-brand-mint rounded-xl">
              <span className="text-3xl">🍳</span>
              <div>
                <h3 className="text-sm font-semibold text-brand-green">How to cook</h3>
                <p className="text-xs text-brand-muted">{yieldNote ?? "Just add water, heat and your ingredients"}</p>
              </div>
            </div>
            <SimpleMarkdown text={cookingInstructions} />
            {storageInstructions && (
              <div className="mt-6 p-4 bg-brand-cream rounded-xl border border-brand-border">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Storage</p>
                <p className="text-sm text-brand-dark">{storageInstructions}</p>
              </div>
            )}
          </section>
        )}

        <section {...panel("ingredients")}>
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-4">
            Ingredients{labelData ? ` (${ingredientItems.length})` : ""}
          </h3>
          {labelData ? (
            <ul className="columns-1 sm:columns-2 lg:columns-3 gap-x-10">
              {ingredientItems.map((item) => (
                <li key={item} className="break-inside-avoid flex items-start gap-2.5 py-1.5 text-sm text-brand-dark">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand-sage shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <SimpleMarkdown text={ingredients} />
          )}
          {labelData && (
            <p className="text-xs text-brand-muted mt-4">Listed in the order printed on the pack.</p>
          )}
          <div className="mt-6 p-4 bg-brand-cream rounded-xl border border-brand-border">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Manufactured by</p>
            <p className="text-sm text-brand-dark">
              {BUSINESS.name}, {BUSINESS.addressLines.join(", ")}
            </p>
          </div>
        </section>

        {showAllergens && (
          <section {...panel("allergens")}>
            {labelData && (
              <>
                <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-4">
                  Common allergens in masalas
                </h3>
                <AllergenGrid present={detectAllergens(ingredients)} />
                <p className="text-xs text-brand-muted mt-3">
                  ✓ present in this premix · ! may be present through a bought-in ingredient · ✕ not in the recipe. Based on the ingredient list on the pack.
                </p>
              </>
            )}
            {allergens && (
              <div className={`p-4 bg-amber-50 rounded-xl border border-amber-200 ${labelData ? "mt-6" : ""}`}>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Allergen information</p>
                <p className="text-sm text-amber-900">{allergens}</p>
              </div>
            )}
          </section>
        )}

        {highlights.trim() && (
          <section {...panel("highlights")}>
            <SimpleMarkdown text={highlights} />
          </section>
        )}
      </div>
    </div>
  );
}
