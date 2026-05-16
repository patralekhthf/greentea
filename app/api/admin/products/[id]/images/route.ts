import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

type Ctx = { params: Promise<{ id: string }> };

/** POST — upload image and attach to product */
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const form      = await req.formData();
  const file      = form.get("file") as File | null;
  const isPrimary = form.get("isPrimary") === "true";
  const altText   = (form.get("altText") as string) || "";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Upload to Cloudinary
  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const result = await new Promise<{ public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "gt/products/primary", resource_type: "image" },
        (err, res) => {
          if (err || !res) reject(err ?? new Error("Upload failed"));
          else resolve(res as { public_id: string });
        }
      )
      .end(buffer);
  });

  // If marking as primary, unset all others
  if (isPrimary) {
    await db.productImage.updateMany({ where: { productId: id }, data: { isPrimary: false } });
  }

  const image = await db.productImage.create({
    data: {
      productId: id,
      cloudinaryPublicId: result.public_id,
      altText,
      isPrimary,
      displayOrder: 0,
    },
  });

  return NextResponse.json(image, { status: 201 });
}

/** DELETE — remove image by imageId passed in body */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await params; // consume

  const { imageId, publicId } = await req.json();
  if (!imageId) return NextResponse.json({ error: "imageId required" }, { status: 400 });

  // Delete from Cloudinary
  if (publicId) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  await db.productImage.delete({ where: { id: imageId } });
  return NextResponse.json({ ok: true });
}
