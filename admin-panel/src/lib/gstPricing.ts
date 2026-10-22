/**
 * Mirrors backend/utils/gstPricing.js — for the admin form's instant live
 * preview ONLY. The actual save always sends just the three raw inputs
 * (price, gstRate, priceIncludesGST); the backend independently recomputes
 * and persists basePrice/gstAmount/final price itself, never trusting
 * anything computed here.
 */
export interface GstPricingResult {
  price: number;
  basePrice: number;
  gstRate: number;
  gstAmount: number;
  priceIncludesGST: boolean;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeGstPricingPreview({
  enteredPrice,
  gstRate,
  priceIncludesGST,
}: {
  enteredPrice: number;
  gstRate: number;
  priceIncludesGST: boolean;
}): GstPricingResult {
  const entered = Number.isFinite(enteredPrice) ? enteredPrice : 0;
  const rate = Number.isFinite(gstRate) ? Math.min(Math.max(gstRate, 0), 100) : 0;

  if (priceIncludesGST) {
    const price = round2(entered);
    const basePrice = round2(price / (1 + rate / 100));
    const gstAmount = round2(price - basePrice);
    return { price, basePrice, gstRate: rate, gstAmount, priceIncludesGST: true };
  }

  const basePrice = round2(entered);
  const gstAmount = round2(basePrice * (rate / 100));
  const price = round2(basePrice + gstAmount);
  return { price, basePrice, gstRate: rate, gstAmount, priceIncludesGST: false };
}
