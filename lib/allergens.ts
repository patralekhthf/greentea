// Allergens shown on product pages, worked out from the label ingredient list
// so the grid can never drift from the ingredients. FSSAI's declarable
// allergens that can occur in a veg masala, plus mustard (common in masalas).

export type AllergenKey = "gluten" | "milk" | "treeNuts" | "peanuts" | "sesame" | "soy" | "mustard";
export type AllergenState = "present" | "may" | "absent";

// `may`: ingredients that usually carry the allergen but vary by supplier.
export const ALLERGENS: { key: AllergenKey; label: string; hint: string; pattern: RegExp; may?: { pattern: RegExp; reason: string } }[] = [
  { key: "gluten",   label: "Wheat / Gluten", hint: "rawa, suji, maida, atta", pattern: /\b(wheat|rawa|semolina|suji|sooji|maida|atta|barley|rye|oats?)\b/i,
    may: { pattern: /\b(hings?|asafoetida)\b/i, reason: "hing is usually blended with wheat flour" } },
  { key: "milk",     label: "Milk",           hint: "milk powder, ghee, curd", pattern: /\b(milk|ghee|butter|cream|curd|paneer|khoa|khoya|whey|casein)\b/i },
  { key: "treeNuts", label: "Tree nuts",      hint: "cashew, almond",          pattern: /\b(cashews?|almonds?|pistachios?|walnuts?|nuts)\b/i },
  { key: "peanuts",  label: "Peanuts",        hint: "groundnut, groundnut oil", pattern: /\b(peanuts?|groundnuts?)\b/i },
  { key: "sesame",   label: "Sesame",         hint: "til",                     pattern: /\b(sesame|til)\b/i },
  { key: "soy",      label: "Soy",            hint: "soya",                    pattern: /\b(soy|soya|soybean)\b/i },
  { key: "mustard",  label: "Mustard",        hint: "rai, sarson",             pattern: /\b(mustard|rai|sarson)\b/i },
];

/** True when the ingredient list is real label data rather than a "coming soon" placeholder. */
export function hasIngredientList(ingredients: string): boolean {
  return ingredients.trim().length > 0 && !/coming soon/i.test(ingredients);
}

/** Split a label ingredient list ("A, B (c), D.") into items, keeping brackets intact. */
export function splitIngredients(ingredients: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of ingredients.trim().replace(/\.$/, "")) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      if (current.trim()) items.push(current.trim());
      current = "";
    } else current += ch;
  }
  if (current.trim()) items.push(current.trim());
  return items.map((i) => i.charAt(0).toUpperCase() + i.slice(1));
}

export function detectAllergens(ingredients: string): Record<AllergenKey, AllergenState> {
  return Object.fromEntries(
    ALLERGENS.map((a) => [a.key, a.pattern.test(ingredients) ? "present" : a.may?.pattern.test(ingredients) ? "may" : "absent"]),
  ) as Record<AllergenKey, AllergenState>;
}
