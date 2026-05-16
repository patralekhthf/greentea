// Seed script — run with: npm run db:seed
// Populates countries table with Phase 1 supported countries

import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  console.log("Seeding countries...");

  const countries = [
    { name: "India",     code: "IN", currencyCode: "INR", currencySymbol: "₹"  },
    { name: "USA",       code: "US", currencyCode: "USD", currencySymbol: "$"  },
    { name: "UK",        code: "GB", currencyCode: "GBP", currencySymbol: "£"  },
    { name: "Australia", code: "AU", currencyCode: "AUD", currencySymbol: "A$" },
  ];

  for (const country of countries) {
    await db.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
    console.log(`  ✓ ${country.name} (${country.code})`);
  }

  console.log("Seed complete.");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
