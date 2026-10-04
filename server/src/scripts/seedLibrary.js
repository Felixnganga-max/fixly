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
  let data;
  if (file.endsWith(".js")) {
    data = require(file);
  } else {
    const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    if (/module\.exports|^\s*export\s+default|^\s*(const|let|var)\s/m.test(text)) {
      throw new Error(`${path.basename(file)} contains JavaScript, not JSON. Rename it to .js (ending with module.exports = [...]) or paste only the [ ... ] array.`);
    }
    // JSON has no comments: drop whole-line "// ..." comments before parsing
    const json = text.replace(/^\s*\/\/.*$/gm, "");
    try {
      data = JSON.parse(json);
    } catch (e) {
      throw new Error(`${path.basename(file)} is not valid JSON: ${e.message}`);
    }
  }
  let list = Array.isArray(data) ? data : data?.devices || data?.phones || data?.default;
  // File exports an object like { infinix: [...] } -> use every array inside it
  if (!Array.isArray(list) && data && typeof data === "object") {
    list = Object.values(data).filter(Array.isArray).flat();
  }
  if (!Array.isArray(list) || !list.length) {
    throw new Error(
      `No device array found. The file exports: ${typeof data}${data && typeof data === "object" ? " with keys " + Object.keys(data).join(", ") : ""}`,
    );
  }
  return list;
}

(async () => {
  const items = load(FILE);
  await connectDB();
  console.log(`Seeding ${items.length} devices from ${FILE}\n`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  const defaultCategory = /laptop/i.test(path.basename(FILE)) ? "laptop" : "phone";

  for (const raw of items) {
    const d = { ...raw, category: raw?.category || defaultCategory };
    if (!d.brand || !d.name || !["phone", "laptop"].includes(d.category)) {
      console.warn("Skipped (needs brand and name):", d.brand, d.name);
      skipped++;
      continue;
    }
    // "Infinix Note 60" with brand "Infinix" -> "Note 60" (brand is stored separately)
    const brandRx = new RegExp(`^${String(d.brand).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    d.name = String(d.name).trim().replace(brandRx, "") || String(d.name).trim();

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