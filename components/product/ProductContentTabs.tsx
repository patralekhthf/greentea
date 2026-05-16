"use client";

import { useState } from "react";

type Props = {
  longDescription: string;
  ingredients: string;
  brewingInstructions: string;
  benefits: string;
  tasteProfile: string | null;
  aromaProfile: string | null;
  storageInstructions: string | null;
};

/** Very simple markdown → JSX: bold, italic, bullet lists, headings, paragraphs */
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 mb-4 text-brand-muted text-sm leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function inlineFormat(str: string): React.ReactNode {
    // Split on **bold** and *italic*
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-brand-dark">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-lg font-bold text-brand-green mt-6 mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-brand-green mt-6 mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {trimmed.slice(2)}
        </h2>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={key++} className="text-sm text-brand-muted leading-relaxed mb-3">
          {inlineFormat(trimmed)}
        </p>
      );
    }
  }
  flushList();

  return <div>{elements}</div>;
}

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
