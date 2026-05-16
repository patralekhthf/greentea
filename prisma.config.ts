// Prisma 7 config — connection URL for migrations + introspection
// The adapter (PrismaPg) is passed to PrismaClient in lib/db.ts
// See: https://pris.ly/d/config-datasource

import { config } from "dotenv";
// Load .env.local first (Next.js convention), fall back to .env
config({ path: ".env.local" });
config({ path: ".env" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
