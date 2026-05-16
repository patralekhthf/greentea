// SERVER-ONLY — uses Cloudinary Node.js SDK (requires fs, crypto, etc.)
// Never import this file from client components or pages/api client bundles.
// For URL building in client components, use lib/cloudinary-url.ts instead.
import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Re-export URL utilities for convenience in server-only contexts
export { buildImageUrl, CLOUDINARY_FOLDERS, TRANSFORMS } from "./cloudinary-url";
