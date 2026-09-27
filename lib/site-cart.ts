"use client";

// Website (all-India) cart. Lives in localStorage only and is priced again on
// the server at checkout. Deliberately separate from the Farmers Market
// WhatsApp cart (lib/farmers-market-cart.ts) so local and shipped orders never mix.

import { useSyncExternalStore } from "react";
import { MAX_QTY } from "./site-cart-limits";

export type SiteCartItem = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  size: string;
  quantity: number;
  price: number;           // per pack, INR (display only; server re-prices)
  imageUrl: string | null;
};

export { MAX_QTY };

const STORAGE_KEY  = "gt_site_cart_v1";
const CHANGE_EVENT = "gt-site-cart-change";

function read(): SiteCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SiteCartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: SiteCartItem[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage full or blocked */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const same = (a: Pick<SiteCartItem, "productId" | "size">, b: Pick<SiteCartItem, "productId" | "size">) =>
  a.productId === b.productId && a.size === b.size;

export function addToSiteCart(item: SiteCartItem) {
  const cart = read();
  const existing = cart.find((i) => same(i, item));
  write(
    existing
      ? cart.map((i) => (same(i, item) ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + item.quantity) } : i))
      : [...cart, { ...item, quantity: Math.min(MAX_QTY, item.quantity) }]
  );
}

export function setSiteCartQuantity(productId: string, size: string, qty: number) {
  const cart = read();
  write(
    qty <= 0
      ? cart.filter((i) => !same(i, { productId, size }))
      : cart.map((i) => (same(i, { productId, size }) ? { ...i, quantity: Math.min(MAX_QTY, qty) } : i))
  );
}

export function removeFromSiteCart(productId: string, size: string) {
  write(read().filter((i) => !same(i, { productId, size })));
}

export function clearSiteCart() {
  write([]);
}

// Snapshot cache: useSyncExternalStore needs the same array back while storage is unchanged.
let cachedRaw: string | null = null;
let cachedCart: SiteCartItem[] = [];

function snapshot(): SiteCartItem[] {
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(STORAGE_KEY); } catch { /* blocked storage */ }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try { cachedCart = raw ? (JSON.parse(raw) as SiteCartItem[]) : []; } catch { cachedCart = []; }
  }
  return cachedCart;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Re-renders on changes in this tab or another. `ready` is false during server render / hydration. */
export function useSiteCart(): { cart: SiteCartItem[]; ready: boolean } {
  const cart = useSyncExternalStore<SiteCartItem[] | null>(subscribe, snapshot, () => null);
  return { cart: cart ?? [], ready: cart !== null };
}

export const siteCartUnits = (cart: SiteCartItem[]) => cart.reduce((s, i) => s + i.quantity, 0);
export const siteCartSubtotal = (cart: SiteCartItem[]) => cart.reduce((s, i) => s + i.price * i.quantity, 0);
