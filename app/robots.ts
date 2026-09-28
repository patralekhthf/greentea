import type { MetadataRoute } from "next";
import { AI_CRAWLERS, NO_CRAWL, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: NO_CRAWL },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: NO_CRAWL },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
