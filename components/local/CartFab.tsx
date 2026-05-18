"use client";

import Link from "next/link";
import { useCart, cartItemCount, cartSubtotal } from "@/lib/farmers-market-cart";

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

export default function CartFab() {
  const cart = useCart();
  const count = cartItemCount(cart);
  if (count === 0) return null;
  const total = cartSubtotal(cart);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full sm:w-auto pointer-events-none">
      <Link
        href="/farmers-market/order"
        className="pointer-events-auto flex items-center gap-3 bg-brand-green text-white font-semibold px-5 sm:px-6 py-3.5 rounded-full shadow-xl shadow-brand-green/40 hover:bg-brand-mid transition-colors w-full sm:w-auto justify-center"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/>
        </svg>
        <span>WhatsApp Cart</span>
        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs sm:text-sm">
          {count} {count === 1 ? "item" : "items"} · {formatINR(total)}
        </span>
        <span className="text-xs opacity-80">Review →</span>
      </Link>
    </div>
  );
}
