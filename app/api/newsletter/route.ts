import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/newsletter
 * Body: { email: string, source?: string }
 * Upserts a NewsletterSubscriber. `source` records where they signed up
 * (e.g. "homepage", "teas-waitlist"). Re-subscribing keeps the first source.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email  = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body.source === "string" ? body.source.slice(0, 50) : null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await db.newsletterSubscriber.upsert({
      where:  { email },
      update: {},
      create: { email, source, countryCode: req.cookies.get("gt_country")?.value ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter POST]", err);
    return NextResponse.json({ error: "Could not subscribe right now. Please try again." }, { status: 500 });
  }
}
