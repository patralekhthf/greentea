"use client";

import { useEffect, useState } from "react";

export type CartItem = {
  productId: string;
  sku: string;
  name: string;
  size: string;
  quantity: number;
  price: number;       // per unit, INR
  imageUrl: string | null;
};

const STORAGE_KEY   = "gt_fm_cart_v1";
const CART_ID_KEY   = "gt_fm_cart_id_v1";
const CHANGE_EVENT  = "gt-fm-cart-change";

// ─── Local state ───────────────────────────────────────────────────

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  scheduleSync(items);
}

function key(item: Pick<CartItem, "productId" | "size">) {
  return `${item.productId}::${item.size}`;
}

export function getCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_ID_KEY);
}

function setCartId(id: string) {
  window.localStorage.setItem(CART_ID_KEY, id);
}

function clearCartId() {
  window.localStorage.removeItem(CART_ID_KEY);
}

// ─── Server sync ───────────────────────────────────────────────────

let createPromise: Promise<string | null> | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

/** Ensures a server-side cart row exists; returns its id (or null on failure). */
async function ensureCartId(items: CartItem[]): Promise<string | null> {
  const existing = getCartId();
  if (existing) return existing;
  if (createPromise) return createPromise;

  createPromise = fetch("/api/farmers-market/cart", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ items }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { cartId?: string } | null) => {
      if (d?.cartId) {
        setCartId(d.cartId);
        return d.cartId;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => { createPromise = null; });

  return createPromise;
}

/** Debounced sync of the current cart to the server. */
function scheduleSync(items: CartItem[]) {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (items.length === 0) return; // don't create empty carts
    try {
      const id = await ensureCartId(items);
      if (!id) return;
      const res = await fetch(`/api/farmers-market/cart/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ items }),
      });
      // If server says 404 (cart deleted), forget the id so a new one is created next add
      if (res.status === 404) clearCartId();
    } catch { /* offline / network issue — local cart still works */ }
  }, 350);
}

// ─── Mutations ─────────────────────────────────────────────────────

export function addToCart(item: CartItem): CartItem[] {
  const cart = read();
  const existing = cart.find((i) => key(i) === key(item));
  let next: CartItem[];
  if (existing) {
    next = cart.map((i) =>
      key(i) === key(item) ? { ...i, quantity: i.quantity + item.quantity } : i
    );
  } else {
    next = [...cart, item];
  }
  write(next);
  return next;
}

export function updateQuantity(productId: string, size: string, qty: number) {
  const cart = read();
  let next: CartItem[];
  if (qty <= 0) {
    next = cart.filter((i) => !(i.productId === productId && i.size === size));
  } else {
    next = cart.map((i) =>
      i.productId === productId && i.size === size ? { ...i, quantity: qty } : i
    );
  }
  write(next);
}

export function removeItem(productId: string, size: string) {
  const cart = read();
  write(cart.filter((i) => !(i.productId === productId && i.size === size)));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  clearCartId();
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── React hook ────────────────────────────────────────────────────

export function useCart(): CartItem[] {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(read());
    const onChange = () => setCart(read());
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return cart;
}

export function cartItemCount(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
