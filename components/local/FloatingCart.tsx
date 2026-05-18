"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useCart,
  cartItemCount,
  cartSubtotal,
  updateQuantity,
  removeItem,
} from "@/lib/farmers-market-cart";

function formatINR(n: number) {
  return `₹${n.toFixed(0)}`;
}

const POS_KEY        = "gt_fm_cart_pos_v1";        // { x, y } in CSS pixels from top-left
const COLLAPSED_KEY  = "gt_fm_cart_collapsed_v1";  // "1" when collapsed
const DEFAULT_WIDTH  = 320;
const COLLAPSED_W    = 240;
const HEADER_OFFSET  = 80; // keep clear of the top header

type Pos = { x: number; y: number };

/** Compute a default desktop position: top-right, just below the header. */
function defaultPos(): Pos {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return { x: window.innerWidth - DEFAULT_WIDTH - 24, y: 96 };
}

function clampPos(p: Pos, w: number, h: number): Pos {
  if (typeof window === "undefined") return p;
  const maxX = window.innerWidth  - w - 8;
  const maxY = window.innerHeight - 60; // keep header always visible
  return {
    x: Math.max(8, Math.min(p.x, maxX)),
    y: Math.max(HEADER_OFFSET - 16, Math.min(p.y, maxY)),
  };
}

/**
 * Persistent cart UI for the Farmers Market.
 * - Desktop (lg+): draggable + collapsible floating card, position remembered in localStorage
 * - Mobile (< lg): bottom bar → tap to expand into a slide-up sheet
 */
export default function FloatingCart() {
  const cart  = useCart();
  const count = cartItemCount(cart);
  const total = cartSubtotal(cart);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [pos, setPos]               = useState<Pos>({ x: 0, y: 0 });
  const [mounted, setMounted]       = useState(false);
  const dragRef                     = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);

  // Initialise from localStorage once mounted
  useEffect(() => {
    let p: Pos | null = null;
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) p = JSON.parse(raw);
    } catch { /* ignore */ }
    const initial = p ?? defaultPos();
    setPos(clampPos(initial, DEFAULT_WIDTH, 400));
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    setMounted(true);

    // Re-clamp on resize so the panel never ends up off-screen
    const onResize = () => setPos((cur) => clampPos(cur, DEFAULT_WIDTH, 400));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Persist collapse state
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  // Close mobile sheet if cart empties out
  useEffect(() => {
    if (count === 0) setMobileOpen(false);
  }, [count]);

  // ─── Drag handlers ─────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on actual buttons inside the header
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX:  pos.x,     origY:  pos.y,
      moved:  false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    const w = collapsed ? COLLAPSED_W : DEFAULT_WIDTH;
    setPos(clampPos({ x: d.origX + dx, y: d.origY + dy }, w, 400));
  }, [collapsed]);

  const onPointerUp = useCallback(() => {
    if (dragRef.current?.moved) {
      try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
    }
    dragRef.current = null;
  }, [pos]);

  if (count === 0) return null;

  // ─── Shared body (item list + footer) ─────────────────────────
  const itemList = (
    <div className="divide-y divide-brand-border">
      {cart.map((item) => (
        <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 px-4 py-3">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-brand-mint overflow-hidden relative">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">🍵</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-dark truncate leading-tight">{item.name}</p>
            <p className="text-[10px] font-mono text-brand-sage mt-0.5">{item.sku}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">
              {item.size} · {formatINR(item.price)} ea
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                aria-label="Decrease"
                className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green text-sm leading-none"
              >−</button>
              <span className="w-6 text-center text-xs font-bold text-brand-dark">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                aria-label="Increase"
                className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-green hover:border-brand-green text-sm leading-none"
              >+</button>
            </div>
            <p className="text-xs font-bold text-brand-green">{formatINR(item.price * item.quantity)}</p>
            <button
              onClick={() => removeItem(item.productId, item.size)}
              className="text-[10px] text-red-400 hover:text-red-600"
            >Remove</button>
          </div>
        </div>
      ))}
    </div>
  );

  const footer = (
    <div className="border-t border-brand-border bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-mint/50">
        <span className="text-xs font-medium text-brand-muted">Subtotal · {count} {count === 1 ? "item" : "items"}</span>
        <span className="text-base font-bold text-brand-green">{formatINR(total)}</span>
      </div>
      <Link
        href="/farmers-market/order"
        onClick={() => setMobileOpen(false)}
        className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-bold py-3.5 hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/>
        </svg>
        Review &amp; Send via WhatsApp
      </Link>
    </div>
  );

  // ─── Desktop floating card ────────────────────────────────────
  // Build the panel as a separately positioned element so it can drag
  const desktopWidth = collapsed ? COLLAPSED_W : DEFAULT_WIDTH;
  const desktopStyle: React.CSSProperties = mounted
    ? {
        left:   `${pos.x}px`,
        top:    `${pos.y}px`,
        width:  `${desktopWidth}px`,
        bottom: collapsed ? "auto" : "16px",
        maxHeight: collapsed ? "auto" : "calc(100vh - 96px - 16px)",
      }
    : { right: "16px", top: "96px", width: `${DEFAULT_WIDTH}px`, bottom: "16px" };

  return (
    <>
      {/* ─── Desktop (lg+) ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed bg-white rounded-2xl border border-brand-border shadow-xl shadow-black/10 z-30 flex-col overflow-hidden"
        style={desktopStyle}
        aria-label="WhatsApp Cart"
      >
        <header
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="px-3 py-2.5 border-b border-brand-border bg-brand-green text-white flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <span className="text-[10px] uppercase tracking-wider text-white/60 select-none">⋮⋮ drag</span>
          <div className="flex items-center gap-1.5 flex-1 justify-center pointer-events-none">
            <span className="text-base">🛒</span>
            <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
              WhatsApp Cart
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
              {count}
            </span>
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand cart" : "Collapse cart"}
            className="text-white/80 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-sm leading-none"
          >
            {collapsed ? "▾" : "▴"}
          </button>
        </header>

        {/* Collapsed mini-summary */}
        {collapsed ? (
          <Link
            href="/farmers-market/order"
            className="flex items-center justify-between px-4 py-3 hover:bg-brand-mint/50 transition-colors"
          >
            <span className="text-xs text-brand-muted">{count} {count === 1 ? "item" : "items"}</span>
            <span className="text-sm font-bold text-brand-green">{formatINR(total)}</span>
            <span className="text-xs font-semibold text-brand-green">Checkout →</span>
          </Link>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">{itemList}</div>
            {footer}
          </>
        )}
      </aside>

      {/* ─── Mobile bottom bar ────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 right-4 z-30 bg-brand-green text-white rounded-2xl shadow-xl shadow-brand-green/30 px-4 py-3 flex items-center justify-between gap-3 hover:bg-brand-mid transition-colors"
        aria-label="Open WhatsApp Cart"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="text-base">🛒</span> WhatsApp Cart
          <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">{count}</span>
        </span>
        <span className="flex items-center gap-2 text-sm font-bold">
          {formatINR(total)} <span className="opacity-80">▲</span>
        </span>
      </button>

      {/* ─── Mobile slide-up sheet ────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-4 py-3 border-b border-brand-border bg-brand-green text-white flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🛒</span>
                <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  WhatsApp Cart
                </h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="text-white/80 hover:text-white text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10"
              >×</button>
            </header>
            <div className="flex-1 overflow-y-auto">{itemList}</div>
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
