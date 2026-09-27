import type { Metadata } from "next";
import { db } from "@/lib/db";
import TrackClient from "./TrackClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the status of your Kanta Greens order with your order number and mobile.",
};

export const dynamic = "force-dynamic";

export default async function TrackPage() {
  const zone = await db.localDeliveryZone.findUnique({
    where: { id: "default" },
    select: { upiVpa: true, upiPayeeName: true, upiInstructions: true },
  });
  const upi = zone?.upiVpa
    ? { vpa: zone.upiVpa, payeeName: zone.upiPayeeName ?? "", instructions: zone.upiInstructions ?? "" }
    : null;
  return <TrackClient upi={upi} />;
}
