// scripts/seedLibrary.js
// Loads devices into the library.
//   node scripts/seedLibrary.js                              -> scripts/data/phones.json
//   node scripts/seedLibrary.js scripts/data/infinix.js      -> a .js file that does module.exports = [ ... ]
//   node scripts/seedLibrary.js scripts/data/infinix.json    -> a .json array
//
// Re-running is safe: devices are matched by key (brand + name), so an entry is
// updated, never duplicated. Seeded entries are marked Verified.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const LibraryDevice = require("../models/deviceLibrary");
const { libraryKey } = require("../utils/libraryHelpers");

const FILE = path.resolve(process.argv[2] || path.join(__dirname, "data", "phones.json"));

function load(file) {
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
  const data = file.endsWith(".js") ? require(file) : JSON.parse(fs.readFileSync(file, "utf8"));
  const list = Array.isArray(data) ? data : data.devices || data.phones || data.default;
  if (!Array.isArray(list)) throw new Error("The file must be an array of devices (module.exports = [ ... ])");
  return list;
}

(async () => {
  const items = load(FILE);
  await connectDB();
  console.log(`Seeding ${items.length} devices from ${FILE}\n`);

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
  console.error(err.message || err);
  process.exit(1);
});