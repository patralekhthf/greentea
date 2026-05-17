import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LocationCheckBanner from "@/components/local/LocationCheckBanner";
import { isValidCountry } from "@/lib/ipapi";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const rawCountry = cookieStore.get("gt_country")?.value ?? "IN";
  const country = isValidCountry(rawCountry) ? rawCountry : "IN";

  return (
    <>
      <LocationCheckBanner country={country} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
