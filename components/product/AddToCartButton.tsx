"use client";

import { useState } from "react";
import QuickAddModal, { type ModalProduct } from "@/components/local/QuickAddModal";

type Props = {
  product: ModalProduct & { slug: string };
  disabled?: boolean;
  /** "card" = compact outline button for product cards; "full" = primary button on product pages */
  variant?: "card" | "full";
};

/** Opens the size + quantity picker and adds to the website (all-India) cart. */
export default function AddToCartButton({ product, disabled = false, variant = "card" }: Props) {
  const [open, setOpen] = useState(false);
  const className =
    variant === "full"
      ? "w-full py-3.5 rounded-full bg-brand-green text-white font-semibold text-sm hover:bg-brand-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      : "w-full text-xs font-semibold py-2.5 rounded-full border border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={disabled} className={className}>
        {disabled ? "Out of Stock" : "Add to Cart"}
      </button>
      {open && <QuickAddModal product={product} target="site" onClose={() => setOpen(false)} />}
    </>
  );
}
