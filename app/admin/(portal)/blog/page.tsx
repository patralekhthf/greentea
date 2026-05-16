import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog" };

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT:     "bg-yellow-100 text-yellow-700",
  ARCHIVED:  "bg-gray-100 text-gray-500",
};

export default async function AdminBlogPage() {
  const posts = await db.blog.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} total</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-mid transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="text-left px-5 py-3.5">Title</th>
              <th className="text-left px-5 py-3.5">Status</th>
              <th className="text-left px-5 py-3.5">Published</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{post.slug}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[post.status] ?? STATUS_STYLE.DRAFT}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-xs font-semibold text-brand-green hover:text-brand-mid transition-colors mr-4"
                  >
                    Edit
                  </Link>
                  {post.status === "PUBLISHED" && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      View ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No blog posts yet.</p>
            <Link href="/admin/blog/new" className="text-sm text-brand-green font-semibold hover:underline mt-2 inline-block">
              Write your first post →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
