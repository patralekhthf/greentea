// Delivery charges for website (all-India) orders. Used by the cart, the
// checkout and the orders API, so the customer and the server always agree.
// Farmers Market (WhatsApp) orders are local and don't use this.

export const SHIPPING = {
  firstUnit: 60,       // ₹ for the first pack
  additionalUnit: 5,   // ₹ for every extra pack
} as const;

export const DELIVERY_PROMISE = "Ships in 1–2 working days, delivered in 3–7 days.";

/** Delivery charge for a cart holding `units` packs in total. */
export function shippingFor(units: number): number {
  if (units <= 0) return 0;
  return SHIPPING.firstUnit + SHIPPING.additionalUnit * (units - 1);
}
