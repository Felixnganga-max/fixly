// One-off: node scripts/migrate-shops.js
// - gives existing shops a slug + offers
// - reports duplicate emails you must fix BEFORE the unique index builds
require("dotenv").config();
const mongoose = require("mongoose");
const ShopOwner = require("../models/shopOwners");
const { uniqueSlug } = require("../utils/shopHelpers");

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const dupes = await ShopOwner.aggregate([
    { $match: { email: { $gt: "" } } },
    { $group: { _id: "$email", n: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { n: { $gt: 1 } } },
  ]);
  if (dupes.length) {
    console.log("DUPLICATE EMAILS — fix these first:");
    dupes.forEach((d) => console.log(" ", d._id, d.ids.map(String)));
  }

  const shops = await ShopOwner.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
  });
  for (const s of shops) {
    const slug = await uniqueSlug(ShopOwner, s.shopName);
    await ShopOwner.updateOne(
      { _id: s._id },
      { $set: { slug, offers: s.offers?.length ? s.offers : ["sell"], mustChangePassword: true } },
    );
    console.log(`slug set: ${s.shopName} -> ${slug}`);
  }

  await ShopOwner.syncIndexes();
  console.log("done");
  process.exit(0);
})();