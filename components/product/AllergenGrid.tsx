import { ALLERGENS, type AllergenKey, type AllergenState } from "@/lib/allergens";

// Simple line icons (24x24, currentColor) so they match the site in any theme.
const ICONS: Record<AllergenKey, React.ReactNode> = {
  gluten: (
    <>
      <path d="M12 22V8" />
      <path d="M12 8c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4Zm0 0c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4Z" />
      <path d="M12 13c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4Zm0 0c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4Z" />
      <path d="M12 18c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4Zm0 0c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4Z" />
    </>
  ),
  milk: (
    <>
      <path d="M9 2h6v3l2 4v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l2-4V2Z" />
      <path d="M7 12c2 1 4-1 6 0s3 1 4 0" />
    </>
  ),
  treeNuts: (
    <>
      <path d="M16.5 4.5c3 2.5 3.5 7.5 1 11s-7 5.5-10.5 4c-2-1-2-3.5 0-4.5 2.5-1.2 4.5-2.7 5.5-5.5.8-2.3.5-4 4-5Z" />
      <path d="M9.5 16.5c2-1 4-3 5-5.5" />
    </>
  ),
  peanuts: (
    <>
      <path d="M8.5 3.5a4.5 4.5 0 0 1 6 5.5c-.5 1.5.5 2.5 2 3.5a4.5 4.5 0 1 1-6.5 6c-1-1.5-2-2.5-3.5-2a4.5 4.5 0 0 1-2-7.5c1.2-1.2 2.5-1 3-2.5.3-1.2.3-2.3 1-3Z" />
      <path d="M9 9h.01M12 12h.01M15 15h.01" />
    </>
  ),
  sesame: (
    <>
      <path d="M8 4c1.5 1.5 1.5 4 0 5.5C6.5 8 6.5 5.5 8 4Z" />
      <path d="M16 6c1.5 1.5 1.5 4 0 5.5-1.5-1.5-1.5-4 0-5.5Z" />
      <path d="M7 13c1.5 1.5 1.5 4 0 5.5-1.5-1.5-1.5-4 0-5.5Z" />
      <path d="M13.5 14c1.5 1.5 1.5 4 0 5.5-1.5-1.5-1.5-4 0-5.5Z" />
      <path d="M18.5 15c1 1 1 2.7 0 3.7-1-1-1-2.7 0-3.7Z" />
    </>
  ),
  soy: (
    <>
      <path d="M4 18c0-6 6-12 14-14 1 0 2 1 2 2-2 8-8 14-14 14-1 0-2-1-2-2Z" />
      <circle cx="9" cy="15" r="1.6" />
      <circle cx="12.5" cy="11.5" r="1.6" />
      <circle cx="16" cy="8" r="1.6" />
    </>
  ),
  mustard: (
    <>
      <circle cx="7" cy="16" r="2" />
      <circle cx="12" cy="18" r="2" />
      <circle cx="10" cy="13" r="2" />
      <path d="M15 14c0-5 2-9 6-10-.5 4-2.5 7-6 10Z" />
      <path d="M15 14c1.5-2.5 3-5 5-8" />
    </>
  ),
};

const STATE: Record<AllergenState, { card: string; badge: string; mark: string; icon: string; name: string; text: string; label: string }> = {
  present: { card: "bg-amber-50 border-amber-300", badge: "bg-amber-500 text-white", mark: "✓", icon: "text-amber-700", name: "text-amber-900", text: "text-amber-800", label: "Present" },
  may:     { card: "bg-orange-50/60 border-orange-200 border-dashed", badge: "bg-orange-100 text-orange-700 ring-1 ring-orange-300", mark: "!", icon: "text-orange-600", name: "text-orange-900", text: "text-orange-700", label: "May contain" },
  absent:  { card: "bg-white border-brand-border", badge: "bg-brand-mint text-brand-green", mark: "✕", icon: "text-brand-muted/60", name: "text-brand-dark", text: "text-brand-green", label: "Not present" },
};

export default function AllergenGrid({ present }: { present: Record<AllergenKey, AllergenState> }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {ALLERGENS.map((a) => {
        const state = present[a.key];
        const s = STATE[state];
        return (
          <li key={a.key} className={`relative flex flex-col items-center text-center rounded-xl border p-4 ${s.card}`}>
            <span
              className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.badge}`}
              aria-hidden
            >
              {s.mark}
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`w-10 h-10 mb-2 ${s.icon}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {ICONS[a.key]}
            </svg>
            <span className={`text-sm font-semibold ${s.name}`}>{a.label}</span>
            <span className="text-[11px] text-brand-muted mt-0.5">{a.hint}</span>
            <span className={`mt-2 text-[11px] font-semibold uppercase tracking-wider ${s.text}`}>{s.label}</span>
            {state === "may" && a.may && <span className="text-[10px] text-orange-700/80 mt-0.5">{a.may.reason}</span>}
          </li>
        );
      })}
    </ul>
  );
}
