// Canonical site URL: used for metadataBase, sitemap, robots and llms.txt.
export const SITE_URL = "https://www.kantagreens.com";

// Public, indexable pages that don't come from the DB.
export const STATIC_PAGES: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "/",               changeFrequency: "daily",   priority: 1.0 },
  { path: "/shop",           changeFrequency: "daily",   priority: 0.9 },
  { path: "/blog",           changeFrequency: "weekly",  priority: 0.8 },
  { path: "/about",          changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact",        changeFrequency: "monthly", priority: 0.5 },
  { path: "/farmers-market", changeFrequency: "weekly",  priority: 0.5 },
  { path: "/teas",           changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/shipping", changeFrequency: "monthly", priority: 0.3 },
  { path: "/legal/refund",   changeFrequency: "monthly", priority: 0.3 },
  { path: "/legal/terms",    changeFrequency: "monthly", priority: 0.2 },
  { path: "/legal/privacy",  changeFrequency: "monthly", priority: 0.2 },
];

// Paths crawlers should skip: admin, APIs, and per-customer pages.
export const NO_CRAWL = ["/admin", "/api/", "/cart", "/checkout", "/track", "/farmers-market/order"];

// AI crawlers and assistants we explicitly welcome (search, training and
// user-triggered fetches). Listed by name so a future change to the "*" group
// can't silently shut them out.
export const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "Amazonbot", "Meta-ExternalAgent", "CCBot",
];
