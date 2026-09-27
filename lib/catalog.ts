// Catalogue vocabulary shared by the shop, product pages and the admin form.
// Slugs are stored on Product.dishType / Product.pairsWith, so never rename a
// slug that products already use (labels are safe to change).

import type { SpiceLevel } from "@prisma/client";

/** Teas stay visible as "coming soon" and cannot be ordered until this is true. */
export const TEA_LINE_LIVE = false;

export const BRAND_TAGLINE = "A Delicacy of Kittu's Kitchen";

export const DISH_TYPES = [
  { slug: "gravies",   label: "Curries & Gravies", icon: "🍛" },
  { slug: "dal",       label: "Dal & Sambhar",     icon: "🥣" },
  { slug: "breakfast", label: "Breakfast",         icon: "🍽️" },
  { slug: "rice",      label: "Biryani & Rice",    icon: "🍚" },
  { slug: "sides",     label: "Chutneys & Sides",  icon: "🥥" },
  { slug: "sweets",    label: "Sweets & Desserts", icon: "🍮" },
] as const;

/** What the customer adds to the premix. */
export const COOK_WITH = [
  { slug: "paneer",     label: "Paneer",           icon: "🧀" },
  { slug: "chickpeas",  label: "Chickpeas",        icon: "🫘" },
  { slug: "vegetables", label: "Vegetables",       icon: "🥕" },
  { slug: "chicken",    label: "Chicken",          icon: "🍗" },
  { slug: "egg",        label: "Egg",              icon: "🥚" },
] as const;

export const SPICE_LEVELS: { value: SpiceLevel; label: string; chillies: number; tone: string }[] = [
  { value: "MILD",      label: "Mild",      chillies: 1, tone: "bg-amber-50 text-amber-700" },
  { value: "MEDIUM",    label: "Medium",    chillies: 2, tone: "bg-orange-50 text-orange-700" },
  { value: "HOT",       label: "Hot",       chillies: 3, tone: "bg-red-50 text-red-700" },
  { value: "EXTRA_HOT", label: "Extra hot", chillies: 4, tone: "bg-red-100 text-red-800" },
];

export function dishTypeLabel(slug: string | null | undefined) {
  return DISH_TYPES.find((d) => d.slug === slug)?.label ?? null;
}

export function cookWithLabel(slug: string) {
  return COOK_WITH.find((c) => c.slug === slug)?.label ?? slug;
}

export function spiceLevel(value: SpiceLevel | null | undefined) {
  return SPICE_LEVELS.find((s) => s.value === value) ?? null;
}
