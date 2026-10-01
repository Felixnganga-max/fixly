// data/devices/index.js
// Combines every brand file into one array and exposes a flatten() helper.
//
//   const { brands, flatten } = require("./data/devices");
//   flatten()  -> [{ brand, brandCategory, type: "phone"|"laptop", family, series, name, year, verify, confidence }]
//
// confidence: "checked"  = recent releases confirmed online on 30 Sep 2026
//             "medium"   = mostly background knowledge; recent entries partly checked or flagged verify
//             "low"      = background knowledge only, or series-level; expect gaps
//             "unresearched" = nothing listed yet
const files = [
  require("./samsung"), require("./apple"),
  ...require("./huawei-honor-xiaomi"), ...require("./tecno-infinix-itel"),
  ...require("./oppo-vivo-realme-oneplus"), ...require("./western-and-other-phones"),
  ...require("./laptop-brands"), ...require("./laptop-only-brands"), ...require("./rugged-and-china-budget"),
];

const CONFIDENCE = {
  Samsung: "checked", Apple: "checked", Tecno: "checked", Infinix: "checked",
  Huawei: "medium", Honor: "medium", Xiaomi: "medium", Oppo: "medium", Vivo: "medium", Realme: "medium", OnePlus: "medium",
  Google: "medium", Motorola: "medium", Nokia: "medium", Nothing: "medium", Sony: "medium", LG: "medium",
  Lenovo: "medium", Asus: "medium", HP: "medium", Dell: "medium", Microsoft: "medium",
  Itel: "low", Alcatel: "low", HTC: "low", Sharp: "low", ZTE: "low", TCL: "low", Meizu: "low", Micromax: "low", Coolpad: "low",
  Acer: "low", MSI: "low", Toshiba: "low", Razer: "low", Gigabyte: "low",
};

const brands = files.map((b) => ({ ...b, confidence: b.confidence || CONFIDENCE[b.brand] || "low" }));

function flatten() {
  const out = [];
  for (const b of brands) {
    for (const [type, tree] of [["phone", b.phones], ["laptop", b.laptops]]) {
      for (const [family, seriesMap] of Object.entries(tree || {})) {
        for (const [series, models] of Object.entries(seriesMap)) {
          for (const d of models) {
            out.push({ brand: b.brand, brandCategory: b.category, type, family, series, name: d.name, year: d.year ?? null, verify: !!d.verify, confidence: b.confidence });
          }
        }
      }
    }
  }
  // drop exact duplicates within a brand+type
  const seen = new Set();
  return out.filter((d) => { const k = `${d.brand}|${d.type}|${d.name}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

module.exports = { brands, flatten };