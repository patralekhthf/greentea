import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { buildImageUrl } from "@/lib/cloudinary-url";

export const metadata: Metadata = {
  title: "Blog",
  description: "Wellness guides, brewing tips, and the stories behind our teas.",
};

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const posts = await db.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xs font-semibold text-brand-sage uppercase tracking-widest mb-3">
            The Kanta Greens Journal
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-brand-green mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Wellness, Steeped in Knowledge
          </h1>
          <p className="text-brand-muted max-w-xl mx-auto">
            Brewing guides, Ayurvedic wisdom, and the stories behind every cup.
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-brand-muted">
            <p className="text-lg">No posts published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-lg hover:border-brand-sage transition-all duration-300 flex flex-col"
              >
                {/* Cover image */}
                <div className="relative aspect-video bg-brand-mint overflow-hidden">
                  {post.coverImageUrl ? (
                    <Image
                      src={buildImageUrl(post.coverImageUrl, "w_600,h_338,c_fill,f_webp,q_auto")}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl opacity-30">🍵</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  {post.publishedAt && (
                    <p className="text-xs text-brand-muted mb-2">
                      {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                  <h2
                    className="font-bold text-brand-green text-base leading-snug mb-2 group-hover:text-brand-mid transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-xs text-brand-muted leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-4 text-xs font-semibold text-brand-green group-hover:underline">
                    Read more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
