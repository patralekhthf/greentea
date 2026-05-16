"use client";

import { useState } from "react";
import Image from "next/image";
import { buildImageUrl, TRANSFORMS } from "@/lib/cloudinary-url";

type GalleryImage = {
  cloudinaryPublicId: string;
  isPrimary: boolean;
  displayOrder: number;
};

type Props = {
  images: GalleryImage[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  const sorted = [...images].sort((a, b) =>
    a.isPrimary ? -1 : b.isPrimary ? 1 : a.displayOrder - b.displayOrder
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const active = sorted[activeIdx];

  if (sorted.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-brand-mint flex items-center justify-center">
        <span className="text-8xl opacity-40">🍵</span>
      </div>
    );
  }

  const mainUrl = buildImageUrl(active.cloudinaryPublicId, TRANSFORMS.productDetail);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-mint border border-brand-border">
        <Image
          src={mainUrl}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {sorted.map((img, idx) => {
            const thumbUrl = buildImageUrl(img.cloudinaryPublicId, "w_120,h_120,c_fill,f_webp,q_70");
            return (
              <button
                key={img.cloudinaryPublicId}
                onClick={() => setActiveIdx(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  idx === activeIdx
                    ? "border-brand-green shadow-md"
                    : "border-brand-border hover:border-brand-sage"
                }`}
              >
                <Image
                  src={thumbUrl}
                  alt={`${productName} view ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
