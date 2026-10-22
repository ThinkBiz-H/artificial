/** Suggestions for the jewellery option fields — admins can type any other value. */

export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Gold", hex: "#D4AF37" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Oxidised Silver", hex: "#6E6E6E" },
  { name: "Antique Gold", hex: "#B08D57" },
  { name: "Black", hex: "#1C1C1C" },
];

export const METAL_SUGGESTIONS = ["Brass", "Copper", "Alloy", "German Silver", "Stainless Steel", "Oxidised Metal"];

export const PLATING_SUGGESTIONS = ["Gold Plated", "Rose Gold Plated", "Silver Plated", "Rhodium", "Oxidised"];

export const SIZE_SUGGESTIONS = ["2.2", "2.4", "2.6", "2.8", "6", "7", "8", "9", "10", "Free Size"];

/** Preset hex for a colour name, if it's one of the suggestions. */
export const presetHex = (name: string) => COLOR_PRESETS.find((c) => c.name.toLowerCase() === name.trim().toLowerCase())?.hex;

/** Uppercase, dash-separated token for SKU generation ("Rose Gold" → "ROSE-GOLD", "2.4" → "2-4"). */
export const skuToken = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
