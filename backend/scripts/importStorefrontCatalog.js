/**
 * Imports the product catalogue of a Lovable-built storefront (data compiled
 * into its JS bundle) into this store and organises it into the Indian
 * jewellery hierarchy below (Main category → Sub category).
 *
 *   npm run catalog:import -- <site-url>                # dry run — prints the mapping
 *   npm run catalog:import -- <site-url> --apply        # imports as drafts (admin publishes)
 *   ... --publish                                       # import published instead
 *
 * - Every category in HIERARCHY is created (editable in Admin > Categories).
 *   The storefront only lists categories that have published products, so
 *   a category appears there as soon as its first product is published.
 * - Images are re-hosted through uploadToCloudinary(), which stores them
 *   locally (uploads/) while Cloudinary isn't configured — move them later
 *   with `npm run media:migrate -- --apply`.
 * - Ratings / review counts on the source are NOT copied (they'd be fake reviews).
 * - Safe to re-run: categories match by name + parent, products by title.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const slugify = require("slugify");
const Category = require("../models/Category");
const Product = require("../models/Product");
const WarehouseStock = require("../models/WarehouseStock");
const StockMovement = require("../models/StockMovement");
const inventoryService = require("../services/inventory.service");
const { uploadToCloudinary, isCloudinaryConfigured } = require("../services/cloudinary.service");
const { invalidate } = require("../services/cache.service");
const { computeGstPricing } = require("../utils/gstPricing");

const [, , siteArg, ...flags] = process.argv;
const APPLY = flags.includes("--apply");
const DRAFT = !flags.includes("--publish");
if (!siteArg || siteArg.startsWith("--")) {
  console.error("Usage: npm run catalog:import -- <site-url> [--apply] [--publish]");
  process.exit(1);
}
const SITE = siteArg.replace(/\/+$/, "");

/** Indian artificial-jewellery hierarchy (display order). */
const HIERARCHY = [
  ["Earrings", ["Jhumki", "Bali", "Tops", "Stud", "Hoop", "Chandbali", "Drop", "Long Earrings", "Pearl", "Korean", "Temple"]],
  ["Necklace", ["Bridal Set", "Choker", "Temple", "Long Haram", "Pendant", "Long Necklace", "Kundan", "Pearl", "AD"]],
  ["Bangles", ["Kada", "Bracelet", "Bangles Set", "Stone", "Bridal", "Pearl", "Metal"]],
  ["Bracelets", ["Charm", "Pearl", "Stone", "Chain"]],
  ["Rings", ["Adjustable", "Cocktail", "Finger Ring"]],
  ["Maang Tikka", ["Bridal", "Kundan", "Pearl"]],
  ["Nose Pins", ["Clip-on", "Stud", "Nath"]],
  ["Anklets", ["Payal", "Ghungroo", "Stone"]],
  ["Toe Rings", ["Adjustable", "Oxidised"]],
  ["Mangalsutra", ["Short", "Long", "AD"]],
  ["Pendant Sets", ["Locket", "Medallion", "Initial", "Fashion Pendant"]],
  ["Hair Accessories", ["Hair Pins", "Juda Pins", "Matha Patti"]],
  ["Brooch", ["Saree Pin", "Brooch Pin"]],
  ["Waist Belt", ["Kamarbandh", "Bridal Belt"]],
];

/** Source category → [main, rules [regex on title, sub]…, fallback sub]. First match wins. */
const MAPPING = {
  earrings: ["Earrings", [[/jhumk/i, "Jhumki"], [/huggie|bali/i, "Bali"], [/hoop/i, "Hoop"], [/stud|tops/i, "Stud"], [/chandbali/i, "Chandbali"], [/pearl/i, "Pearl"], [/temple/i, "Temple"]], "Drop"],
  necklaces: ["Necklace", [[/pearl/i, "Pearl"], [/collar|choker|herringbone/i, "Choker"], [/kundan/i, "Kundan"], [/temple/i, "Temple"], [/bridal/i, "Bridal"], [/layer|long|riviera/i, "Long Necklace"], [/diamond|pear drop|solitaire/i, "AD"]], "Long Necklace"],
  bangles: ["Bangles", [[/cuff|kada/i, "Kada"], [/pav[eé]|stone|diamond/i, "Stone"], [/pearl/i, "Pearl"], [/bridal/i, "Bridal"]], "Metal"],
  bracelets: ["Bracelets", [[/charm/i, "Charm"], [/pearl/i, "Pearl"], [/tennis|bezel|stone|diamond/i, "Stone"], [/chain|paperclip|link/i, "Chain"]], "Chain"],
  rings: ["Rings", [[/adjustable/i, "Adjustable"], [/halo|engagement|cocktail/i, "Cocktail"]], "Finger Ring"],
  pendants: ["Pendant Sets", [[/locket/i, "Locket"], [/medallion|coin/i, "Medallion"], [/initial|letter/i, "Initial"]], "Fashion Pendant"],
};

const cut = (s, start) => {
  let depth = 0;
  for (let j = start; j < s.length; j++) {
    if (s[j] === "[") depth++;
    else if (s[j] === "]" && --depth === 0) return s.slice(start, j + 1);
  }
  throw new Error("Unbalanced array in bundle");
};

/** Reads collections and products out of the site's bundle. */
async function readCatalogue() {
  const html = await (await fetch(`${SITE}/`)).text();
  const bundlePath = html.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1];
  if (!bundlePath) throw new Error("Could not find the site's JS bundle");
  const js = await (await fetch(SITE + bundlePath)).text();
  const collections = Object.fromEntries(
    [...js.matchAll(/\{slug:"([\w-]+)",name:"([^"]+)",description:"[^"]*",image:"[^"]+"\}/g)].map((m) => [m[1], m[2]]),
  );
  // Rows: [title, category, collection, price, compareAt, imageSet, rating, reviews, stock, flags, description]
  const at = js.indexOf('=[["');
  if (at < 0) throw new Error("Could not find the product table in the bundle");
  const literal = cut(js, at + 1).replace(/!0/g, "true").replace(/!1/g, "false");
  const rows = Function(`"use strict"; return (${literal});`)();
  return rows
    .filter((r) => Array.isArray(r) && typeof r[0] === "string" && typeof r[3] === "number")
    .map((r) => ({
      title: r[0],
      source: r[1],
      collection: collections[r[2]] || r[2],
      price: r[3],
      compareAt: r[4],
      stock: r[8],
      flags: r[9] || {},
      description: r[10] || "",
      // Same rule the source site uses for a product's gallery.
      images: [`/images/${r[1]}-${r[5]}.jpg`, `/images/${r[1]}-${r[5] === 1 ? 2 : 1}.jpg`, "/images/editorial.jpg"],
    }));
}

/** [main, sub] for a source product — always one of HIERARCHY's pairs. */
const placeFor = (p) => {
  const map = MAPPING[p.source];
  if (!map) return ["Pendant Sets", "Fashion Pendant"];
  const [main, rules, fallback] = map;
  return [main, rules.find(([re]) => re.test(p.title))?.[1] || fallback];
};

async function main() {
  const products = await readCatalogue();
  for (const p of products) p.place = placeFor(p);
  // Every mapping must land on a category that exists in HIERARCHY.
  for (const p of products) {
    const [main, sub] = p.place;
    if (!HIERARCHY.some(([m, subs]) => m === main && subs.includes(sub))) throw new Error(`Mapping for "${p.title}" → ${main} › ${sub} is not in HIERARCHY`);
  }

  console.log(`Source: ${SITE} — ${products.length} products`);
  console.log(`Images: ${isCloudinaryConfigured() ? "Cloudinary" : "local uploads/ (Cloudinary not configured — migrate later)"}\n`);
  for (const [main, subs] of HIERARCHY) {
    const inMain = products.filter((p) => p.place[0] === main);
    console.log(`${main}${inMain.length ? ` (${inMain.length})` : "  — hidden on the storefront until it has published products"}`);
    for (const sub of subs) {
      const titles = inMain.filter((p) => p.place[1] === sub).map((p) => p.title);
      console.log(`  ${titles.length ? "├─" : "· "} ${sub}${titles.length ? `: ${titles.join(", ")}` : ""}`);
    }
  }
  if (!APPLY) {
    console.log("\nDry run — nothing written. Re-run with --apply to import.");
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  const imageCache = new Map();
  const hosted = async (path) => {
    if (imageCache.has(path)) return imageCache.get(path);
    const res = await fetch(SITE + path);
    if (!res.ok) throw new Error(`Image ${path}: HTTP ${res.status}`);
    const up = await uploadToCloudinary(Buffer.from(await res.arrayBuffer()), "ecommerce/products");
    const img = { url: up.url, publicId: up.publicId };
    imageCache.set(path, img);
    return img;
  };

  const ensureCategory = async (name, parent, sortOrder) => {
    let doc = await Category.findOne({ name, parent: parent?._id ?? null });
    if (!doc) {
      doc = await Category.create({
        name,
        parent: parent?._id ?? null,
        ancestors: parent ? [...parent.ancestors, parent._id] : [],
        level: parent ? parent.ancestors.length + 1 : 0,
        sortOrder,
        showInHeader: !parent,
        status: "active", // the storefront hides it until it has published products
      });
      // "pearl-earrings" rather than "pearl-2": readable, unique sub-category URLs.
      if (parent) {
        // …unless the name already says it ("Long Necklace" → long-necklace).
        const own = slugify(name, { lower: true, strict: true });
        const stem = slugify(parent.name, { lower: true, strict: true }).split("-")[0].replace(/s$/, "");
        const base = own.includes(stem) ? own : slugify(`${name} ${parent.name}`, { lower: true, strict: true });
        let slug = base;
        for (let n = 2; await Category.exists({ slug, _id: { $ne: doc._id } }); n++) slug = `${base}-${n}`;
        await Category.updateOne({ _id: doc._id }, { $set: { slug } });
        doc.slug = slug;
      }
      stats.categoriesCreated++;
    }
    return doc;
  };

  const warehouse = await inventoryService.getDefaultWarehouse();
  const stats = { categoriesCreated: 0, productsCreated: 0, productsSkipped: 0 };
  const tree = new Map();
  for (const [i, [mainName, subs]] of HIERARCHY.entries()) {
    const main = await ensureCategory(mainName, null, i);
    const subDocs = new Map();
    for (const [j, subName] of subs.entries()) subDocs.set(subName, await ensureCategory(subName, main, j));
    tree.set(mainName, { main, subs: subDocs });
  }

  const counters = {};
  for (const p of products) {
    const [mainName, subName] = p.place;
    const { main, subs } = tree.get(mainName);
    const sub = subs.get(subName);
    if (await Product.exists({ title: p.title, isDeleted: false })) {
      stats.productsSkipped++;
      continue;
    }
    const images = [];
    for (const path of p.images) images.push(await hosted(path));
    const retail = Math.max(p.price, p.compareAt || 0);
    // Artificial jewellery (HSN 7117) attracts 3% GST.
    const gst = computeGstPricing({ enteredPrice: retail, gstRate: 3, priceIncludesGST: true });
    const code = mainName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
    counters[code] = (counters[code] || 0) + 1;
    let sku = `${code}-${String(counters[code]).padStart(4, "0")}`;
    while (await Product.exists({ SKU: sku })) sku = `${code}-${String(++counters[code]).padStart(4, "0")}`;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const [product] = await Product.create(
          [
            {
              title: p.title,
              shortDescription: p.description.split(/(?<=\.)\s/)[0],
              description: p.description,
              SKU: sku,
              designCode: sku,
              hsnCode: "7117",
              category: sub._id,
              ...gst,
              salePrice: p.price < retail ? p.price : undefined,
              stock: Math.max(0, p.stock || 0),
              images,
              thumbnail: images[0],
              collections: p.collection ? [p.collection] : [],
              featured: !!p.flags.featured,
              isTopSelling: !!p.flags.bestseller,
              isNewArrival: !!p.flags.newArrival,
              minOrderQuantity: 1,
              packSize: 1,
              status: DRAFT ? "draft" : "active",
              tags: [mainName, subName, p.collection].filter(Boolean),
            },
          ],
          { session },
        );
        await WarehouseStock.create(
          [{ product: product._id, variant: null, warehouse: warehouse._id, available: product.stock, reserved: 0, damaged: 0, incoming: 0 }],
          { session },
        );
        if (product.stock > 0) {
          await StockMovement.create(
            [
              {
                product: product._id,
                warehouse: warehouse._id,
                type: "adjustment",
                quantity: product.stock,
                previousStock: 0,
                newStock: product.stock,
                referenceType: "system",
                note: "Opening stock (catalogue import)",
              },
            ],
            { session },
          );
        }
      });
      stats.productsCreated++;
    } finally {
      await session.endSession();
    }
    // Category pictures: first product image, unless the admin already set one.
    for (const cat of [sub, main]) {
      if (!cat.image?.url) {
        await Category.updateOne({ _id: cat._id }, { $set: { image: images[0] } });
        cat.image = images[0];
      }
    }
  }


  await invalidate("categories:*").catch(() => {});
  await invalidate("products:*").catch(() => {});
  console.log("\nImported:", stats, `· ${imageCache.size} images ${isCloudinaryConfigured() ? "on Cloudinary" : "stored locally in uploads/"}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Import failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
