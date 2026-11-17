"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PRICING_PARAMS, computePrices, liveFromPrices, type PricingConfig, type PricingParamKey } from "@/lib/pricing";
import type { PricingData, PricingRow, StockState } from "@/lib/pricing-server";

type EditRow = PricingRow & { costInput: string; stock: StockState };
type ImportPreview = {
  config: PricingConfig;
  configKeysFound: PricingParamKey[];
  rows: { name: string; sku: string | null; makingCost: number | null; productId: string | null }[];
  warnings: string[];
};
type PublishChange = {
  productId: string;
  name: string;
  from: { price: number | null; salePrice: number | null };
  to: { price: number; salePrice: number | null };
};

const inr = (n: number | null | undefined) =>
  n == null ? "—" : `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN")}`;
const toRows = (d: PricingData): EditRow[] =>
  d.rows.map((r) => ({ ...r, costInput: r.makingCost?.toString() ?? "", stock: r.live.stock }));
const costOf = (r: EditRow) => {
  const n = Number(r.costInput);
  return r.costInput.trim() !== "" && Number.isFinite(n) && n > 0 ? n : null;
};
const fmtParam = (kind: string, v: number) => (kind === "percent" ? `${+(v * 100).toFixed(2)}%` : kind === "inr" ? inr(v) : `${v}×`);

export default function PricingClient({ initial }: { initial: PricingData }) {
  const [saved, setSaved] = useState(initial);
  const [config, setConfig] = useState<PricingConfig>(initial.config);
  const [configInput, setConfigInput] = useState<Record<string, string>>(() => inputsFor(initial.config));
  const [rows, setRows] = useState<EditRow[]>(() => toRows(initial));
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [publish, setPublish] = useState<PublishChange[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(() => {
    if (PRICING_PARAMS.some((p) => config[p.key] !== saved.config[p.key])) return true;
    return rows.some((r, i) => costOf(r) !== saved.rows[i]?.makingCost || r.stock !== saved.rows[i]?.live.stock);
  }, [config, rows, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function inputsFor(c: PricingConfig) {
    return Object.fromEntries(
      PRICING_PARAMS.map((p) => [p.key, p.kind === "percent" ? String(+(c[p.key] * 100).toFixed(4)) : String(c[p.key])]),
    );
  }

  function setParam(key: PricingParamKey, kind: string, text: string) {
    setConfigInput((s) => ({ ...s, [key]: text }));
    const n = Number(text);
    if (text.trim() !== "" && Number.isFinite(n) && n >= 0) setConfig((c) => ({ ...c, [key]: kind === "percent" ? n / 100 : n }));
  }

  function resetFrom(d: PricingData) {
    setSaved(d);
    setConfig(d.config);
    setConfigInput(inputsFor(d.config));
    setRows(toRows(d));
  }

  async function save() {
    setBusy("save");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          rows: rows.map((r) => ({ productId: r.productId, makingCost: costOf(r), stock: r.stock })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      resetFrom(data);
      setMessage({ tone: "ok", text: "Saved. Stock changes are live. Prices on the website change only when you publish." });
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(null);
    }
  }

  async function upload(file: File) {
    setBusy("upload");
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/pricing/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPreview(data);
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function applyPreview(p: ImportPreview) {
    setConfig(p.config);
    setConfigInput(inputsFor(p.config));
    const byId = new Map(p.rows.filter((r) => r.productId).map((r) => [r.productId!, r.makingCost]));
    setRows((rs) => rs.map((r) => (byId.has(r.productId) ? { ...r, costInput: byId.get(r.productId)?.toString() ?? "" } : r)));
    setPreview(null);
    setMessage({ tone: "ok", text: "Sheet loaded into the page. Review it, then press Save." });
  }

  async function openPublish() {
    setBusy("publish");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/pricing/publish");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load changes");
      setPublish(data.changes);
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Could not load changes" });
    } finally {
      setBusy(null);
    }
  }

  async function confirmPublish() {
    setBusy("publish");
    try {
      const res = await fetch("/api/admin/pricing/publish", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      const fresh = await fetch("/api/admin/pricing").then((r) => r.json());
      resetFrom(fresh);
      setPublish(null);
      setMessage({ tone: "ok", text: `Published ${data.changes.length} price change${data.changes.length === 1 ? "" : "s"} to the website.` });
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Publish failed" });
    } finally {
      setBusy(null);
    }
  }

  const computed = rows.map((r) => computePrices(costOf(r), config));
  const losing = computed.filter((p) => p && (p.profitWebsite < 0 || p.profitAmazon < 0 || p.profitDistributor < 0)).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
          <p className="text-sm text-gray-500 mt-0.5 max-w-2xl">
            Your source of truth for every channel. Enter the making cost and config; prices work out as in your Excel sheet.
            Website prices change only when you publish.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/pricing/export"
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 ${dirty ? "opacity-50 pointer-events-none" : ""}`}
            title={dirty ? "Save first: the download uses saved values" : "Download as Excel with formulas"}
          >
            ⬇ Download Excel
          </a>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {busy === "upload" ? "Reading…" : "⬆ Upload Excel"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <button
            onClick={save}
            disabled={!dirty || busy !== null}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-brand-green text-white hover:bg-brand-mid disabled:opacity-40"
          >
            {busy === "save" ? "Saving…" : "Save"}
          </button>
          <button
            onClick={openPublish}
            disabled={dirty || busy !== null}
            title={dirty ? "Save first" : "Push MRP and website price to the store"}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
          >
            Publish to website
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm ${message.tone === "ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}
      {dirty && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-yellow-50 text-yellow-900 border border-yellow-200">
          You have unsaved changes.
        </div>
      )}
      {losing > 0 && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-800 border border-red-200">
          {losing} product{losing === 1 ? "" : "s"} lose money on at least one channel with this config (red profit figures below).
        </div>
      )}

      {/* Config */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Config</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {PRICING_PARAMS.map((p) => (
            <label key={p.key} className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">{p.label}</span>
              <div className="relative">
                {p.kind === "inr" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>}
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={configInput[p.key] ?? ""}
                  onChange={(e) => setParam(p.key, p.kind, e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                    p.kind === "inr" ? "pl-7" : ""
                  } ${config[p.key] !== saved.config[p.key] ? "border-yellow-400 bg-yellow-50" : "border-gray-300"}`}
                />
                {p.kind !== "inr" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{p.kind === "percent" ? "%" : "×"}</span>
                )}
              </div>
              <span className="block text-[11px] text-gray-500 mt-1 leading-snug">{p.help}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 text-left">
                <th className="px-4 py-3 sticky left-0 bg-gray-50 z-10">Product</th>
                <th className="px-3 py-3">Pack</th>
                <th className="px-3 py-3 bg-yellow-50">Making cost</th>
                <th className="px-3 py-3 text-right">MRP</th>
                <th className="px-3 py-3 text-right">Website</th>
                <th className="px-3 py-3 text-right">Amazon</th>
                <th className="px-3 py-3 text-right">Retailer buys</th>
                <th className="px-3 py-3 text-right">Distributor buys</th>
                <th className="px-3 py-3 text-right border-l border-gray-200">Profit: distributor</th>
                <th className="px-3 py-3 text-right">Profit: website</th>
                <th className="px-3 py-3 text-right">Profit: Amazon</th>
                <th className="px-3 py-3 border-l border-gray-200">Live on website</th>
                <th className="px-3 py-3">Stock (live on save)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const p = computed[i];
                const live = p ? liveFromPrices(p) : null;
                const differs = live && (live.price !== r.live.price || live.salePrice !== r.live.salePrice);
                const savedCost = saved.rows[i]?.makingCost ?? null;
                return (
                  <tr key={r.productId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="text-[11px] text-gray-400">
                        {r.sku ?? "no SKU"}
                        {!r.published && " · not published"}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{r.pack}</td>
                    <td className="px-3 py-2.5 bg-yellow-50/60">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          step="any"
                          min={0}
                          value={r.costInput}
                          placeholder="—"
                          onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, costInput: e.target.value } : x)))}
                          className={`w-full rounded-lg border pl-6 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                            costOf(r) !== savedCost ? "border-yellow-400 bg-yellow-100" : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">{inr(p?.mrp)}</td>
                    <td className="px-3 py-2.5 text-right">{inr(p?.website)}</td>
                    <td className="px-3 py-2.5 text-right">{inr(p?.amazon)}</td>
                    <td className="px-3 py-2.5 text-right">{inr(p?.retailer)}</td>
                    <td className="px-3 py-2.5 text-right">{inr(p?.distributor)}</td>
                    {[p?.profitDistributor, p?.profitWebsite, p?.profitAmazon].map((v, k) => (
                      <td
                        key={k}
                        className={`px-3 py-2.5 text-right font-semibold ${k === 0 ? "border-l border-gray-200" : ""} ${
                          v == null ? "text-gray-300" : v < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {inr(v)}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 border-l border-gray-200">
                      <span className="text-gray-900">{inr(r.live.salePrice ?? r.live.price)}</span>
                      {r.live.salePrice != null && <span className="ml-1.5 text-xs text-gray-400 line-through">{inr(r.live.price)}</span>}
                      {differs && (
                        <span className="ml-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          publish → {inr(live!.salePrice ?? live!.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={r.stock}
                        onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, stock: e.target.value as StockState } : x)))}
                        className={`rounded-lg border px-2 py-1.5 text-sm ${
                          r.stock !== saved.rows[i]?.live.stock ? "border-yellow-400 bg-yellow-50" : "border-gray-300"
                        } ${r.stock === "OUT_OF_STOCK" ? "text-red-700" : "text-green-700"}`}
                      >
                        <option value="ACTIVE">In stock</option>
                        <option value="OUT_OF_STOCK">Out of stock</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-xs text-gray-500 border-t border-gray-100">
          Profit = money you keep after GST and channel costs, minus making cost. On Publish, the MRP becomes the list price (shown struck
          through) and the website price is what customers pay. Products without a making cost keep their current website price.
        </p>
      </section>

      {/* Upload preview */}
      {preview && (
        <Modal title="Review uploaded sheet" onClose={() => setPreview(null)}>
          {preview.configKeysFound.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Config</h3>
              <ul className="text-sm space-y-1">
                {PRICING_PARAMS.filter((p) => preview.configKeysFound.includes(p.key)).map((p) => {
                  const changed = preview.config[p.key] !== config[p.key];
                  return (
                    <li key={p.key} className={changed ? "text-gray-900" : "text-gray-400"}>
                      {p.label}: {changed ? <><s>{fmtParam(p.kind, config[p.key])}</s> → <b>{fmtParam(p.kind, preview.config[p.key])}</b></> : "no change"}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Making cost</h3>
          <table className="w-full text-sm mb-4">
            <tbody>
              {preview.rows.map((pr) => {
                const cur = rows.find((r) => r.productId === pr.productId);
                const curCost = cur ? costOf(cur) : null;
                return (
                  <tr key={pr.name} className="border-b border-gray-100">
                    <td className="py-1.5">{pr.name}</td>
                    <td className="py-1.5 text-right">
                      {!pr.productId ? (
                        <span className="text-red-600">no match, skipped</span>
                      ) : pr.makingCost === curCost ? (
                        <span className="text-gray-400">{inr(curCost)} (no change)</span>
                      ) : (
                        <span><s className="text-gray-400">{inr(curCost)}</s> → <b>{inr(pr.makingCost)}</b></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {preview.warnings.length > 0 && (
            <ul className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
              {preview.warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setPreview(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
            <button onClick={() => applyPreview(preview)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-green text-white">
              Load into page
            </button>
          </div>
        </Modal>
      )}

      {/* Publish confirmation */}
      {publish && (
        <Modal title="Publish prices to the website" onClose={() => setPublish(null)}>
          {publish.length === 0 ? (
            <p className="text-sm text-gray-600 mb-4">The website already matches your saved pricing. Nothing to publish.</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">These prices go live on kantagreens.com straight away:</p>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-xs text-gray-500 text-left border-b border-gray-200">
                    <th className="py-1.5">Product</th>
                    <th className="py-1.5 text-right">Now (pays / MRP)</th>
                    <th className="py-1.5 text-right">After publish</th>
                  </tr>
                </thead>
                <tbody>
                  {publish.map((c) => {
                    const row = rows.find((r) => r.productId === c.productId);
                    const p = row ? computePrices(costOf(row), config) : null;
                    return (
                      <tr key={c.productId} className="border-b border-gray-100">
                        <td className="py-1.5">
                          {c.name}
                          {p && p.profitWebsite < 0 && <span className="ml-2 text-[11px] text-red-600 font-semibold">loses {inr(-p.profitWebsite)} per website sale</span>}
                        </td>
                        <td className="py-1.5 text-right text-gray-500">{inr(c.from.salePrice ?? c.from.price)} / {inr(c.from.price)}</td>
                        <td className="py-1.5 text-right font-semibold">{inr(c.to.salePrice ?? c.to.price)} / {inr(c.to.price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setPublish(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
            {publish.length > 0 && (
              <button
                onClick={confirmPublish}
                disabled={busy !== null}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white disabled:opacity-50"
              >
                {busy === "publish" ? "Publishing…" : `Publish ${publish.length} change${publish.length === 1 ? "" : "s"}`}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
