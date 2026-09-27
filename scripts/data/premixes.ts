/**
 * Launch catalogue for Kanta Greens masala premixes.
 * Loaded into the DB by scripts/import-premixes.ts (see that file for usage).
 *
 * Sources
 * - Pack back labels (2026-09-27): Sambhar, Moong Dal Halwa, Rawa Idli. Net weight,
 *   ingredients, method and shelf life below are copied from those labels.
 * - Pack front mock-ups: names, No Onion No Garlic variants, pack claims.
 *
 * PLACEHOLDERS (agreed with the owner, to be replaced later) are marked `// TODO`:
 * - Prices: picked between ₹45 and ₹110.
 * - Spice levels and allergens: best guess.
 * - Products without a back label yet: ingredients, method, net weight and
 *   shelf life are pending (ingredients and method show "coming soon" on the site).
 *
 * Slugs are stable identifiers. Changing one creates a new product on re-import.
 */

import type { SpiceLevel } from "@prisma/client";

export type PremixSeed = {
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;      // Markdown
  highlights: string;           // Markdown, stored in Product.benefits
  ingredients: string;
  cookingInstructions: string;  // Markdown
  dishType: string;             // DISH_TYPES slug (lib/catalog.ts)
  pairsWith: string[];          // COOK_WITH slugs
  spiceLevel: SpiceLevel | null;
  noOnionGarlic: boolean;
  netWeight: string;            // shown as the pack size
  servings: string;
  yieldNote: string | null;
  cookTimeMinutes: number | null;
  shelfLifeMonths: number;
  allergens: string;
  priceINR: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  /** Files in scripts/data/images, first = primary. Empty = placeholder until photos arrive. */
  images: string[];
};

const STORAGE = "Store in a cool, dry place and keep in an airtight container.";
const SERVES = "Serves 3–4";
const INGREDIENTS_PENDING =
  "Full ingredient list coming soon. Please check the back of the pack.";
const METHOD_PENDING =
  "Step-by-step cooking instructions coming soon. Until then, please follow the method printed on the back of the pack.";

/** Claims printed on the front of every pack. */
const PACK_CLAIMS = `- 100% natural ingredients
- No artificial colours
- Healthy, hygienic & homemade
- Quick and easy to cook`;

export { STORAGE };

export const PREMIXES: PremixSeed[] = [
  // ─── Back label available ────────────────────────────────────────────────
  {
    slug: "sambhar-premix",
    images: ["sambhar-premix-1.jpg"],
    sku: "KG-SAM-100",
    name: "Sambhar Premix",
    tagline: "Homestyle sambhar, no grinding",
    shortDescription:
      "Tur dal, tamarind and roasted spices, pre-blended. Add water and your vegetables for a pot of homestyle sambhar.",
    longDescription: `Our sambhar premix brings together tur dal, chana dal, tamarind, curry leaves and freshly roasted spices, so there's no soaking, roasting or grinding.

Mix it with water, pressure-cook it with the vegetables you have, and finish with a quick tadka. Serve it with rice, idli or dosa.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Tur dal, salt, mustard seed, chana dal, tamarind, hing, sugar, cumin, desiccated coconut, citric acid, urad dal, roasted chana dal, rice, methi, coriander, Kashmiri mirch, curry patta.",
    cookingInstructions: `1. Take 4 tbsp (50 g) of premix and mix it into 500 ml water.
2. In a pressure cooker, heat 3 tbsp oil. Add ½ cup bottle gourd, 1 small carrot, brinjal and 2–3 drumsticks, and sauté for 2–3 minutes.
3. Add the premix water and pressure-cook for 2 whistles.
4. For better taste, give a tadka of mustard seeds, curry patta and whole red chillies. Serve hot.`,
    dishType: "dal",
    pairsWith: ["vegetables"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: true, // confirmed by owner 2026-09-27
    netWeight: "100g",
    servings: SERVES,
    yieldNote: "4 tbsp (50 g) makes one pot, so a 100 g pack makes two",
    cookTimeMinutes: 15,
    shelfLifeMonths: 6,
    allergens: "Contains coconut. Made in a kitchen that also handles nuts and milk.", // TODO: placeholder
    priceINR: 65, // TODO: placeholder
    isBestseller: true,
  },
  {
    slug: "moong-dal-halwa-premix",
    images: ["moong-dal-halwa-premix-1.webp"],
    sku: "KG-MDH-150",
    name: "Moong Dal Halwa Premix",
    tagline: "Pure desi taste that brings sweet cravings",
    shortDescription:
      "Moong dal roasted in ghee with milk powder, sugar, nuts and cardamom. Add milk or water and it's ready in about 15 minutes.",
    longDescription: `Moong dal halwa usually means an hour of stirring. We've done the slow part: moong dal, ghee, milk powder, sugar, chopped nuts and green cardamom, ready in one pack.

Roast it in a little ghee, add milk or water, and a rich, festive halwa is ready in about 15 minutes.`,
    highlights: `- Pure desi taste that brings sweet cravings
- Made with premium flours
- 100% natural ingredients
- No artificial colours`,
    ingredients:
      "Moong dal, ghee, skimmed milk powder, powdered sugar, chopped nuts, green cardamom.",
    cookingInstructions: `1. Heat 30 ml (2 tbsp) ghee in a pan. Add 1 packet (150 g) of premix and roast for 2–3 minutes.
2. Add 1½ cups (375 ml) milk or water and cook for 8–10 minutes.
3. Serve hot.`,
    dishType: "sweets",
    pairsWith: [],
    spiceLevel: null, // a sweet: no spice level
    noOnionGarlic: false,
    netWeight: "150g",
    servings: SERVES,
    yieldNote: "1 pack (150 g) with 375 ml milk or water",
    cookTimeMinutes: 15,
    shelfLifeMonths: 4, // label says "4 to 5 months"; the site shows the shorter figure
    allergens: "Contains milk (ghee, milk powder) and tree nuts.", // TODO: confirm
    priceINR: 110, // TODO: placeholder
    isFeatured: true,
  },
  {
    slug: "rawa-idli-premix",
    images: ["rawa-idli-premix-1.webp", "rawa-idli-premix-2.webp"],
    sku: "KG-RID-220",
    name: "Rawa Idli Premix",
    tagline: "Soft, fluffy idlis in 20 minutes",
    shortDescription:
      "Semolina, urad dal, cashew and spices, pre-mixed. Add water and curd, steam, and serve hot with chutney and sambhar.",
    longDescription: `No soaking, no grinding, no overnight fermenting. Our rawa idli premix has semolina, urad dal, cashew, curry patta, green chilli and ginger already blended.

Whisk it with water and curd, rest the batter for five minutes and steam. Serve with our coconut chutney and sambhar premixes.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Suji (semolina), cashew, salt, urad dal powder, curry patta, soda, mustard seed, green chilli flakes, ginger powder, citric acid, chana dal, oil, baking soda.",
    cookingInstructions: `1. Take 1 packet (220 g) of premix and add 200 ml water and 1 cup (140 g) curd.
2. Mix well to a smooth batter and keep aside for 5 minutes.
3. Grease the idli moulds with a little oil.
4. Pour the batter into the moulds.
5. Steam for 8–10 minutes on a medium flame.
6. Remove and serve hot with chutney and sambhar.`,
    dishType: "breakfast",
    pairsWith: [],
    spiceLevel: "MILD", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "220g",
    servings: SERVES,
    yieldNote: "1 pack (220 g) makes 12–15 idlis",
    cookTimeMinutes: 20,
    shelfLifeMonths: 6,
    allergens: "Contains wheat (semolina) and cashew (tree nut).", // TODO: confirm
    priceINR: 85, // TODO: placeholder
    isBestseller: true,
  },

  // ─── Back label pending: ingredients, method, weight, shelf life TODO ────
  {
    slug: "paneer-tikka-gravy-premix",
    images: [], // TODO: photo pending
    sku: "KG-PTG-100",
    name: "Paneer Tikka Gravy Premix",
    tagline: "Restaurant-style tikka gravy at home",
    shortDescription:
      "A tikka masala gravy base. Cook it with water as directed on the pack and add paneer for a restaurant-style gravy.",
    longDescription: `All the spices of a good paneer tikka masala, balanced and ready. Cook it as directed on the pack, add paneer cubes, and serve with naan or rice.

Also available in a No Onion No Garlic version.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "gravies",
    pairsWith: ["paneer"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: false,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "May contain milk and tree nuts.", // TODO: placeholder
    priceINR: 75, // TODO: placeholder
    isBestseller: true,
  },
  {
    slug: "paneer-tikka-gravy-premix-no-onion-no-garlic",
    images: [], // TODO: photo pending
    sku: "KG-PTG-NOG-100",
    name: "Paneer Tikka Gravy Premix (No Onion No Garlic)",
    tagline: "Tikka gravy, without onion or garlic",
    shortDescription:
      "Our paneer tikka gravy, made without onion or garlic. Cook it with water as directed and add paneer.",
    longDescription: `The same tikka gravy, made for households that cook without onion and garlic. Cook it as directed on the pack, add paneer, and serve with naan or rice.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "gravies",
    pairsWith: ["paneer"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "May contain milk and tree nuts.", // TODO: placeholder
    priceINR: 75, // TODO: placeholder
  },
  {
    slug: "chhole-masala-premix",
    images: [], // TODO: photo pending
    sku: "KG-CHM-100",
    name: "Chhole Masala Premix",
    tagline: "Punjabi-style chhole, simplified",
    shortDescription:
      "A chhole masala base. Cook it with water as directed on the pack and add boiled chickpeas for Punjabi-style chhole.",
    longDescription: `A chhole masala base for Punjabi-style chhole. Cook it as directed on the pack with boiled chickpeas, and serve with bhature, kulche or rice.

Also available in a No Onion No Garlic version.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "gravies",
    pairsWith: ["chickpeas"],
    spiceLevel: "HOT", // TODO: placeholder
    noOnionGarlic: false,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "May contain traces of nuts.", // TODO: placeholder
    priceINR: 70, // TODO: placeholder
    isFeatured: true,
  },
  {
    slug: "chhole-masala-premix-no-onion-no-garlic",
    images: ["chhole-masala-premix-no-onion-no-garlic-1.webp"],
    sku: "KG-CHM-NOG-100",
    name: "Chhole Masala Premix (No Onion No Garlic)",
    tagline: "Chhole masala, without onion or garlic",
    shortDescription:
      "Our chhole masala, made without onion or garlic. Add water and boiled chickpeas.",
    longDescription: `Our chhole masala, for households that skip onion and garlic. Cook it as directed on the pack with boiled chickpeas and serve hot.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "gravies",
    pairsWith: ["chickpeas"],
    spiceLevel: "HOT", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "May contain traces of nuts.", // TODO: placeholder
    priceINR: 70, // TODO: placeholder
  },
  {
    slug: "white-gravy-premix",
    images: ["white-gravy-premix-1.webp"],
    sku: "KG-WGR-100",
    name: "White Gravy Premix",
    tagline: "Creamy, mild and rich",
    shortDescription:
      "A creamy white gravy base, made without onion or garlic. Great with paneer, vegetables or chicken.",
    longDescription: `A creamy white gravy base, made without onion or garlic. Cook it as directed on the pack and add paneer, mixed vegetables or chicken.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "gravies",
    pairsWith: ["paneer", "vegetables", "chicken"],
    spiceLevel: "MILD", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "Contains tree nuts (cashew) and milk.", // TODO: placeholder
    priceINR: 90, // TODO: placeholder
  },
  {
    slug: "all-purpose-gravy-premix",
    images: ["all-purpose-gravy-premix-1.webp"],
    sku: "KG-APG-100",
    name: "All Purpose Gravy Premix",
    tagline: "One gravy, endless dishes",
    shortDescription:
      "A versatile onion-and-garlic-free gravy base for paneer, vegetables, chana, eggs or chicken.",
    longDescription: `The everyday gravy base for busy kitchens. Cook it as directed on the pack and add whatever you have: paneer, mixed vegetables, chana, boiled eggs or chicken. Made without onion or garlic.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "gravies",
    pairsWith: ["paneer", "vegetables", "chickpeas", "chicken", "egg"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "May contain traces of nuts and milk.", // TODO: placeholder
    priceINR: 60, // TODO: placeholder
  },
  {
    slug: "biryani-premix",
    images: ["biryani-premix-1.webp"],
    sku: "KG-BIR-100",
    name: "Biryani Premix",
    tagline: "Fragrant biryani, made easy",
    shortDescription:
      "Biryani spices in one pack, made without onion or garlic. Cook with rice and vegetables, paneer or chicken.",
    longDescription: `Biryani without a long spice list. Cook the premix with rice as directed on the pack, with your choice of vegetables, paneer or chicken. Made without onion or garlic.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "rice",
    pairsWith: ["vegetables", "paneer", "chicken"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "May contain traces of nuts.", // TODO: placeholder
    priceINR: 95, // TODO: placeholder
  },
  {
    slug: "coconut-chutney-premix",
    images: ["coconut-chutney-premix-1.webp"],
    sku: "KG-CCH-100",
    name: "Coconut Chutney Premix",
    tagline: "South Indian chutney in minutes",
    shortDescription:
      "Coconut chutney without the grating and grinding. Made without onion or garlic, perfect with idli and dosa.",
    longDescription: `The classic partner to idli, dosa and vada, without grating a coconut. Prepare it as directed on the pack. Made without onion or garlic.`,
    highlights: PACK_CLAIMS,
    ingredients: INGREDIENTS_PENDING,
    cookingInstructions: METHOD_PENDING,
    dishType: "sides",
    pairsWith: [],
    spiceLevel: "MILD", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "100g", // TODO: confirm
    servings: SERVES,
    yieldNote: null,
    cookTimeMinutes: null,
    shelfLifeMonths: 6, // TODO: confirm
    allergens: "Contains coconut. May contain peanuts.", // TODO: placeholder
    priceINR: 55, // TODO: placeholder
  },
];
