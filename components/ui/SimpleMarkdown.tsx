import type { ReactNode } from "react";

/** Lightweight markdown → JSX renderer. No external deps.
 *  Supports: ## headings, # headings, - bullet lists, **bold**, *italic*, --- dividers, paragraphs.
 */
export default function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="list-disc list-inside space-y-1 mb-4 text-brand-muted text-sm leading-relaxed">
        {listItems.map((item, i) => (
          <li key={i}>{inlineFormat(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  function inlineFormat(str: string): ReactNode {
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i} className="font-semibold text-brand-dark">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "---" || trimmed === "***") {
      flushList();
      elements.push(<hr key={key++} className="my-8 border-brand-border" />);
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-brand-green mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-2xl font-bold text-brand-green mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {trimmed.slice(2)}
        </h1>
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
