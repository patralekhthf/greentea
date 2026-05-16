import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT:     "bg-yellow-100 text-yellow-700",
  ARCHIVED:  "bg-gray-100 text-gray-500",
};

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images:        { where: { isPrimary: true }, take: 1 },
      countryConfigs: { where: { country: { code: "IN" } }, select: { price: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl hover:bg-brand-mid transition-colors"
        >
          + New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="text-left px-5 py-3.5">Product</th>
              <th className="text-left px-5 py-3.5">Status</th>
              <th className="text-left px-5 py-3.5">IN Price</th>
              <th className="text-left px-5 py-3.5">Flags</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.slug}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status] ?? STATUS_STYLE.DRAFT}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-700">
                  {p.countryConfigs[0]?.price ? `₹${parseFloat(p.countryConfigs[0].price.toString()).toFixed(0)}` : "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {p.isBestseller && <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">Bestseller</span>}
                    {p.isFeatured   && <span className="text-xs bg-brand-gold text-white px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-xs font-semibold text-brand-green hover:text-brand-mid transition-colors mr-4"
                  >
                    Edit
                  </Link>
                  <a
                    href={`/products/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    View ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No products yet.</p>
            <Link href="/admin/products/new" className="text-sm text-brand-green font-semibold hover:underline mt-2 inline-block">
              Create your first product →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
