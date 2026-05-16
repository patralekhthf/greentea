/**
 * Seed script — npm run db:seed
 *
 * Populates:
 *  - Countries (IN, US, GB, AU)
 *  - Categories (TEA_TYPE + WELLNESS_GOAL)
 *  - 5 sample products with country configs and category links
 *
 * Images are intentionally omitted — add them via the admin portal once
 * Cloudinary uploads are wired up. Cards will show the 🍵 placeholder until then.
 *
 * Safe to re-run: all operations use upsert.
 */

import { db } from "../lib/db";

// ─── Countries ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { name: "India",     code: "IN", currencyCode: "INR", currencySymbol: "₹"  },
  { name: "USA",       code: "US", currencyCode: "USD", currencySymbol: "$"  },
  { name: "UK",        code: "GB", currencyCode: "GBP", currencySymbol: "£"  },
  { name: "Australia", code: "AU", currencyCode: "AUD", currencySymbol: "A$" },
];

// ─── Categories ───────────────────────────────────────────────────────────────

const TEA_TYPES = [
  { name: "Green Tea",     slug: "green-tea",     displayOrder: 1 },
  { name: "Herbal Tea",    slug: "herbal-tea",    displayOrder: 2 },
  { name: "Ayurvedic Tea", slug: "ayurvedic-tea", displayOrder: 3 },
  { name: "Floral Tea",    slug: "floral-tea",    displayOrder: 4 },
  { name: "Detox Tea",     slug: "detox-tea",     displayOrder: 5 },
  { name: "Gift Packs",    slug: "gift-packs",    displayOrder: 6 },
];

const WELLNESS_GOALS = [
  { name: "Better Sleep",      slug: "better-sleep",      displayOrder: 1 },
  { name: "Stress Relief",     slug: "stress-relief",     displayOrder: 2 },
  { name: "Weight Management", slug: "weight-management", displayOrder: 3 },
  { name: "Immunity Support",  slug: "immunity-support",  displayOrder: 4 },
  { name: "Detox & Cleanse",   slug: "detox-cleanse",     displayOrder: 5 },
  { name: "Energy & Focus",    slug: "energy-focus",      displayOrder: 6 },
  { name: "Digestion Support", slug: "digestion-support", displayOrder: 7 },
  { name: "Women's Wellness",  slug: "womens-wellness",   displayOrder: 8 },
];

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: "Himalayan Tulsi Green Tea",
    slug: "himalayan-tulsi-green-tea",
    tagline: "Clarity in every sip",
    shortDescription:
      "A harmonious blend of hand-picked Himalayan green tea and sacred Tulsi (Holy Basil), revered in Ayurveda for centuries.",
    longDescription: `## About This Tea

Our Himalayan Tulsi Green Tea brings together two of nature's most powerful botanicals — the antioxidant-rich green tea leaves from the pristine foothills of the Himalayas and the adaptogenic power of Tulsi, revered in Ayurvedic medicine for over 3,000 years.

Each batch is carefully blended to achieve the perfect balance of grassy freshness and the warm, clove-like spice of Tulsi.

## Why You'll Love It

The mild caffeine from the green tea gives you a clean, focused energy without the jitters — while Tulsi works to calm the nervous system and reduce cortisol levels. The result is alert calm.

It is especially popular as a morning ritual or a mid-afternoon pick-me-up.`,
    ingredients:
      "- Himalayan Green Tea (80%)\n- Tulsi / Holy Basil leaves (20%)\n\nAll ingredients are organically grown and hand-processed.",
    brewingInstructions:
      "## Brewing Instructions\n\n- **Water temperature:** 80°C (176°F) — never boiling\n- **Quantity:** 1 teaspoon (2g) per 200ml cup\n- **Steep time:** 2–3 minutes\n\nFor a stronger cup, increase quantity rather than steep time to avoid bitterness.\n\n## Iced Tea\n\nDouble the quantity and steep for 3 minutes. Pour over ice immediately.",
    benefits:
      "- **Adaptogenic support** — Tulsi helps the body adapt to stress\n- **Antioxidant-rich** — EGCG in green tea fights free radicals\n- **Immune boost** — antimicrobial properties of Holy Basil\n- **Mental clarity** — L-Theanine + caffeine for focused calm\n- **Digestive aid** — soothes the gut and reduces bloating",
    caffeineLevel: "LOW" as const,
    tasteProfile: "Grassy, slightly sweet, with warm herbal notes and a clean finish",
    aromaProfile: "Fresh green tea with spicy-floral Tulsi undertones",
    packagingSizes: ["50g", "100g", "200g"],
    storageInstructions: "Store in a cool, dry place away from direct sunlight. Keep the tin tightly sealed after opening.",
    isBestseller: true,
    isFeatured: true,
    teaType: "green-tea",
    wellness: ["stress-relief", "energy-focus", "immunity-support"],
    prices: { IN: 549, US: 12, GB: 10, AU: 18 },
    salePrices: { IN: 449 } as Record<string, number>,
    ratings: { IN: 4.7, US: 4.5 } as Record<string, number>,
    reviewCounts: { IN: 2340, US: 187 } as Record<string, number>,
    amazonUrls: {
      US: "https://www.amazon.com/dp/example-tulsi",
      GB: "https://www.amazon.co.uk/dp/example-tulsi",
      AU: "https://www.amazon.com.au/dp/example-tulsi",
    } as Record<string, string>,
  },
  {
    name: "Chamomile Lavender Sleep Blend",
    slug: "chamomile-lavender-sleep-blend",
    tagline: "Drift into restful nights",
    shortDescription:
      "A soothing, caffeine-free blend of sun-dried chamomile flowers and Provençal lavender buds to ease you into deep, restful sleep.",
    longDescription: `## About This Tea

There is a reason chamomile has been the world's most popular bedtime tea for millennia — and we've made it even better.

Our sleep blend pairs the classic apple-honey sweetness of Egyptian chamomile with the gently floral, slightly sweet lavender sourced from Provence, France. Together, they create a cup that signals to your body and mind that it is time to unwind.

## The Science of Sleep

Chamomile contains **apigenin**, a flavonoid that binds to GABA receptors in the brain — the same pathway targeted by sleep medications, but naturally and gently. Lavender's **linalool** further reduces anxiety and promotes relaxation.

This blend is 100% caffeine-free, making it perfect for any time of day — though we recommend making it part of your evening ritual, 30-45 minutes before bed.`,
    ingredients:
      "- Chamomile flowers — Egyptian (70%)\n- Lavender buds — Provencal (30%)\n\nNo additives, no artificial flavours. 100% flowers.",
    brewingInstructions:
      "## Brewing Instructions\n\n- **Water temperature:** 95°C (203°F)\n- **Quantity:** 1.5 teaspoons (3g) per 250ml cup\n- **Steep time:** 5–7 minutes (longer = more potent)\n\n## Evening Ritual Tip\n\nAdd a drizzle of raw honey and a squeeze of lemon for a deeply soothing nightcap. Steep covered to preserve the volatile aromatics.",
    benefits:
      "- **Sleep induction** — apigenin gently activates GABA receptors\n- **Anxiety reduction** — lavender linalool calms the nervous system\n- **Anti-inflammatory** — chamomile reduces inflammation and muscle tension\n- **100% caffeine-free** — safe any time of day\n- **Digestive ease** — relieves cramps and promotes gut relaxation before bed",
    caffeineLevel: "NONE" as const,
    tasteProfile: "Delicate apple-honey sweetness with soft floral lavender notes",
    aromaProfile: "Dreamy florals — chamomile blossom and Provence lavender fields",
    packagingSizes: ["30g", "75g"],
    storageInstructions: "Store away from light and moisture. Best consumed within 18 months of opening.",
    isBestseller: true,
    isFeatured: false,
    teaType: "floral-tea",
    wellness: ["better-sleep", "stress-relief", "womens-wellness"],
    prices: { IN: 649, US: 14, GB: 12, AU: 21 },
    salePrices: {} as Record<string, number>,
    ratings: { IN: 4.9, US: 4.8, GB: 4.7 } as Record<string, number>,
    reviewCounts: { IN: 1870, US: 423, GB: 89 } as Record<string, number>,
    amazonUrls: {
      US: "https://www.amazon.com/dp/example-chamomile",
      GB: "https://www.amazon.co.uk/dp/example-chamomile",
      AU: "https://www.amazon.com.au/dp/example-chamomile",
    } as Record<string, string>,
  },
  {
    name: "Triphala Detox Herbal Tea",
    slug: "triphala-detox-herbal-tea",
    tagline: "Ancient Ayurveda, modern wellness",
    shortDescription:
      "A powerful caffeine-free Ayurvedic blend centered on Triphala — three sacred fruits used for digestive health and gentle full-body detox.",
    longDescription: `## About This Tea

Triphala — meaning "three fruits" in Sanskrit — is one of Ayurveda's most celebrated formulations, used for over 2,000 years to support digestive health and gentle detoxification.

We've blended Triphala with complementary herbs including licorice root (Mulethi), ginger, and long pepper to create a tea that is both effective and deeply flavourful.

## What is Triphala?

Triphala consists of three dried fruits:
- **Amalaki** (Indian Gooseberry) — the richest natural source of Vitamin C
- **Bibhitaki** — supports respiratory and digestive health
- **Haritaki** — known as the "king of medicines" in Tibetan healing

Together, they gently cleanse the digestive tract, support liver function, and promote regularity — without the harsh effects of conventional detox products.`,
    ingredients:
      "- Triphala powder (Amalaki, Bibhitaki, Haritaki) — 60%\n- Ginger root — 20%\n- Licorice root (Mulethi) — 15%\n- Long pepper (Pippali) — 5%",
    brewingInstructions:
      "## Brewing Instructions\n\n- **Water temperature:** 95°C (203°F)\n- **Quantity:** 1 teaspoon (2g) per 200ml\n- **Steep time:** 7–10 minutes\n\n## Best Time to Drink\n\nTraditionally consumed 30 minutes after meals, or first thing in the morning on an empty stomach for maximum detox benefit.\n\n## Taste Tip\n\nThe earthy, slightly astringent taste is characteristic of Triphala. Add honey to balance if desired.",
    benefits:
      "- **Digestive health** — Triphala tones the entire GI tract\n- **Gentle detox** — supports liver and colon cleansing\n- **Vitamin C boost** — Amalaki is the richest natural source\n- **Anti-inflammatory** — ginger reduces systemic inflammation\n- **Regularity** — promotes healthy bowel movements naturally",
    caffeineLevel: "NONE" as const,
    tasteProfile: "Earthy and complex — tart, slightly bitter, with warming ginger and sweet licorice finish",
    aromaProfile: "Deep, medicinal, warming — ginger and licorice dominate",
    packagingSizes: ["50g", "100g"],
    storageInstructions: "Keep in an airtight container away from moisture. Powder absorbs humidity — always use a dry spoon.",
    isBestseller: false,
    isFeatured: true,
    teaType: "ayurvedic-tea",
    wellness: ["detox-cleanse", "digestion-support", "immunity-support"],
    prices: { IN: 499, US: 11, GB: 9, AU: 16 },
    salePrices: { IN: 399 } as Record<string, number>,
    ratings: { IN: 4.6 } as Record<string, number>,
    reviewCounts: { IN: 920 } as Record<string, number>,
    amazonUrls: {
      US: "https://www.amazon.com/dp/example-triphala",
      GB: "https://www.amazon.co.uk/dp/example-triphala",
      AU: "https://www.amazon.com.au/dp/example-triphala",
    } as Record<string, string>,
  },
  {
    name: "Spearmint Moringa Green",
    slug: "spearmint-moringa-green",
    tagline: "The powerhouse in a cup",
    shortDescription:
      "Vibrant Japanese-style sencha green tea blended with organic moringa leaf and cooling spearmint — an energising superfood combination.",
    longDescription: `## About This Tea

This is the tea for the health-conscious, always-on individual. Three superfoods in one cup — Japanese-inspired sencha green tea, moringa (dubbed "the miracle tree"), and spearmint.

The result is a vivid, refreshing cup with a cool finish and a nutrient density that is hard to match.

## Moringa — The Miracle Tree

Moringa oleifera leaves contain:
- **7x** the Vitamin C of oranges
- **4x** the Calcium of milk
- **3x** the Iron of spinach
- All **9** essential amino acids

Combined with green tea's antioxidants and spearmint's digestive benefits, this is one of the most nutritionally dense teas you can drink.`,
    ingredients:
      "- Sencha green tea — 60%\n- Moringa leaf (organic, sun-dried) — 25%\n- Spearmint — 15%",
    brewingInstructions:
      "## Brewing Instructions\n\n- **Water temperature:** 75°C (167°F) — crucial to preserve moringa nutrients\n- **Quantity:** 1 teaspoon (2g) per 200ml\n- **Steep time:** 2 minutes\n\n## Cold Brew\n\nAdd 2 teaspoons to 500ml cold water. Refrigerate overnight (8 hours). Strain and serve over ice — this method preserves maximum nutrients.",
    benefits:
      "- **Energy without crash** — green tea L-Theanine provides sustained focus\n- **Superfood nutrition** — moringa's complete amino acid and mineral profile\n- **Hormonal balance** — spearmint is clinically studied for androgen reduction\n- **Weight support** — green tea catechins boost metabolism\n- **Digestive comfort** — spearmint soothes the gut",
    caffeineLevel: "MEDIUM" as const,
    tasteProfile: "Bright, grassy sencha with cooling mint and earthy moringa undertones",
    aromaProfile: "Fresh cut grass meets cool spearmint — invigorating",
    packagingSizes: ["50g", "100g", "200g"],
    storageInstructions: "Store in a sealed, opaque tin. Moringa is sensitive to light — avoid glass containers.",
    isBestseller: false,
    isFeatured: true,
    teaType: "green-tea",
    wellness: ["energy-focus", "weight-management", "womens-wellness"],
    prices: { IN: 599, US: 13, GB: 11, AU: 19 },
    salePrices: {} as Record<string, number>,
    ratings: { IN: 4.5, US: 4.4 } as Record<string, number>,
    reviewCounts: { IN: 658, US: 94 } as Record<string, number>,
    amazonUrls: {
      US: "https://www.amazon.com/dp/example-moringa",
      GB: "https://www.amazon.co.uk/dp/example-moringa",
      AU: "https://www.amazon.com.au/dp/example-moringa",
    } as Record<string, string>,
  },
  {
    name: "Ashwagandha Ginger Immunity Tea",
    slug: "ashwagandha-ginger-immunity-tea",
    tagline: "Strengthen from within",
    shortDescription:
      "A robust caffeine-free blend built around Ashwagandha root and fresh ginger — two of Ayurveda's most potent immune and stress-support herbs.",
    longDescription: `## About This Tea

When modern life demands more than your reserves can give, this is the tea to reach for.

Ashwagandha (Withania somnifera) is classified as a **Rasayana** in Ayurveda — a rejuvenating herb that restores vitality and builds resilience over time. Paired with ginger's immediate warming, anti-inflammatory action and the sweetness of licorice, this blend works both in the moment and as a long-term tonic.

## Ashwagandha — Adaptogen Research

Multiple clinical studies have confirmed Ashwagandha's ability to:
- Reduce cortisol levels by up to **27%**
- Improve VO2 max and physical endurance
- Enhance thyroid function
- Support testosterone and reproductive health in men

The key active compounds, **withanolides**, are most bioavailable when consumed with warmth — making a hot tea the ideal delivery method.`,
    ingredients:
      "- Ashwagandha root (KSM-66 standardised extract base) — 40%\n- Ginger root (dried) — 30%\n- Licorice root — 20%\n- Black pepper (for bioavailability) — 5%\n- Cinnamon — 5%",
    brewingInstructions:
      "## Brewing Instructions\n\n- **Water temperature:** 95°C (203°F)\n- **Quantity:** 1.5 teaspoons (3g) per 250ml\n- **Steep time:** 8–10 minutes\n\n## Golden Milk Style\n\nFor an extra comforting cup, brew with 50% warm milk (dairy or oat). Add a pinch of turmeric. The fat from milk enhances ashwagandha absorption.\n\n## Consistency is key\n\nAdaptogenic herbs work best when taken consistently. Aim for one cup daily for 4-8 weeks to experience the full benefits.",
    benefits:
      "- **Stress and cortisol reduction** — clinically studied ashwagandha\n- **Immune modulation** — ginger's gingerols activate immune cells\n- **Anti-inflammatory** — whole-body inflammation reduction\n- **Energy and endurance** — Rasayana tonic for sustained vitality\n- **Hormonal balance** — supports adrenal and thyroid health",
    caffeineLevel: "NONE" as const,
    tasteProfile: "Earthy, warming, slightly bitter ashwagandha with spicy ginger heat and sweet licorice balance",
    aromaProfile: "Root-forward and warming — earthy, spicy, deeply comforting",
    packagingSizes: ["75g", "150g"],
    storageInstructions: "Store in an airtight tin in a cool, dry place. Best before 24 months from production date.",
    isBestseller: false,
    isFeatured: false,
    teaType: "ayurvedic-tea",
    wellness: ["immunity-support", "stress-relief", "energy-focus"],
    prices: { IN: 699, US: 15, GB: 13, AU: 22 },
    salePrices: {} as Record<string, number>,
    ratings: { IN: 4.8, US: 4.6 } as Record<string, number>,
    reviewCounts: { IN: 1120, US: 201 } as Record<string, number>,
    amazonUrls: {
      US: "https://www.amazon.com/dp/example-ashwagandha",
      GB: "https://www.amazon.co.uk/dp/example-ashwagandha",
      AU: "https://www.amazon.com.au/dp/example-ashwagandha",
    } as Record<string, string>,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌿 Kanta Greens — Seed Script\n");

  // 1. Countries
  console.log("📍 Seeding countries...");
  for (const c of COUNTRIES) {
    await db.country.upsert({ where: { code: c.code }, update: c, create: c });
    console.log(`   ✓ ${c.name} (${c.code})`);
  }

  // 2. Categories — Tea Types
  console.log("\n🍵 Seeding tea type categories...");
  for (const cat of TEA_TYPES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { ...cat, categoryType: "TEA_TYPE" },
      create: { ...cat, categoryType: "TEA_TYPE" },
    });
    console.log(`   ✓ ${cat.name}`);
  }

  // 3. Categories — Wellness Goals
  console.log("\n💚 Seeding wellness goal categories...");
  for (const cat of WELLNESS_GOALS) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { ...cat, categoryType: "WELLNESS_GOAL" },
      create: { ...cat, categoryType: "WELLNESS_GOAL" },
    });
    console.log(`   ✓ ${cat.name}`);
  }

  // 4. Products
  console.log("\n📦 Seeding products...");
  for (const p of PRODUCTS) {
    const {
      teaType, wellness, prices, salePrices, ratings, reviewCounts, amazonUrls,
      ...productData
    } = p;

    // Upsert product
    const product = await db.product.upsert({
      where: { slug: productData.slug },
      update: { ...productData, status: "PUBLISHED" },
      create: { ...productData, status: "PUBLISHED" },
    });

    // Country configs
    for (const c of COUNTRIES) {
      const country = await db.country.findUniqueOrThrow({ where: { code: c.code } });
      const price = prices[c.code as keyof typeof prices];
      const salePrice = salePrices[c.code] ?? null;
      const rating = ratings[c.code] ?? null;
      const reviewCount = reviewCounts[c.code] ?? null;
      const amazonUrl = amazonUrls[c.code] ?? null;

      await db.productCountryConfig.upsert({
        where: { productId_countryId: { productId: product.id, countryId: country.id } },
        update: {
          isAvailable: true,
          price,
          salePrice,
          displayRating: rating,
          displayReviewCount: reviewCount,
          amazonEnabled: c.code !== "IN" && !!amazonUrl,
          amazonUrl,
          directPurchaseEnabled: c.code === "IN",
          stockQuantity: 500,
        },
        create: {
          productId: product.id,
          countryId: country.id,
          isAvailable: true,
          price,
          salePrice,
          displayRating: rating,
          displayReviewCount: reviewCount,
          amazonEnabled: c.code !== "IN" && !!amazonUrl,
          amazonUrl,
          directPurchaseEnabled: c.code === "IN",
          stockQuantity: 500,
        },
      });
    }

    // Tea type category link
    const teaTypeCat = await db.category.findUnique({ where: { slug: teaType } });
    if (teaTypeCat) {
      await db.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: teaTypeCat.id } },
        update: {},
        create: { productId: product.id, categoryId: teaTypeCat.id },
      });
    }

    // Wellness goal category links
    for (const wSlug of wellness) {
      const wCat = await db.category.findUnique({ where: { slug: wSlug } });
      if (wCat) {
        await db.productCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: wCat.id } },
          update: {},
          create: { productId: product.id, categoryId: wCat.id },
        });
      }
    }

    console.log(`   ✓ ${product.name}`);
  }

  console.log("\n✅ Seed complete!\n");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
