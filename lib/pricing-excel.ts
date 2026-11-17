import "server-only";
import ExcelJS from "exceljs";
import { PRICING_PARAMS, computePrices, normaliseConfig, type PricingConfig, type PricingParamKey } from "@/lib/pricing";
import type { PricingRow } from "@/lib/pricing-server";

// Layout mirrors the owner's original sheet so formulas read the same:
// config values in B5:B14 (PRICING_PARAMS order), table header on row 17.
const CONFIG_FIRST_ROW = 5;
const HEADER_ROW = 17;
const COLS = ["Product", "Pack", "Making Cost (₹)", "MRP", "Website price", "Amazon price", "Retailer buys at", "Distributor buys at",
  "Your profit: distributor sale", "Your profit: website sale", "Your profit: Amazon sale", "SKU (do not edit)"];

const ref = (key: PricingParamKey) => `$B$${CONFIG_FIRST_ROW + PRICING_PARAMS.findIndex((p) => p.key === key)}`;
const INR = '"₹"#,##0';
const INR_PROFIT = '"₹"#,##0;[Red]-"₹"#,##0';

export async function buildPricingWorkbook(config: PricingConfig, rows: PricingRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Kanta Greens portal";
  wb.calcProperties.fullCalcOnLoad = true;
  const ws = wb.addWorksheet("Pricing");

  ws.getCell("A1").value = "RasoiVita channel pricing";
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.getCell("A2").value = "Type only the Making Cost (yellow). Change any blue value in the config to override the default. Upload this file back on the portal: Admin > Pricing.";
  ws.getCell("A2").font = { italic: true, color: { argb: "FF6B7B72" } };

  ["Config", "Value", "What it means"].forEach((h, i) => {
    const c = ws.getCell(4, i + 1);
    c.value = h;
    c.font = { bold: true };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD8F0E5" } };
  });
  PRICING_PARAMS.forEach((p, i) => {
    const r = CONFIG_FIRST_ROW + i;
    ws.getCell(r, 1).value = p.label;
    const v = ws.getCell(r, 2);
    v.value = config[p.key];
    v.font = { color: { argb: "FF0000FF" } };
    v.numFmt = p.kind === "percent" ? "0%" : p.kind === "inr" ? INR : "0.00";
    ws.getCell(r, 3).value = p.help;
    ws.getCell(r, 3).font = { color: { argb: "FF6B7B72" } };
  });

  ws.getCell(HEADER_ROW - 1, 1).value = "Prices per pack (₹, incl. GST)";
  ws.getCell(HEADER_ROW - 1, 1).font = { bold: true };
  COLS.forEach((h, i) => {
    const c = ws.getCell(HEADER_ROW, i + 1);
    c.value = h;
    c.font = { bold: true };
    c.alignment = { wrapText: true, vertical: "middle" };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD8F0E5" } };
  });
  ws.getRow(HEADER_ROW).height = 32;

  const g = ref("gstRate"), m = ref("mrpMultiplier"), wd = ref("websiteDiscount"), ad = ref("amazonDiscount");
  const rm = ref("retailerMargin"), dm = ref("distributorMargin"), ts = ref("tradeSchemes");
  const af = ref("amazonFeesPerPack"), wf = ref("websiteFulfilmentPerPack"), mk = ref("marketingRate");

  rows.forEach((row, i) => {
    const r = HEADER_ROW + 1 + i;
    const p = computePrices(row.makingCost, config);
    const f = (formula: string, result: number | undefined) => ({ formula, result: result ?? "" });
    ws.getCell(r, 1).value = row.name;
    ws.getCell(r, 2).value = row.pack;
    const cost = ws.getCell(r, 3);
    cost.value = row.makingCost ?? null;
    cost.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
    cost.numFmt = INR;
    const blank = `C${r}=""`;
    ws.getCell(r, 4).value = f(`IF(${blank},"",CEILING(C${r}*${m}+1,10)-1)`, p?.mrp);
    ws.getCell(r, 5).value = f(`IF(D${r}="","",ROUND(D${r}*(1-${wd}),0))`, p?.website);
    ws.getCell(r, 6).value = f(`IF(D${r}="","",ROUND(D${r}*(1-${ad}),0))`, p?.amazon);
    ws.getCell(r, 7).value = f(`IF(D${r}="","",ROUND(D${r}*(1-${rm}),0))`, p?.retailer);
    ws.getCell(r, 8).value = f(`IF(D${r}="","",ROUND(G${r}*(1-${dm}),0))`, p?.distributor);
    ws.getCell(r, 9).value = f(`IF(D${r}="","",ROUND(H${r}/(1+${g})*(1-${ts})-C${r},0))`, p?.profitDistributor);
    ws.getCell(r, 10).value = f(`IF(D${r}="","",ROUND(E${r}/(1+${g})*(1-${mk})-${wf}-C${r},0))`, p?.profitWebsite);
    ws.getCell(r, 11).value = f(`IF(D${r}="","",ROUND(F${r}/(1+${g})*(1-${mk})-${af}-C${r},0))`, p?.profitAmazon);
    for (let col = 4; col <= 8; col++) ws.getCell(r, col).numFmt = INR;
    for (let col = 9; col <= 11; col++) ws.getCell(r, col).numFmt = INR_PROFIT;
    ws.getCell(r, 12).value = row.sku ?? "";
    ws.getCell(r, 12).font = { color: { argb: "FF9AA5A0" } };
  });

  const noteRow = HEADER_ROW + rows.length + 2;
  ws.getCell(noteRow, 1).value =
    "Profit = money you keep after GST and channel costs, minus Making Cost. Website price is what customers pay on kantagreens.com once published; MRP is shown struck through.";
  ws.getCell(noteRow, 1).font = { italic: true, color: { argb: "FF6B7B72" } };

  [44, 12, 16, 10, 12, 12, 14, 16, 16, 16, 16, 18].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.getColumn(3).alignment = { horizontal: "right" };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

// ─── Upload ──────────────────────────────────────────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "Chhole Masala (NOG)" and "Chhole Masala Premix (No Onion No Garlic)" both become one key. */
export function productKey(name: string): string {
  return norm(name.toLowerCase().replace(/\(\s*nog\s*\)/g, " no onion no garlic ").replace(/\bpremix\b/g, ""));
}

function cellValue(v: ExcelJS.CellValue): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" || typeof v === "string") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("result" in v) return cellValue((v as { result?: ExcelJS.CellValue }).result ?? null);
    if ("richText" in v) return (v as ExcelJS.CellRichTextValue).richText.map((t) => t.text).join("");
    if ("text" in v) return String((v as { text: unknown }).text);
  }
  return null;
}

const toNumber = (v: string | number | null): number | null => {
  if (v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[₹,%\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export type ParsedRow = { name: string; sku: string | null; makingCost: number | null; productId: string | null };
export type ParsedSheet = { config: PricingConfig; configKeysFound: PricingParamKey[]; rows: ParsedRow[]; warnings: string[] };

export async function parsePricingWorkbook(
  buffer: ArrayBuffer,
  current: PricingConfig,
  products: { productId: string; sku: string | null; name: string }[],
): Promise<ParsedSheet> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet("Pricing") ?? wb.worksheets[0];
  if (!ws) throw new Error("The file has no worksheet.");

  const warnings: string[] = [];
  const config = { ...current };
  const configKeysFound: PricingParamKey[] = [];
  const labels = new Map(PRICING_PARAMS.map((p) => [norm(p.label), p]));

  let headerRow = 0;
  for (let r = 1; r <= Math.min(ws.rowCount, 80); r++) {
    const a = cellValue(ws.getCell(r, 1).value);
    if (typeof a !== "string") continue;
    if (norm(a) === "product") { headerRow = r; break; }
    const param = labels.get(norm(a));
    if (!param) continue;
    let v = toNumber(cellValue(ws.getCell(r, 2).value));
    if (v === null) { warnings.push(`"${param.label}" has no number; kept ${current[param.key]}.`); continue; }
    if (param.kind === "percent" && v > 1) v = v / 100; // typed 5 instead of 5%
    config[param.key] = v;
    configKeysFound.push(param.key);
  }
  if (!headerRow) throw new Error('Could not find the product table (a row starting with "Product").');

  const header: Record<string, number> = {};
  ws.getRow(headerRow).eachCell((c, col) => {
    const h = norm(String(cellValue(c.value) ?? ""));
    if (h.startsWith("makingcost")) header.cost = col;
    else if (h.startsWith("sku")) header.sku = col;
  });
  if (!header.cost) throw new Error('Could not find the "Making Cost" column.');

  const bySku = new Map(products.filter((p) => p.sku).map((p) => [p.sku!.toLowerCase(), p.productId]));
  const byName = new Map(products.map((p) => [productKey(p.name), p.productId]));
  const rows: ParsedRow[] = [];
  for (let r = headerRow + 1; r <= ws.rowCount; r++) {
    const name = cellValue(ws.getCell(r, 1).value);
    if (name === null || String(name).trim() === "") break;
    const sku = header.sku ? (cellValue(ws.getCell(r, header.sku).value) as string | null) : null;
    const cost = toNumber(cellValue(ws.getCell(r, header.cost).value));
    const productId = (sku && bySku.get(String(sku).toLowerCase())) || byName.get(productKey(String(name))) || null;
    if (!productId) warnings.push(`"${name}" does not match any product on the portal; skipped.`);
    rows.push({ name: String(name).trim(), sku: sku ? String(sku) : null, makingCost: cost && cost > 0 ? cost : null, productId });
  }
  return { config: normaliseConfig(config), configKeysFound, rows, warnings };
}
