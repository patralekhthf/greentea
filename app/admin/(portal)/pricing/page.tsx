import type { Metadata } from "next";
import { loadPricing } from "@/lib/pricing-server";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pricing" };

export default async function AdminPricingPage() {
  return <PricingClient initial={await loadPricing()} />;
}
