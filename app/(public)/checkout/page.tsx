import type { Metadata } from "next";
import { db } from "@/lib/db";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // UPI details are managed in Admin > Farmers Market > UPI Payment and shared by both checkouts
  const zone = await db.localDeliveryZone.findUnique({
    where: { id: "default" },
    select: { upiVpa: true, upiPayeeName: true, upiInstructions: true },
  });
  const upi = zone?.upiVpa
    ? { vpa: zone.upiVpa, payeeName: zone.upiPayeeName ?? "", instructions: zone.upiInstructions ?? "" }
    : null;

  return <CheckoutClient upi={upi} />;
}
