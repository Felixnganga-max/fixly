// controllers/analyticsController.js
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ShopEvent = require("../models/shopEvents");
const ShopOwner = require("../models/shopOwners");
const MarketplaceListing = require("../models/Marketplacelisting");
require("../models/customers"); // registers "Customer" for populate

const PUBLIC_TYPES = ["page_view", "product_view", "whatsapp_click", "call_click"];
const ALL_TYPES = [...PUBLIC_TYPES, "contact_reveal"];
// Same visitor repeating the same action inside this window counts once
const WINDOW_MS = {
  page_view: 30 * 60e3,
  product_view: 30 * 60e3,
  whatsapp_click: 60e3,
  call_click: 60e3,
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

// ── helpers for the dashboard endpoints ───────────────────────
const TZ = "Africa/Nairobi";
const oid = (id) => new mongoose.Types.ObjectId(String(id));

function getRange(req) {
  const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
  const now = Date.now();
  const since = new Date(now - days * 864e5);
  const prevSince = new Date(now - 2 * days * 864e5);
  return { days, since, prevSince };
}

const rateOf = (acting, visitors) =>
  visitors ? Math.min(100, Math.round((acting / visitors) * 1000) / 10) : 0;

// Totals for any $match (all shops, or one shop)
async function computeTotals(match) {
  const [byType, pv, acting] = await Promise.all([
    ShopEvent.aggregate([{ $match: match }, { $group: { _id: "$type", n: { $sum: 1 } } }]),
    ShopEvent.aggregate([
      { $match: { ...match, type: "page_view" } },
      { $group: { _id: "$visitorId" } },
      { $count: "n" },
    ]),
    ShopEvent.aggregate([
      { $match: { ...match, type: { $in: ACTION_TYPES } } },
      { $group: { _id: "$visitorId" } },
      { $count: "n" },
    ]),
  ]);
  const c = Object.fromEntries(byType.map((r) => [r._id, r.n]));
  const visitors = pv[0]?.n || 0;
  const calls = c.call_click || 0;
  const whatsapp = c.whatsapp_click || 0;
  const directions = c.directions_click || 0;
  return {
    shopViews: c.page_view || 0,
    visitors,
    listingViews: c.product_view || 0,
    calls,
    whatsapp,
    directions,
    actions: calls + whatsapp + directions,
    rate: rateOf(acting[0]?.n || 0, visitors),
  };
}

// Per-shop numbers (overview table rows)
async function computePerShop(since) {
  const match = { createdAt: { $gte: since } };
  const [byType, acting] = await Promise.all([
    ShopEvent.aggregate([
      { $match: match },
      { $group: { _id: { shop: "$shop", type: "$type", v: "$visitorId" }, n: { $sum: 1 } } },
      { $group: { _id: { shop: "$_id.shop", type: "$_id.type" }, count: { $sum: "$n" }, visitors: { $sum: 1 } } },
    ]),
    ShopEvent.aggregate([
      { $match: { ...match, type: { $in: ACTION_TYPES } } },
      { $group: { _id: { shop: "$shop", v: "$visitorId" } } },
      { $group: { _id: "$_id.shop", visitors: { $sum: 1 } } },
    ]),
  ]);
  const m = new Map();
  const row = (id) => {
    const k = String(id);
    if (!m.has(k)) m.set(k, { shopViews: 0, visitors: 0, listingViews: 0, calls: 0, whatsapp: 0, directions: 0, acting: 0 });
    return m.get(k);
  };
  for (const r of byType) {
    const o = row(r._id.shop);
    if (r._id.type === "page_view") { o.shopViews = r.count; o.visitors = r.visitors; }
    else if (r._id.type === "product_view") o.listingViews = r.count;
    else if (r._id.type === "call_click") o.calls = r.count;
    else if (r._id.type === "whatsapp_click") o.whatsapp = r.count;
    else if (r._id.type === "directions_click") o.directions = r.count;
  }
  for (const r of acting) row(r._id).acting = r.visitors;
  return m;
}

// Daily buckets, zero-filled, in Nairobi time
async function computeSeries(match, days) {
  const rows = await ShopEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: { d: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } }, type: "$type" },
        n: { $sum: 1 },
      },
    },
  ]);
  const byDay = {};
  for (const r of rows) {
    const o = (byDay[r._id.d] ||= { views: 0, listingViews: 0, actions: 0 });
    if (r._id.type === "page_view") o.views += r.n;
    else if (r._id.type === "product_view") o.listingViews += r.n;
    else if (ACTION_TYPES.includes(r._id.type)) o.actions += r.n;
  }
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 864e5).toLocaleDateString("en-CA", { timeZone: TZ });
    out.push({ date, views: 0, listingViews: 0, actions: 0, ...byDay[date] });
  }
  return out;
}

async function computeTopListings(shopId, since) {
  const rows = await ShopEvent.aggregate([
    { $match: { shop: oid(shopId), createdAt: { $gte: since }, listing: { $ne: null } } },
    {
      $group: {
        _id: "$listing",
        views: { $sum: { $cond: [{ $eq: ["$type", "product_view"] }, 1, 0] } },
        clicks: { $sum: { $cond: [{ $in: ["$type", ACTION_TYPES] }, 1, 0] } },
      },
    },
    { $sort: { views: -1, clicks: -1 } },
    { $limit: 5 },
  ]);
  const listings = await MarketplaceListing.find({ _id: { $in: rows.map((r) => r._id) } })
    .select("name images image") // adjust to your listing schema
    .lean();
  const byId = new Map(listings.map((l) => [String(l._id), l]));
  return rows.map((r) => {
    const l = byId.get(String(r._id)) || {};
    const img = l.image || l.images?.[0];
    return {
      id: r._id,
      name: l.name || "Deleted listing",
      image: typeof img === "object" ? img?.url || "" : img || "",
      views: r.views,
      clicks: r.clicks,
    };
  });
}

async function shopReport(shopId, shopName, { days, since, prevSince }) {
  const base = { shop: oid(shopId) };
  const [totals, prev, series, topListings] = await Promise.all([
    computeTotals({ ...base, createdAt: { $gte: since } }),
    computeTotals({ ...base, createdAt: { $gte: prevSince, $lt: since } }),
    computeSeries({ ...base, createdAt: { $gte: since } }, days),
    computeTopListings(shopId, since),
  ]);
  return { shop: { shopName }, totals, prev, series, topListings };
}

// ── ADMIN: GET /fixly/analytics/overview?days=30 ──────────────
exports.overview = async (req, res) => {
  try {
    const range = getRange(req);
    const { days, since, prevSince } = range;
    const [shops, perShop, totals, prev, series] = await Promise.all([
      ShopOwner.find({}).select("shopName slug active verified").lean(),
      computePerShop(since),
      computeTotals({ createdAt: { $gte: since } }),
      computeTotals({ createdAt: { $gte: prevSince, $lt: since } }),
      computeSeries({ createdAt: { $gte: since } }, days),
    ]);
    const rows = shops.map((s) => {
      const o = perShop.get(String(s._id)) || { shopViews: 0, visitors: 0, listingViews: 0, calls: 0, whatsapp: 0, directions: 0, acting: 0 };
      const { acting, ...nums } = o;
      return {
        id: s._id,
        shopName: s.shopName || "Unnamed shop",
        verified: !!s.verified,
        active: s.active !== false,
        ...nums,
        rate: rateOf(acting, o.visitors),
      };
    });
    res.json({ success: true, data: { days, totals, prev, series, shops: rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: GET /fixly/analytics/shops/:id?days=30 ─────────────
exports.shopReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid shop id" });
    }
    const shop = await ShopOwner.findById(id).select("shopName").lean();
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.json({ success: true, data: await shopReport(id, shop.shopName, getRange(req)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SHOP OWNER: GET /fixly/analytics/me?days=30 ───────────────
exports.myReport = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id; // adjust to what your auth middleware sets
    if (!id) return res.status(401).json({ success: false, message: "Not authenticated" });
    const shop = await ShopOwner.findById(id).select("shopName").lean();
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.json({ success: true, data: await shopReport(id, shop.shopName, getRange(req)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};