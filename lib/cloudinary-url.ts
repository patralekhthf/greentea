// Client-safe Cloudinary URL utilities — NO SDK import, safe for browser
// For server-side upload/management, use lib/cloudinary.ts

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** Build a Cloudinary URL from a public_id with transforms */
export function buildImageUrl(
  publicId: string,
  transforms: string = "w_800,h_800,c_fill,f_webp,q_auto"
): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/** Cloudinary folder paths */
export const CLOUDINARY_FOLDERS = {
  productPrimary: "gt/products/primary",
  productGallery: "gt/products/gallery",
  blog:           "gt/blogs",
  banner:         "gt/banners",
  category:       "gt/categories",
} as const;

/** Standard transform presets */
export const TRANSFORMS = {
  productCard:    "w_400,h_400,c_fill,f_webp,q_80",
  productDetail:  "w_800,h_800,c_fill,f_webp,q_auto",
  productGallery: "w_1200,h_900,c_fill,f_webp,q_auto",
  blogCover:      "w_1200,h_630,c_fill,f_webp,q_auto",
  banner:         "w_1440,h_500,c_fill,f_webp,q_auto",
  categoryIcon:   "w_120,h_120,c_fill,f_webp,q_auto",
} as const;
