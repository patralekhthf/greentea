import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [productCount, blogCount, publishedProducts, publishedBlogs] =
    await Promise.all([
      db.product.count(),
      db.blog.count(),
      db.product.count({ where: { status: "PUBLISHED" } }),
      db.blog.count({ where: { status: "PUBLISHED" } }),
    ]);

  const stats = [
    { label: "Total Products",    value: productCount,     sub: `${publishedProducts} published`,  href: "/admin/products", color: "bg-green-50 text-green-700 border-green-200" },
    { label: "Blog Posts",        value: blogCount,        sub: `${publishedBlogs} published`,     href: "/admin/blog",     color: "bg-blue-50 text-blue-700 border-blue-200"  },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here&apos;s your store at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-2xl border p-6 hover:shadow-sm transition-shadow ${s.color}`}
          >
            <div className="text-3xl font-bold mb-1">{s.value}</div>
            <div className="text-sm font-semibold">{s.label}</div>
            <div className="text-xs mt-1 opacity-70">{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-mid transition-colors">
            + New Product
          </Link>
          <Link href="/admin/blog/new" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 transition-colors">
            + New Blog Post
          </Link>
          <a href="/shop" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 transition-colors flex items-center gap-1.5">
            View Shop
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
