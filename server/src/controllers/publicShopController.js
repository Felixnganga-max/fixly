// controllers/publicShopController.js
// ── ADJUST THESE 4 LINES to match your project ───────────────────────────────
import ShopOwner from "../models/ShopOwner.js"; // your shop model
import Listing from "../models/Listing.js"; //    your marketplace listing model
const LISTING_SHOP_FIELD = "listedBy"; //          listing field holding the shop's _id
const LIVE_FILTER = { hidden: { $ne: true } }; //  however "Live" vs "Hidden" is stored
// ─────────────────────────────────────────────────────────────────────────────

// GET /fixly/public/shops/:slug   (public — no auth middleware)
export const getPublicShop = async (req, res) => {
  try {
    const shop = await ShopOwner.findOne({
      slug: req.params.slug,
      active: true,
    })
      .select("shopName slug location phone whatsapp about offers category verified createdAt")
      .lean();

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const listings = await Listing.find({
      [LISTING_SHOP_FIELD]: shop._id,
      ...LIVE_FILTER,
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: { shop, listings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// In your router file, BEFORE any auth middleware:
//   router.get("/public/shops/:slug", getPublicShop);
// It must end up at /fixly/public/shops/:slug