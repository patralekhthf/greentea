import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { buildImageUrl } from "@/lib/cloudinary-url";
import SimpleMarkdown from "@/components/ui/SimpleMarkdown";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blog.findUnique({ where: { slug } });
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
      ...(post.coverImageUrl
        ? { images: [buildImageUrl(post.coverImageUrl, "w_1200,h_630,c_fill,f_webp,q_auto")] }
        : {}),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await db.blog.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) notFound();

  const related = await db.blog.findMany({
    where: { status: "PUBLISHED", slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Cover image */}
      {post.coverImageUrl && (
        <div className="relative w-full h-72 sm:h-96 bg-brand-mint">
          <Image
            src={buildImageUrl(post.coverImageUrl, "w_1440,h_600,c_fill,f_webp,q_auto")}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Article */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted pt-8 mb-6">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-brand-green transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-brand-dark font-medium line-clamp-1">{post.title}</span>
        </nav>

        {/* Meta */}
        {post.publishedAt && (
          <p className="text-xs text-brand-muted mb-4">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        )}

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-bold text-brand-green leading-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-brand-muted leading-relaxed mb-8 pb-8 border-b border-brand-border italic">
            {post.excerpt}
          </p>
        )}

        {/* Body */}
        <div className="prose-blog pb-16">
          <SimpleMarkdown text={post.content} />
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="bg-white border-t border-brand-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2
              className="text-2xl font-bold text-brand-green mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              More from the Journal
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group bg-brand-cream rounded-2xl border border-brand-border overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video bg-brand-mint overflow-hidden">
                    {p.coverImageUrl ? (
                      <Image
                        src={buildImageUrl(p.coverImageUrl, "w_400,h_225,c_fill,f_webp,q_auto")}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🍵</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="text-sm font-bold text-brand-green leading-snug group-hover:text-brand-mid transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-brand-green text-white text-center py-14 px-4">
        <h2
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ready to start your ritual?
        </h2>
        <p className="text-white/70 mb-6 text-sm">Explore our full collection of premium organic teas.</p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-white text-brand-green font-semibold text-sm rounded-full hover:bg-brand-mint transition-colors"
        >
          Shop All Teas
        </Link>
      </div>
    </div>
  );
}
