// controllers/publicShopController.js
// Phone/WhatsApp are deliberately NOT returned here. They come only from the
// logged-in endpoint in customerController.shopContact.
const mongoose = require("mongoose");
const ShopOwner = require("../models/shopOwners");
const MarketplaceListing = require("../models/Marketplacelisting");

const PUBLIC_FIELDS =
  "shopName slug location description logo banner offers category verified createdAt updatedAt";

// GET /fixly/public/shops?offers=sell|repair&category=phone|laptop
exports.listPublicShops = async (req, res) => {
  try {
    const { offers, category } = req.query;
    const filter = { active: true };
    if (["sell", "repair"].includes(offers)) filter.offers = offers;
    if (["phone", "laptop"].includes(category)) filter.category = category;

    const shops = await ShopOwner.find(filter)
      .sort({ verified: -1, createdAt: -1 })
      .select(PUBLIC_FIELDS)
      .limit(200)
      .lean();

    res.json({ success: true, count: shops.length, data: shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /fixly/public/shops/:slug   (slug or shop _id)
exports.getPublicShop = async (req, res) => {
  try {
    const key = req.params.slug;
    const match = mongoose.isValidObjectId(key)
      ? { $or: [{ slug: key.toLowerCase() }, { _id: key }] }
      : { slug: key.toLowerCase() };

    const shop = await ShopOwner.findOne({ ...match, active: true })
      .select(PUBLIC_FIELDS)
      .lean();
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const listings = await MarketplaceListing.find({ listedBy: shop._id, active: true })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: { shop, listings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /fixly/public/sitemap.xml  (served on your own domain through a rewrite)
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

exports.sitemap = async (req, res) => {
  try {
    const SITE = (process.env.SITE_URL || "https://www.fixlykenya.co.ke").replace(/\/$/, "");
    const shops = await ShopOwner.find({ active: true, slug: { $exists: true, $ne: "" } })
      .select("slug updatedAt")
      .lean();

    const fixed = ["/", "/marketplace", "/shops/phones", "/shops/laptops", "/repair-shops/phones", "/repair-shops/laptops", "/about-us"];
    const urls = [
      ...fixed.map((p) => `<url><loc>${esc(SITE + p)}</loc></url>`),
      ...shops.map(
        (s) =>
          `<url><loc>${esc(`${SITE}/${s.slug}/${s._id}`)}</loc><lastmod>${new Date(s.updatedAt).toISOString()}</lastmod></url>`,
      ),
    ];

    res
      .set("Cache-Control", "public, s-maxage=3600")
      .type("application/xml")
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch (err) {
    res.status(500).send("error");
  }
};