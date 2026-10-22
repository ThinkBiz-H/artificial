import type { CartLineItem } from "@/types";

/*
 * Cart-line identity and quantity maths, shared by the guest cart store and
 * the optimistic updates of the server cart, so both behave identically.
 */

/**
 * Same line? Server lines carry a stable `lineId`; guest lines are identified
 * by product + variant + colour + size (two colours of one simple product are
 * two separate lines).
 */
export function isSameLine(a: CartLineItem, b: CartLineItem) {
  if (a.lineId && b.lineId) return a.lineId === b.lineId;
  return (
    a.product._id === b.product._id &&
    String(a.variant?._id || "") === String(b.variant?._id || "") &&
    (a.color || undefined) === (b.color || undefined) &&
    (a.size || undefined) === (b.size || undefined)
  );
}

export const roundMoney = (n: number) => Math.round(n * 100) / 100;

export function subtotalOf(items: CartLineItem[]) {
  return roundMoney(items.reduce((sum, i) => sum + i.itemTotal, 0));
}

/** The lines with `line`'s quantity set (and its line total recomputed). */
export function withLineQuantity(items: CartLineItem[], line: CartLineItem, quantity: number) {
  return items.map((i) => (isSameLine(i, line) ? { ...i, quantity, itemTotal: roundMoney(i.price * quantity) } : i));
}

/** The lines without `line`. */
export function withoutLine(items: CartLineItem[], line: CartLineItem) {
  return items.filter((i) => !isSameLine(i, line));
}
