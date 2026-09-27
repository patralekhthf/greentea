// Country detection via ipapi.co — free, no API key required
// Same pattern as patralekh.com

export type CountryCode = "IN" | "US" | "GB" | "AU";

// Phase 1 is India only: any other cookie value resolves to IN.
// Add "US", "GB", "AU" back here (and in proxy.ts + LocationSwitcher) to go international.
export const SUPPORTED_COUNTRIES: CountryCode[] = ["IN"];
export const DEFAULT_COUNTRY: CountryCode = "IN";

export const COUNTRY_CONFIG: Record<
  CountryCode,
  { name: string; currencyCode: string; currencySymbol: string; directCheckout: boolean }
> = {
  IN: { name: "India",     currencyCode: "INR", currencySymbol: "₹",  directCheckout: true  },
  US: { name: "USA",       currencyCode: "USD", currencySymbol: "$",  directCheckout: false },
  GB: { name: "UK",        currencyCode: "GBP", currencySymbol: "£",  directCheckout: false },
  AU: { name: "Australia", currencyCode: "AUD", currencySymbol: "A$", directCheckout: false },
};

export async function detectCountryFromIp(ip: string): Promise<CountryCode> {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/country/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return DEFAULT_COUNTRY;
    const code = (await res.text()).trim().toUpperCase();
    return SUPPORTED_COUNTRIES.includes(code as CountryCode)
      ? (code as CountryCode)
      : DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}

export function isValidCountry(code: string): code is CountryCode {
  return SUPPORTED_COUNTRIES.includes(code as CountryCode);
}
