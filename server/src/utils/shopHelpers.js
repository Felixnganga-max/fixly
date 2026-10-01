const crypto = require("crypto");

const RESERVED = new Set([
  "admin", "api", "s", "shops", "repairs", "marketplace", "login",
  "dashboard", "shop-dashboard", "technicians", "sales", "commissions", "settings",
]);

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

async function uniqueSlug(Model, name) {
  let base = slugify(name) || "shop";
  if (RESERVED.has(base)) base = `${base}-shop`;
  let slug = base;
  let n = 1;
  while (await Model.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

const generateTempPassword = () => crypto.randomBytes(9).toString("base64url"); // 12 chars

const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { slugify, uniqueSlug, generateTempPassword, pick, escapeRegex };