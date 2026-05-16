import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kanta Greens — Premium Organic Teas",
    template: "%s | Kanta Greens",
  },
  description:
    "Premium organic green and herbal teas crafted for your daily wellness ritual. Sourced from India's finest gardens.",
  keywords: ["organic tea", "herbal tea", "green tea", "wellness tea", "ayurvedic tea"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/icon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    siteName: "Kanta Greens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
