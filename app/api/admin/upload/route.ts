import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file   = form.get("file") as File | null;
  const folder = (form.get("folder") as string) || "gt/products/primary";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ public_id: string; secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: "image" }, (err, res) => {
          if (err || !res) reject(err ?? new Error("Upload failed"));
          else resolve(res as { public_id: string; secure_url: string });
        })
        .end(buffer);
    }
  );

  return NextResponse.json({ publicId: result.public_id, url: result.secure_url });
}
