import type { Metadata } from "next";
import WebsiteOrdersClient from "./WebsiteOrdersClient";

export const metadata: Metadata = { title: "Website Orders" };

export default function WebsiteOrdersPage() {
  return <WebsiteOrdersClient />;
}
