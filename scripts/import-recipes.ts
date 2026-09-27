/**
 * Publish the recipe posts in scripts/data/recipes.ts to the blog (/blog).
 *
 *   npm run db:import-recipes -- --dry-run   validate only, no DB or Cloudinary access
 *   npm run db:import-recipes -- --yes       upload covers + upsert posts as PUBLISHED
 *
 * Posts are matched by slug, so re-running updates them in place and keeps
 * their original publish date. Covers are uploaded to Cloudinary as
 * gt/blog/recipes/<slug> (overwritten on re-runs).
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { RECIPES } from "./data/recipes";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const CONFIRMED = args.has("--yes");
const COVER_DIR = path.join(__dirname, "data", "images", "recipes");

function validate(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of RECIPES) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug)) errors.push(`[${r.slug}] bad slug`);
    if (seen.has(r.slug)) errors.push(`[${r.slug}] duplicate slug`);
    seen.add(r.slug);
    if (!existsSync(path.join(COVER_DIR, r.cover))) errors.push(`[${r.slug}] cover not found: ${r.cover}`);
    if (r.metaDescription.length > 170) errors.push(`[${r.slug}] meta description is ${r.metaDescription.length} chars (keep under 170)`);
    if (!r.content.includes("## Method")) errors.push(`[${r.slug}] missing a Method section`);
  }
  return errors;
}

async function main() {
  const errors = validate();
  console.table(RECIPES.map((r) => ({ slug: r.slug, cover: r.cover, words: r.content.split(/\s+/).length })));
  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("Recipes are valid.");
  if (DRY_RUN) return;

  const host = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/)?.[1] ?? "(unset)";
  console.log(`\nTarget database host: ${host}`);
  if (!CONFIRMED) {
    console.log("Nothing written. Re-run with --yes to publish.");
    return;
  }

  const { db } = await import("../lib/db");
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // First recipe in the file is shown first on /blog (newest publish date)
  const now = Date.now();
  for (const [i, r] of RECIPES.entries()) {
    const up = await cloudinary.uploader.upload(path.join(COVER_DIR, r.cover), {
      public_id: `gt/blog/recipes/${r.slug}`,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });
    const fields = {
      title: r.title,
      content: r.content,
      excerpt: r.excerpt,
      coverImageUrl: up.public_id,
      metaTitle: null,
      metaDescription: r.metaDescription,
      status: "PUBLISHED" as const,
    };
    const post = await db.blog.upsert({
      where: { slug: r.slug },
      create: { slug: r.slug, ...fields, publishedAt: new Date(now - i * 60_000) },
      update: fields,
      select: { slug: true },
    });
    console.log(`✔ /blog/${post.slug}`);
  }
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
