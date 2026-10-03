// scripts/seedLibrary.js
// Loads researched devices into the library.   Run:  node scripts/seedLibrary.js [file.json]
// Default file: scripts/data/phones.json  (an array of devices, see below)
//
// Re-running is safe: devices are matched by their key (brand + name), so an entry is
// updated, never duplicated. Seeded entries are marked Verified and replace any
// community entry a shop created for the same device.
//
// One device:
// {
//   "brand": "Samsung", "series": "Galaxy S", "name": "Galaxy S24", "category": "phone",
//   "releaseYear": 2024,
//   "specs": {
//     "screenSize": "6.2", "resolution": "1080 x 2340", "displayType": "Dynamic AMOLED 2X",
//     "refreshRate": "120", "processor": "...", "ram": "8GB", "storage": "128GB",
//     "os": "Android 14", "mainCamera": "...", "frontCamera": "...", "cameraFeatures": "...",
//     "battery": "4000", "charging": "...", "connectivity": "...", "sim": "..."
//   },
//   "features": ["..."],
//   "variants": [{ "ram": "8GB", "storage": "128GB" }, { "ram": "8GB", "storage": "256GB" }],
//   "colors": ["..."],
//   "sourceUrl": "https://..."
// }
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const LibraryDevice = require("../models/deviceLibrary");
const { libraryKey } = require("../utils/libraryHelpers");

const FILE = process.argv[2] || path.join(__dirname, "data", "phones.json");

(async () => {
  await connectDB();
  const items = JSON.parse(fs.readFileSync(FILE, "utf8"));

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const d of items) {
    if (!d.brand || !d.name || !["phone", "laptop"].includes(d.category)) {
      console.warn("Skipped (needs brand, name and category phone|laptop):", d.brand, d.name);
      skipped++;
      continue;
    }
    const key = libraryKey(d.brand, d.name);
    const doc = {
      key,
      category: d.category,
      brand: d.brand,
      series: d.series || "",
      name: d.name,
      releaseYear: d.releaseYear ?? null,
      shortDescription: d.shortDescription || "",
      specs: d.specs || {},
      features: d.features || [],
      variants: d.variants || [],
      colors: d.colors || [],
      sourceUrl: d.sourceUrl || "",
      source: "seed",
      verified: true,
      createdBy: null,
    };
    const r = await LibraryDevice.updateOne({ key }, { $set: doc, $setOnInsert: { usageCount: 0 } }, { upsert: true });
    if (r.upsertedCount) added++;
    else updated++;
    console.log(`${r.upsertedCount ? "added  " : "updated"}  ${key}`);
  }

  console.log(`\nDone. ${added} added, ${updated} updated, ${skipped} skipped.`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});