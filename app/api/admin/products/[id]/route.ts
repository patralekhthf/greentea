import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] },
      countryConfigs: { include: { country: true } },
      categories: { include: { category: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body   = await req.json();

  const product = await db.product.update({ where: { id }, data: body });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
