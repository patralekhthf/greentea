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

const STORAGE_KEY = "gt_fm_cart_v1";
const CHANGE_EVENT = "gt-fm-cart-change";

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
}

function key(item: Pick<CartItem, "productId" | "size">) {
  return `${item.productId}::${item.size}`;
}

/** Add to cart, merging by (productId + size). Returns the updated cart. */
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
  write([]);
}

/** React hook — re-renders when the cart changes (in this tab or another). */
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
