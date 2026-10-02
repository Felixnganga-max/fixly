// controllers/analyticsController.js
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ShopEvent = require("../models/shopEvents");
const ShopOwner = require("../models/shopOwners");
const MarketplaceListing = require("../models/Marketplacelisting");
require("../models/customers"); // registers "Customer" for populate

const PUBLIC_TYPES = ["page_view", "product_view", "whatsapp_click", "call_click", "directions_click"];
const ALL_TYPES = [...PUBLIC_TYPES, "contact_reveal"];
// Same visitor repeating the same action inside this window counts once
const WINDOW_MS = {
  page_view: 30 * 60e3,
  product_view: 30 * 60e3,
  whatsapp_click: 60e3,
  call_click: 60e3,
  directions_click: 60e3,
};
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor/i;

const matchKey = (key) =>
  mongoose.isValidObjectId(key)
    ? { $or: [{ slug: String(key).toLowerCase() }, { _id: key }] }
    : { slug: String(key).toLowerCase() };

// ── PUBLIC: POST /fixly/analytics/track ───────────────────────
// Always answers 204 so tracking can never break a page.
exports.track = async (req, res) => {
  try {
    const { type, shop: shopKey, listingId, visitorId, referrer } = req.body || {};
    if (!PUBLIC_TYPES.includes(type) || !visitorId || String(visitorId).length > 64) {
      return res.status(204).end();
    }
    if (BOT.test(req.headers["user-agent"] || "")) return res.status(204).end();

    let listing = null;
    let shopId = null;
    if (listingId && mongoose.isValidObjectId(listingId)) {
      listing = await MarketplaceListing.findById(listingId).select("listedBy").lean();
      shopId = listing?.listedBy || null;
    }
    if (type === "product_view" && !listing) return res.status(204).end();
    if (!shopId && shopKey) {
      const s = await ShopOwner.findOne(matchKey(shopKey)).select("_id").lean();
      shopId = s?._id || null;
    }
    if (!shopId) return res.status(204).end();

    // Attach the customer when a valid customer token came with the request
    let customer = null;
    const h = req.headers.authorization || "";
    if (h.startsWith("Bearer ") && process.env.JWT_SECRET) {
      try {
        const d = jwt.verify(h.slice(7), process.env.JWT_SECRET);
        if (d.role === "customer") customer = d.id;
      } catch {
        /* anonymous */
      }
    }

    const dup = {
      shop: shopId,
      type,
      visitorId,
      createdAt: { $gte: new Date(Date.now() - WINDOW_MS[type]) },
    };
    if (type === "product_view") dup.listing = listing._id;
    if (await ShopEvent.exists(dup)) return res.status(204).end();

    await ShopEvent.create({
      shop: shopId,
      type,
      listing: listing?._id || null,
      customer,
      visitorId,
      referrer: String(referrer || "").slice(0, 100),
    });
    res.status(204).end();
  } catch {
    res.status(204).end();
  }
};

// ── ADMIN: GET /fixly/analytics/summary?days=30 ───────────────
exports.summary = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const since = new Date(Date.now() - days * 864e5);

    const agg = await ShopEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { shop: "$shop", type: "$type", v: "$visitorId" }, n: { $sum: 1 } } },
      {
        $group: {
          _id: { shop: "$_id.shop", type: "$_id.type" },
          count: { $sum: "$n" },
          visitors: { $sum: 1 },
        },
      },
    ]);

    const shops = await ShopOwner.find({}).select("shopName slug active").lean();
    const rows = new Map(
      shops.map((s) => [
        String(s._id),
        {
          shopId: s._id,
          shopName: s.shopName,
          slug: s.slug,
          active: s.active,
          pageViews: 0,
          uniqueVisitors: 0,
          productViews: 0,
          whatsappClicks: 0,
          callClicks: 0,
          contactReveals: 0,
        },
      ]),
    );

    for (const r of agg) {
      const row = rows.get(String(r._id.shop));
      if (!row) continue;
      if (r._id.type === "page_view") {
        row.pageViews = r.count;
        row.uniqueVisitors = r.visitors;
      } else if (r._id.type === "product_view") row.productViews = r.count;
      else if (r._id.type === "whatsapp_click") row.whatsappClicks = r.count;
      else if (r._id.type === "call_click") row.callClicks = r.count;
      else if (r._id.type === "contact_reveal") row.contactReveals = r.count;
    }

    const data = [...rows.values()].map((r) => ({ ...r, leads: r.whatsappClicks + r.callClicks }));
    res.json({ success: true, data: { days, since, shops: data } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: GET /fixly/analytics/shops/:id/events ──────────────
exports.shopEvents = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid shop id" });
    }
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);

    const filter = { shop: id, createdAt: { $gte: new Date(Date.now() - days * 864e5) } };
    if (ALL_TYPES.includes(req.query.type)) filter.type = req.query.type;

    const events = await ShopEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("customer", "name phone email")
      .populate("listing", "name brand")
      .select("type listing customer referrer createdAt")
      .lean();

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SHOP OWNER: GET /fixly/analytics/me?days=7 ────────────────
// Same definitions as the admin summary, so owner and admin see the same numbers.
exports.myPerformance = async (req, res) => {
  try {
    const shopId = new mongoose.Types.ObjectId(req.shopOwnerId);
    const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 365);
    const since = new Date(Date.now() - days * 864e5);
    const match = { shop: shopId, createdAt: { $gte: since } };
    const ACTIONS = ["call_click", "whatsapp_click", "directions_click"];

    const [counts, perVisitor] = await Promise.all([
      ShopEvent.aggregate([{ $match: match }, { $group: { _id: "$type", n: { $sum: 1 } } }]),
      ShopEvent.aggregate([
        { $match: { ...match, visitorId: { $ne: "" } } },
        { $group: { _id: "$visitorId", types: { $addToSet: "$type" } } },
      ]),
    ]);
    const c = Object.fromEntries(counts.map((x) => [x._id, x.n]));

    // visitors = distinct people who opened the shop page;
    // contact rate = share of them who also tapped call / WhatsApp / directions
    let visitors = 0;
    let contacted = 0;
    for (const v of perVisitor) {
      if (!v.types.includes("page_view")) continue;
      visitors++;
      if (ACTIONS.some((t) => v.types.includes(t))) contacted++;
    }

    const callTaps = c.call_click || 0;
    const whatsappTaps = c.whatsapp_click || 0;
    const directionsTaps = c.directions_click || 0;

    res.json({
      success: true,
      data: {
        days,
        pageViews: c.page_view || 0,
        visitors,
        listingViews: c.product_view || 0,
        contactRate: visitors ? Math.round((1000 * contacted) / visitors) / 10 : 0,
        callTaps,
        whatsappTaps,
        directionsTaps,
        allActions: callTaps + whatsappTaps + directionsTaps,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};