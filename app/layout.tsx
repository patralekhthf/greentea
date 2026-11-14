import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RasoiVita by Kanta Greens — Ready-to-Cook Masala Premixes",
    template: "%s | RasoiVita",
  },
  description:
    "RasoiVita ready-to-cook masala premixes, a delicacy of Kanta Greens. Add water, heat, and your sambhar, chhole or paneer gravy is ready in minutes.",
  keywords: ["masala premix", "ready to cook masala", "sambhar premix", "chhole masala", "paneer tikka gravy", "instant gravy mix"],
  openGraph: {
    siteName: "RasoiVita by Kanta Greens",
    type: "website",
    locale: "en_IN",
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
