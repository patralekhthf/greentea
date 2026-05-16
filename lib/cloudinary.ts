import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/** Build a Cloudinary URL from a public_id with transforms */
export function buildImageUrl(
  publicId: string,
  transforms: string = "w_800,h_800,c_fill,f_webp,q_auto"
): string {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/** Cloudinary folder paths */
export const CLOUDINARY_FOLDERS = {
  productPrimary:  "gt/products/primary",
  productGallery:  "gt/products/gallery",
  blog:            "gt/blogs",
  banner:          "gt/banners",
  category:        "gt/categories",
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
