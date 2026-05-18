import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = { title: "Farmers Market Orders" };

export default function OrdersPage() {
  return <OrdersClient />;
}
