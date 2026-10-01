// controllers/publicShopController.js
const mongoose = require("mongoose");
const ShopOwner = require("../models/shopOwners");
const MarketplaceListing = require("../models/Marketplacelisting");

// GET /fixly/public/shops/:slug   (public, no auth)
// :slug can also be the shop's _id
exports.getPublicShop = async (req, res) => {
  try {
    const key = req.params.slug;
    const match = mongoose.isValidObjectId(key)
      ? { $or: [{ slug: key.toLowerCase() }, { _id: key }] }
      : { slug: key.toLowerCase() };

    const shop = await ShopOwner.findOne({ ...match, active: true })
      .select(
        "shopName slug location phone whatsapp description logo banner offers category verified createdAt",
      )
      .lean();

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const listings = await MarketplaceListing.find({
      listedBy: shop._id,
      active: true,
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: { shop, listings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};