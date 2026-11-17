// Parses an uploaded pricing sheet and returns a preview. Nothing is saved here:
// the page shows the changes and the admin saves them.
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { loadPricing } from "@/lib/pricing-server";
import { parsePricingWorkbook } from "@/lib/pricing-excel";

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 2 MB." }, { status: 400 });
  if (!/\.xlsx$/i.test(file.name)) return NextResponse.json({ error: "Please upload an .xlsx file." }, { status: 400 });
  try {
    const { config, rows } = await loadPricing();
    const parsed = await parsePricingWorkbook(await file.arrayBuffer(), config, rows);
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not read the file." }, { status: 400 });
  }
}
