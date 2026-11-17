import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { loadPricing } from "@/lib/pricing-server";
import { buildPricingWorkbook } from "@/lib/pricing-excel";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { config, rows } = await loadPricing();
  const file = await buildPricingWorkbook(config, rows);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="RasoiVita_Channel_Pricing_${date}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
