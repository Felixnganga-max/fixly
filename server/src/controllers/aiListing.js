// controllers/aiListing.js
// npm i @google/genai
// env: GEMINI_API_KEY, GEMINI_MODEL (optional)
const { GoogleGenAI, Type } = require("@google/genai");
const MarketplaceListing = require("../models/Marketplacelisting");
const Brand = require("../models/brand");
const { invalidateCache } = require("../utils/cache");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Check Google's current model list and set GEMINI_MODEL if this one is retired.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const CACHE_PATTERNS = [
  "cache:/api/marketplace*",
  "cache:/api/marketplace/stats*",
];

// ⚠️ Keys MUST match the keys in your frontend productAssets.js.
// Rename here if they differ. Values are hints for the model.
const SPEC_KEYS = {
  phone: {
    screenSize: 'inches, number only, e.g. "6.7"',
    resolution: 'e.g. "2796 x 1290"',
    displayType: 'e.g. "Super Retina XDR OLED"',
    refreshRate: 'Hz, number only, e.g. "120"',
    processor: "chipset name",
    ram: 'e.g. "8GB"; if variants exist "6GB / 8GB"',
    storage: 'e.g. "128GB / 256GB"',
    os: 'e.g. "Android 14"',
    mainCamera: 'e.g. "50MP + 12MP + 10MP"',
    frontCamera: 'e.g. "12MP"',
    cameraFeatures: "comma separated",
    battery: "mAh, number only",
    charging: 'e.g. "45W wired, 15W wireless"',
    connectivity: 'e.g. "5G, Wi-Fi 6E, Bluetooth 5.3"',
    sim: 'e.g. "Dual SIM (nano + eSIM)"',
  },
  laptop: {
    screenSize: 'inches, number only, e.g. "15.6"',
    resolution: 'e.g. "1920 x 1080"',
    displayType: 'e.g. "IPS, anti-glare"',
    refreshRate: "Hz, number only",
    processor: 'e.g. "Intel Core i5-1235U"',
    ram: 'e.g. "8GB DDR4"',
    storage: 'e.g. "512GB NVMe SSD"',
    graphics: 'e.g. "Intel Iris Xe"',
    os: 'e.g. "Windows 11 Home"',
    battery: 'Wh, e.g. "56Wh"',
    ports: "comma separated",
    connectivity: 'e.g. "Wi-Fi 6, Bluetooth 5.2"',
    weight: "kg, number only",
  },
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const EMPTY = /^(null|n\/a|na|none|unknown|not found|not available|-)$/i;

async function resolveBrand(brand, category) {
  const b = await Brand.findOne({
    name: new RegExp(`^${esc(String(brand).trim())}$`, "i"),
    active: true,
    category: { $in: [category, "all"] },
  });
  return b ? b.name : null;
}

function cleanSpecs(category, specs = {}) {
  const out = {};
  for (const k of Object.keys(SPEC_KEYS[category])) {
    const v = specs[k];
    if (typeof v === "string" && v.trim() && !EMPTY.test(v.trim()))
      out[k] = v.trim().slice(0, 200);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// POST /marketplace/ai/generate   (admin)  — ONE device per call
// Body: { category, brand, name }
// Returns a draft. Nothing is saved.
// ─────────────────────────────────────────────────────────────
exports.generate = asyncHandler(async (req, res) => {
  const { category, brand, name } = req.body;
  if (!["phone", "laptop"].includes(category) || !brand || !name?.trim()) {
    return res.status(400).json({
      success: false,
      message: "category, brand and name are required",
    });
  }

  const brandName = await resolveBrand(brand, category);
  if (!brandName) {
    return res
      .status(400)
      .json({ success: false, message: `Unknown brand: ${brand}` });
  }

  // "Samsung Galaxy S24" -> "Galaxy S24" (brand is stored separately)
  const cleanName = name
    .trim()
    .replace(new RegExp(`^${esc(brandName)}\\s+`, "i"), "");

  const dup = await MarketplaceListing.findOne({
    category,
    brand: brandName,
    name: new RegExp(`^${esc(cleanName)}$`, "i"),
  }).select("_id");
  if (dup) {
    return res.json({
      success: true,
      data: { duplicate: true, id: dup._id, name: cleanName, brand: brandName },
    });
  }

  const keys = SPEC_KEYS[category];
  const keyHelp = Object.entries(keys)
    .map(([k, hint]) => `- ${k}: ${hint}`)
    .join("\n");

  try {
    // Step 1: grounded research (Google Search). Needed for newer devices
    // the model wasn't trained on. Search grounding can't be combined with
    // JSON mode, so structuring is a second call.
    const research = await ai.models.generateContent({
      model: MODEL,
      contents:
        `Find the official specifications of the ${category} "${brandName} ${cleanName}". ` +
        `Prefer the manufacturer's site; use GSMArena / Notebookcheck as secondary. ` +
        `Report these fields:\n${keyHelp}\n` +
        `If there are RAM/storage variants, list them. ` +
        `For any field you cannot verify write "not found". ` +
        `If this device does not exist, reply exactly: NOT_FOUND`,
      config: { tools: [{ googleSearch: {} }], temperature: 0 },
    });

    const facts = research.text || "";
    if (!facts || /NOT_FOUND/.test(facts)) {
      return res.status(404).json({
        success: false,
        message: `Couldn't verify "${brandName} ${cleanName}" exists. Check the spelling.`,
      });
    }

    const sources = (
      research.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    )
      .map((c) => c.web?.uri)
      .filter(Boolean)
      .slice(0, 4);

    // Step 2: structure into strict JSON
    const specProps = Object.fromEntries(
      Object.keys(keys).map((k) => [k, { type: Type.STRING, nullable: true }]),
    );
    const structured = await ai.models.generateContent({
      model: MODEL,
      contents:
        `Convert the facts below into JSON for a ${category} listing.\n` +
        `Rules: use ONLY the facts given; null for anything not stated; ` +
        `shortDescription = 1-2 plain factual sentences, max 200 chars, no hype, no price; ` +
        `features = 4-6 short highlights taken from the facts; ` +
        `exists=false if the facts say the device doesn't exist.\n\nFACTS:\n${facts}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exists: { type: Type.BOOLEAN },
            shortDescription: { type: Type.STRING },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            specs: { type: Type.OBJECT, properties: specProps },
          },
          required: ["exists", "shortDescription", "features", "specs"],
        },
      },
    });

    let data;
    try {
      data = JSON.parse(structured.text);
    } catch {
      return res
        .status(502)
        .json({ success: false, message: "AI returned invalid data. Retry." });
    }
    if (!data.exists) {
      return res.status(404).json({
        success: false,
        message: `Couldn't verify "${brandName} ${cleanName}" exists.`,
      });
    }

    const specs = cleanSpecs(category, data.specs);
    if (Object.keys(specs).length < 3) {
      return res.status(422).json({
        success: false,
        message: "Not enough verified specs found. Add this one manually.",
      });
    }

    res.json({
      success: true,
      data: {
        name: cleanName,
        brand: brandName,
        shortDescription: String(data.shortDescription || "").slice(0, 300),
        features: (data.features || []).map(String).slice(0, 6),
        specs,
        sources,
      },
    });
  } catch (err) {
    console.error("[ai.generate]", err.message);
    res
      .status(502)
      .json({ success: false, message: "AI request failed. Retry." });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /marketplace/ai/drafts   (admin)
// Body: { category, brand, items: [{ name, shortDescription, features, specs }] }
// Saves as HIDDEN drafts: price 0, active false, no images.
// ─────────────────────────────────────────────────────────────
exports.saveDrafts = asyncHandler(async (req, res) => {
  const { category, brand, items } = req.body;
  if (
    !["phone", "laptop"].includes(category) ||
    !brand ||
    !Array.isArray(items) ||
    !items.length
  ) {
    return res
      .status(400)
      .json({ success: false, message: "category, brand and items required" });
  }
  const brandName = await resolveBrand(brand, category);
  if (!brandName) {
    return res
      .status(400)
      .json({ success: false, message: `Unknown brand: ${brand}` });
  }

  const batch = items.filter((i) => i?.name?.trim()).slice(0, 50);
  const existing = await MarketplaceListing.find({
    category,
    brand: brandName,
    name: { $in: batch.map((i) => i.name.trim()) },
  }).select("name");
  const taken = new Set(existing.map((e) => e.name.toLowerCase()));

  const docs = batch
    .filter((i) => !taken.has(i.name.trim().toLowerCase()))
    .map((i) => ({
      category,
      brand: brandName,
      name: i.name.trim(),
      price: 0,
      condition: "New",
      active: false, // hidden until you set price + images and go live
      verified: false,
      aiGenerated: true,
      shortDescription:
        String(i.shortDescription || "").slice(0, 300) ||
        `${brandName} ${i.name.trim()}`,
      features: Array.isArray(i.features)
        ? i.features.map(String).slice(0, 8)
        : [],
      specs: cleanSpecs(category, i.specs),
    }));

  const created = docs.length ? await MarketplaceListing.insertMany(docs) : [];
  await invalidateCache(CACHE_PATTERNS);

  res.status(201).json({
    success: true,
    created: created.length,
    skipped: batch.length - created.length,
  });
});