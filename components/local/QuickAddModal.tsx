"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/farmers-market-cart";

export type ModalProduct = {
  id: string;
  sku: string;
  name: string;
  tagline: string | null;
  price: number;
  sizes: string[];
  imageUrl: string | null;
};

type Props = {
  product: ModalProduct;
  onClose: () => void;
};

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

export default function QuickAddModal({ product, onClose }: Props) {
  const router = useRouter();
  const sizes = product.sizes.length > 0 ? product.sizes : ["Standard"];
  const [size, setSize]         = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  // Lock scroll while modal open + ESC-to-close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function add() {
    addToCart({
      productId: product.id,
      sku:       product.sku,
      name:      product.name,
      size,
      quantity,
      price:     product.price,
      imageUrl:  product.imageUrl,
    });
  }

  function handleAddAndContinue() {
    add();
    onClose();
  }

  function handleAddAndCheckout() {
    add();
    router.push("/farmers-market/order");
  }

  const lineTotal = product.price * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-brand-border">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-sage">
            Add to WhatsApp Cart
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-brand-muted hover:text-brand-green text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-mint"
          >
            ×
          </button>
        </div>

        {/* Product summary */}
        <div className="flex gap-4 p-5 border-b border-brand-border">
          <div className="shrink-0 w-20 h-20 rounded-xl bg-brand-mint overflow-hidden relative">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🍵</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-brand-green text-base leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h3>
            <p className="text-[10px] font-mono text-brand-sage mt-0.5">{product.sku}</p>
            {product.tagline && (
              <p className="text-xs text-brand-muted mt-1">{product.tagline}</p>
            )}
            <p className="text-sm font-bold text-brand-dark mt-1">
              {formatINR(product.price)} <span className="text-xs font-normal text-brand-muted">base</span>
            </p>
          </div>
        </div>

        {/* Size selector */}
        <div className="px-5 pt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            Choose size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  size === s
                    ? "border-brand-green bg-brand-mint text-brand-green ring-2 ring-brand-sage/30"
                    : "border-brand-border text-brand-dark hover:border-brand-sage"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="px-5 pt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-xl text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center text-lg font-bold text-brand-dark">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-xl text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors"
            >
              +
            </button>
            <div className="ml-auto text-right">
              <p className="text-xs text-brand-muted">Line total</p>
              <p className="text-lg font-bold text-brand-green">{formatINR(lineTotal)}</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="p-5 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleAddAndContinue}
            className="px-5 py-3 border-2 border-brand-green text-brand-green rounded-full text-sm font-semibold hover:bg-brand-mint transition-colors"
          >
            Add &amp; Continue Shopping
          </button>
          <button
            onClick={handleAddAndCheckout}
            className="px-5 py-3 bg-brand-green text-white rounded-full text-sm font-semibold hover:bg-brand-mid transition-colors"
          >
            Add &amp; Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
