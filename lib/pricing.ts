// Channel pricing model: the same maths as the owner's "RasoiVita channel
// pricing" Excel sheet. Used by the admin Pricing page (live recalculation),
// the Excel download (written as real formulas) and Publish to website.
// Client-safe: no DB or server imports.

export type PricingParamKey =
  | "gstRate"
  | "mrpMultiplier"
  | "websiteDiscount"
  | "amazonDiscount"
  | "retailerMargin"
  | "distributorMargin"
  | "tradeSchemes"
  | "amazonFeesPerPack"
  | "websiteFulfilmentPerPack"
  | "marketingRate";

export type PricingConfig = Record<PricingParamKey, number>;

/**
 * Order matters: it is the row order of the config block in the Excel sheet
 * (rows 5 to 14, so the formulas can use $B$5 ... $B$14).
 */
export const PRICING_PARAMS: {
  key: PricingParamKey;
  label: string;
  help: string;
  kind: "percent" | "multiplier" | "inr";
  default: number;
}[] = [
  { key: "gstRate",                  label: "GST on product",                                   kind: "percent",    default: 0.05, help: "5% or 18% depending on your HSN code; confirm with your CA." },
  { key: "mrpMultiplier",            label: "MRP = Making Cost × this",                         kind: "multiplier", default: 1,    help: "Food FMCG norm: making cost about 25-30% of MRP (3.3x to 4x). Rounded up to end in 9." },
  { key: "websiteDiscount",          label: "Website discount off MRP",                         kind: "percent",    default: 0.1,  help: "Keep at 0%; promote with coupons and bundles instead." },
  { key: "amazonDiscount",           label: "Amazon discount off MRP",                          kind: "percent",    default: 0,    help: "Keep equal to website (price parity)." },
  { key: "retailerMargin",           label: "Retailer margin, % of MRP",                        kind: "percent",    default: 0.25, help: "New brand norm 18-25%." },
  { key: "distributorMargin",        label: "Distributor margin, % of retailer price",          kind: "percent",    default: 0.1,  help: "FMCG norm 5-12%." },
  { key: "tradeSchemes",             label: "Trade schemes and returns, % of distributor price", kind: "percent",   default: 0.05, help: "Free goods, damages, expiry returns." },
  { key: "amazonFeesPerPack",        label: "Amazon fees per pack (₹, incl. GST on fees)",      kind: "inr",        default: 60,   help: "Closing fee + weight handling. Referral fee is 0% under ₹1,000." },
  { key: "websiteFulfilmentPerPack", label: "Website delivery + packing cost per pack (₹)",     kind: "inr",        default: 10,   help: "Courier + box, after the delivery fee the customer pays." },
  { key: "marketingRate",            label: "Online marketing / ads, % of selling price",       kind: "percent",    default: 0.1,  help: "Applied to website and Amazon sales." },
];

export const DEFAULT_PRICING_CONFIG: PricingConfig = Object.fromEntries(
  PRICING_PARAMS.map((p) => [p.key, p.default]),
) as PricingConfig;

/** Merge stored values over the defaults, ignoring anything unknown or non-numeric. */
export function normaliseConfig(raw: unknown): PricingConfig {
  const out = { ...DEFAULT_PRICING_CONFIG };
  if (raw && typeof raw === "object") {
    for (const p of PRICING_PARAMS) {
      const v = Number((raw as Record<string, unknown>)[p.key]);
      if (Number.isFinite(v)) out[p.key] = v;
    }
  }
  return out;
}

/** Excel ROUND(x, 0): halves round away from zero (JS Math.round rounds -2.5 to -2). */
export function excelRound(x: number): number {
  const r = Math.round(Math.abs(x) + 1e-9);
  return x < 0 ? -r : r;
}

/** Excel CEILING(x, step) for positive x, tolerant of float noise. */
function excelCeiling(x: number, step: number): number {
  return Math.ceil(Math.round((x / step) * 1e9) / 1e9) * step;
}

export type ChannelPrices = {
  mrp: number;
  website: number;
  amazon: number;
  retailer: number;
  distributor: number;
  profitDistributor: number;
  profitWebsite: number;
  profitAmazon: number;
};

/** One product row of the sheet (columns D to K). Null when no making cost is entered. */
export function computePrices(makingCost: number | null, c: PricingConfig): ChannelPrices | null {
  if (makingCost === null || !Number.isFinite(makingCost) || makingCost <= 0) return null;
  const mrp = excelCeiling(makingCost * c.mrpMultiplier + 1, 10) - 1;                  // D
  const website = excelRound(mrp * (1 - c.websiteDiscount));                           // E
  const amazon = excelRound(mrp * (1 - c.amazonDiscount));                             // F
  const retailer = excelRound(mrp * (1 - c.retailerMargin));                           // G
  const distributor = excelRound(retailer * (1 - c.distributorMargin));                // H
  const net = (price: number) => price / (1 + c.gstRate);
  return {
    mrp,
    website,
    amazon,
    retailer,
    distributor,
    profitDistributor: excelRound(net(distributor) * (1 - c.tradeSchemes) - makingCost),                                 // I
    profitWebsite:     excelRound(net(website) * (1 - c.marketingRate) - c.websiteFulfilmentPerPack - makingCost),      // J
    profitAmazon:      excelRound(net(amazon) * (1 - c.marketingRate) - c.amazonFeesPerPack - makingCost),              // K
  };
}

/** What Publish writes to the store: MRP is the list price, the website price is charged. */
export function liveFromPrices(p: ChannelPrices): { price: number; salePrice: number | null } {
  return { price: p.mrp, salePrice: p.website < p.mrp ? p.website : null };
}
