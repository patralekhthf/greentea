"use client";

import { useState } from "react";
import SimpleMarkdown from "@/components/ui/SimpleMarkdown";

type Props = {
  longDescription: string;
  ingredients: string;
  brewingInstructions: string;
  benefits: string;
  tasteProfile: string | null;
  aromaProfile: string | null;
  storageInstructions: string | null;
};


const TABS = [
  { key: "about",    label: "About" },
  { key: "brew",     label: "How to Brew" },
  { key: "benefits", label: "Benefits" },
  { key: "ingredients", label: "Ingredients" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ProductContentTabs({
  longDescription,
  ingredients,
  brewingInstructions,
  benefits,
  tasteProfile,
  aromaProfile,
  storageInstructions,
}: Props) {
  const [active, setActive] = useState<TabKey>("about");

  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-brand-border overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
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
            {(tasteProfile || aromaProfile) && (
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {tasteProfile && (
                  <div className="bg-brand-cream rounded-xl p-4">
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Taste Profile</p>
                    <p className="text-sm text-brand-dark">{tasteProfile}</p>
                  </div>
                )}
                {aromaProfile && (
                  <div className="bg-brand-cream rounded-xl p-4">
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Aroma Profile</p>
                    <p className="text-sm text-brand-dark">{aromaProfile}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {active === "brew" && (
          <div>
            {/* Visual brewing steps */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-brand-mint rounded-xl">
              <span className="text-3xl">🫖</span>
              <div>
                <p className="text-sm font-semibold text-brand-green">Brewing Guide</p>
                <p className="text-xs text-brand-muted">For the perfect cup every time</p>
              </div>
            </div>
            <SimpleMarkdown text={brewingInstructions} />
            {storageInstructions && (
              <div className="mt-6 p-4 bg-brand-cream rounded-xl border border-brand-border">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Storage Tips</p>
                <p className="text-sm text-brand-dark">{storageInstructions}</p>
              </div>
            )}
          </div>
        )}

        {active === "benefits" && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-xl">
              <span className="text-3xl">🌿</span>
              <div>
                <p className="text-sm font-semibold text-brand-green">Health & Wellness</p>
                <p className="text-xs text-brand-muted">Nature&apos;s goodness in every cup</p>
              </div>
            </div>
            <SimpleMarkdown text={benefits} />
          </div>
        )}

        {active === "ingredients" && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-xl">
              <span className="text-3xl">🌱</span>
              <div>
                <p className="text-sm font-semibold text-brand-green">What&apos;s Inside</p>
                <p className="text-xs text-brand-muted">100% natural, carefully sourced</p>
              </div>
            </div>
            <SimpleMarkdown text={ingredients} />
          </div>
        )}
      </div>
    </div>
  );
}
