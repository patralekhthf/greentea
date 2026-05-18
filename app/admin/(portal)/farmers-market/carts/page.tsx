import type { Metadata } from "next";
import CartsClient from "./CartsClient";

export const metadata: Metadata = { title: "Farmers Market Carts" };

export default function CartsPage() {
  return <CartsClient />;
}
