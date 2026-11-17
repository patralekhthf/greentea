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
const PACK_CLAIMS = `- No artificial colours
- Healthy, hygienic & homemade
- Quick and easy to cook`;

export { STORAGE };

export const PREMIXES: PremixSeed[] = [
  // ─── Back label available ────────────────────────────────────────────────
  {
    slug: "sambhar-premix",
    images: ["sambhar-premix-front.jpg", "sambhar-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-SAM-100",
    name: "Sambhar Premix",
    tagline: "Homestyle sambhar, no grinding",
    shortDescription:
      "Tur dal, tamarind and roasted spices, pre-blended. Add water and your vegetables for a pot of homestyle sambhar.",
    longDescription: `Our sambhar premix brings together tur dal, roasted chana dal, tamarind, curry leaves and roasted spices, so there's no soaking, roasting or grinding.

Mix it with water, pressure-cook it with the vegetables you have, and finish with a quick tadka. Serve it with rice, idli or dosa.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Tur dal, salt, mustard seed, roasted chana dal, rice, cumin, urad dal, turmeric, citric acid, sugar, tamarind, coriander, curry leaves, Kashmiri red chilli, desiccated coconut, fennel seed.",
    cookingInstructions: `1. Take 4 tbsp (50 g) of premix and mix it into 500 ml water.
2. In a pressure cooker, heat 3 tbsp oil. Add ¼ cup bottle gourd, 1 small carrot, brinjal and 2–3 drumsticks, and sauté for 2–3 minutes.
3. Add the premix water and pressure-cook for 2 whistles.
4. For better taste, give a tadka of mustard seeds, curry leaves and whole red chillies. Serve hot.`,
    dishType: "dal",
    pairsWith: ["vegetables"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: true, // confirmed by owner 2026-09-27
    netWeight: "100g",
    servings: SERVES,
    yieldNote: "4 tbsp (50 g) makes one pot, so a 100 g pack makes two",
    cookTimeMinutes: 15,
    shelfLifeMonths: 6,
    allergens: "Contains mustard (mustard seed) and coconut. Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // RasoiVita back label, 2026-11-16
    priceINR: 329, // ₹300–400 range set by owner, 2026-11-04
    isBestseller: true,
  },
  {
    slug: "moong-dal-halwa-premix",
    images: ["moong-dal-halwa-premix-front.jpg", "moong-dal-halwa-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-MDH-150",
    name: "Moong Dal Halwa Premix",
    tagline: "Pure desi taste that brings sweet cravings",
    shortDescription:
      "Moong dal roasted in ghee with milk powder, sugar, nuts and cardamom. Add milk or water and it's ready in about 15 minutes.",
    longDescription: `Moong dal halwa usually means an hour of stirring. We've done the slow part: moong dal, ghee, milk powder, sugar, chopped nuts and green cardamom, ready in one pack.

Roast it in a little ghee, add milk or water, and a rich, festive halwa is ready in about 15 minutes.`,
    highlights: `- Pure desi taste that brings sweet cravings
- Made with premium flours
- No artificial colours`,
    ingredients:
      "Moong dal, ghee, skimmed milk powder, powdered sugar, chopped nuts, green cardamom powder.",
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
    shelfLifeMonths: 4, // label: best before 4 months
    allergens: "Contains milk (ghee, milk powder) and tree nuts (chopped nuts). Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // RasoiVita back label, 2026-11-16
    priceINR: 399, // ₹300–400 range set by owner, 2026-11-04
    isFeatured: true,
  },
  {
    slug: "rawa-idli-premix",
    images: ["rawa-idli-premix-front.jpg", "rawa-idli-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-RID-220",
    name: "Rawa Idli Premix",
    tagline: "Soft, fluffy idlis in 20 minutes",
    shortDescription:
      "Semolina, urad dal, cashew and spices, pre-mixed. Add water and curd, steam, and serve hot with chutney and sambhar.",
    longDescription: `No soaking, no grinding, no overnight fermenting. Our rawa idli premix has semolina, urad dal, cashew, curry leaves, green chilli and ginger already blended.

Whisk it with water and curd, rest the batter for five minutes and steam. Serve with our coconut chutney and sambhar premixes.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Rawa (semolina), cashew, salt, urad dal, curry leaves, baking soda, chana dal, mustard seed, green chilli, ginger powder, citric acid, groundnut oil.",
    cookingInstructions: `1. Take 1 packet (220 g) of premix, add 200 ml water and ½ cup curd, mix well and keep aside for 5 minutes.
2. Pour the batter into greased idli moulds.
3. Steam for 8–10 minutes and serve hot with chutney and sambhar.`,
    dishType: "breakfast",
    pairsWith: [],
    spiceLevel: "MILD", // TODO: placeholder
    noOnionGarlic: true,
    netWeight: "220g",
    servings: SERVES,
    yieldNote: "1 pack (220 g) makes about 10 idlis",
    cookTimeMinutes: 15,
    shelfLifeMonths: 6,
    allergens: "Contains wheat (semolina), tree nuts (cashew), peanut (groundnut oil) and mustard. Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // RasoiVita back label, 2026-11-16
    priceINR: 359, // ₹300–400 range set by owner, 2026-11-04
    isBestseller: true,
  },

  // ─── Back label pending: ingredients, method, weight, shelf life TODO ────
  {
    slug: "paneer-tikka-gravy-premix",
    images: ["paneer-tikka-gravy-premix-front.jpg", "paneer-tikka-gravy-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-PTG-100",
    name: "Paneer Tikka Gravy Premix",
    tagline: "Restaurant-style tikka gravy at home",
    shortDescription:
      "A tikka masala gravy base. Cook it with water as directed on the pack and add paneer for a restaurant-style gravy.",
    longDescription: `All the spices of a good paneer tikka masala, balanced and ready. Cook it as directed on the pack, add paneer cubes, and serve with naan or rice.

Also available in a No Onion No Garlic version.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Cashew, melon seed, sesame seed, milk powder, tomato powder, chat masala, cornflour, salt, coriander powder, sugar, turmeric, kasuri methi, Kashmiri chilli, garam masala, citric acid, groundnut oil, cinnamon, bay leaf, ginger powder, clove, nutmeg, onion and garlic powder.",
    cookingInstructions: `1. In a bowl, mix 4 tbsp (50 g) of premix with 200 ml water and 100 ml milk. Keep aside.
2. Heat 3–4 tbsp oil in a pan, add the gravy mixture and cook for 2–3 minutes.
3. Add paneer (marinated and grilled, or fried) and cook for 2–3 minutes.
4. Stir in 2 tbsp cream and 1 tbsp butter, and serve hot.`,
    dishType: "gravies",
    pairsWith: ["paneer"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: false,
    netWeight: "100g", // from back label, 2026-11-13
    servings: SERVES,
    yieldNote: "4 tbsp (50 g) makes one batch, so a 100 g pack makes two",
    cookTimeMinutes: 10,
    shelfLifeMonths: 6, // from back label, 2026-11-13
    allergens: "Contains tree nuts (cashew), milk, sesame and peanut (groundnut oil). Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // from back label, 2026-11-13
    priceINR: 349, // ₹300–400 range set by owner, 2026-11-04
    isBestseller: true,
  },
  {
    slug: "paneer-tikka-gravy-premix-no-onion-no-garlic",
    images: ["paneer-tikka-gravy-premix-no-onion-no-garlic-front.jpg"], // RasoiVita pack (composited), 2026-11-13
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
    priceINR: 349, // ₹300–400 range set by owner, 2026-11-04
  },
  {
    slug: "chhole-masala-premix",
    images: ["chhole-masala-premix-front.jpg", "chhole-masala-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-CHM-100",
    name: "Chhole Masala Premix",
    tagline: "Punjabi-style chhole, simplified",
    shortDescription:
      "A chhole masala base. Cook it with water as directed on the pack and add boiled chickpeas for Punjabi-style chhole.",
    longDescription: `A chhole masala base for Punjabi-style chhole. Cook it as directed on the pack with boiled chickpeas, and serve with bhature, kulche or rice. It works just as well with rajma.

Also available in a No Onion No Garlic version.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Cashew, roasted chana dal, tomato powder, chat masala, cornflour, salt, coriander powder, mace, black pepper, sugar, turmeric, kasuri methi, Kashmiri chilli, fennel seeds, garam masala, citric acid, groundnut oil, cinnamon, hing, bay leaf, ginger powder, clove, nutmeg, green cardamom, carom seed, dried pomegranate seeds, black salt, mango powder, onion and garlic powder.",
    cookingInstructions: `1. In a bowl, mix 4 tbsp (50 g) of premix with 200 ml water. Keep aside.
2. Heat 3–4 tbsp oil in a pan, add 250 g boiled chhole (or rajma) and sauté for 2–3 minutes.
3. Add the premix gravy, adjust water and salt if needed, and cook for 2 minutes.
4. Add 1 tbsp butter and cook for 2 more minutes. Serve hot.
5. Optional: for extra flavour, finish with a tadka of carom seeds, Kashmiri chilli powder and green chilli.`,
    dishType: "gravies",
    pairsWith: ["chickpeas"],
    spiceLevel: "HOT", // TODO: placeholder
    noOnionGarlic: false,
    netWeight: "100g", // from back label, 2026-11-13
    servings: SERVES,
    yieldNote: "4 tbsp (50 g) cooks 250 g boiled chhole, so a 100 g pack makes two batches",
    cookTimeMinutes: 10,
    shelfLifeMonths: 6, // from back label, 2026-11-13
    allergens: "Contains tree nuts (cashew) and peanut (groundnut oil). May contain wheat (gluten): the hing (asafoetida) we use is usually blended with wheat flour. Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // from back label, 2026-11-13
    priceINR: 339, // ₹300–400 range set by owner, 2026-11-04
    isFeatured: true,
  },
  {
    slug: "chhole-masala-premix-no-onion-no-garlic",
    images: ["chhole-masala-premix-no-onion-no-garlic-front.jpg"], // RasoiVita pack (composited), 2026-11-13
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
    priceINR: 339, // ₹300–400 range set by owner, 2026-11-04
  },
  {
    slug: "white-gravy-premix",
    images: ["white-gravy-premix-front.jpg", "white-gravy-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-WGR-100",
    name: "White Gravy Premix",
    tagline: "Creamy, mild and rich",
    shortDescription:
      "A creamy, mild white gravy base made with cashew, melon seeds and milk. Perfect for malai kofta, methi matar malai, kaju curry or navratan korma.",
    longDescription: `A creamy, mild white gravy base made with cashew, melon seeds and milk powder. Cook it with milk, then add fried, grilled or boiled vegetables, paneer or chicken.

Use it for methi matar malai, malai kofta, kaju curry or navratan korma.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Cashew, melon seeds, milk powder, onion powder, kasuri methi, garlic powder, ginger powder, sugar, salt, whole coriander, cardamom powder, fennel, rice flour, white pepper powder, cornflour, javitri, nutmeg, chilli flakes.",
    cookingInstructions: `1. In a bowl, mix 1 packet (100 g) of premix with 600 ml milk.
2. Heat 6–7 tbsp oil in a pan, add the premix mixture and cook for 4–5 minutes.
3. Add vegetables of your choice (fried, oven-grilled or boiled), 1 tbsp cream and butter, and cook for 3–4 minutes. Serve hot.`,
    dishType: "gravies",
    pairsWith: ["paneer", "vegetables", "chicken"],
    spiceLevel: "MILD", // TODO: placeholder
    noOnionGarlic: false, // label lists onion and garlic powder, 2026-11-13
    netWeight: "100g", // from back label, 2026-11-13
    servings: SERVES,
    yieldNote: "1 pack (100 g) with 600 ml milk",
    cookTimeMinutes: 10,
    shelfLifeMonths: 6, // from back label, 2026-11-13
    allergens: "Contains tree nuts (cashew) and milk. Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // from back label, 2026-11-13
    priceINR: 369, // ₹300–400 range set by owner, 2026-11-04
  },
  {
    slug: "all-purpose-gravy-premix",
    images: ["all-purpose-gravy-premix-front.jpg", "all-purpose-gravy-premix-back.jpg"], // RasoiVita pack, 2026-11-13
    sku: "KG-APG-100",
    name: "All Purpose Gravy Premix",
    tagline: "One gravy, endless dishes",
    shortDescription:
      "A versatile everyday gravy base. Mix with water, cook, and add paneer, vegetables, chana, eggs or chicken.",
    longDescription: `The everyday gravy base for busy kitchens. Cook it as directed on the pack and add whatever you have: paneer, mixed vegetables, chana, boiled eggs or chicken.`,
    highlights: PACK_CLAIMS,
    ingredients:
      "Cashew, melon seeds, coriander powder, onion powder, sugar, milk powder, garlic powder, tomato powder, turmeric powder, black pepper powder, kasuri methi, cumin, coriander seeds, Kashmiri red chilli powder, cornflour, salt, garam masala, oil, black salt, green chilli powder, bay leaf, cinnamon.",
    cookingInstructions: `1. In a bowl, mix 1 packet (100 g) of premix with 400 ml water.
2. Heat 6–7 tbsp oil in a pan, add the premix mixture and cook for 4–5 minutes.
3. Add vegetables of your choice and cook for 2–3 minutes. Add butter and cream, cook for another minute, and finish with chopped coriander.`,
    dishType: "gravies",
    pairsWith: ["paneer", "vegetables", "chickpeas", "chicken", "egg"],
    spiceLevel: "MEDIUM", // TODO: placeholder
    noOnionGarlic: false, // label lists onion and garlic powder, 2026-11-13
    netWeight: "100g", // from back label, 2026-11-13
    servings: SERVES,
    yieldNote: "1 pack (100 g) with 400 ml water",
    cookTimeMinutes: 10,
    shelfLifeMonths: 6, // from back label, 2026-11-13
    allergens: "Contains tree nuts (cashew) and milk. Made in a kitchen that also handles tree nuts, peanuts, milk, sesame and wheat.", // from back label, 2026-11-13
    priceINR: 319, // ₹300–400 range set by owner, 2026-11-04
  },
  {
    slug: "biryani-premix",
    images: ["biryani-premix-front.jpg"], // RasoiVita pack (composited), 2026-11-13
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
    priceINR: 379, // ₹300–400 range set by owner, 2026-11-04
  },
  {
    slug: "coconut-chutney-premix",
    images: ["coconut-chutney-premix-front.jpg"], // RasoiVita pack (composited), 2026-11-13
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
    priceINR: 309, // ₹300–400 range set by owner, 2026-11-04
  },
];
