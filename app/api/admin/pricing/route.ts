import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { loadPricing, savePricing } from "@/lib/pricing-server";
import { PRICING_PARAMS } from "@/lib/pricing";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await loadPricing());
}

const Body = z.object({
  config: z.object(Object.fromEntries(PRICING_PARAMS.map((p) => [p.key, z.number().min(0).max(p.kind === "percent" ? 1 : 100000)]))),
  rows: z.array(z.object({
    productId: z.string().min(1),
    makingCost: z.number().positive().max(100000).nullable(),
    stock: z.enum(["ACTIVE", "OUT_OF_STOCK"]).optional(),
  })).max(500),
});

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid pricing data", issues: parsed.error.issues }, { status: 400 });
  await savePricing(parsed.data as Parameters<typeof savePricing>[0]);
  return NextResponse.json(await loadPricing());
}
