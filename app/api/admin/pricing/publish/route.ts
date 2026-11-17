import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { pendingPublish, publishPrices } from "@/lib/pricing-server";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

/** Preview: what Publish would change on the store, from the saved pricing. */
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ changes: await pendingPublish() });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ changes: await publishPrices() });
}
