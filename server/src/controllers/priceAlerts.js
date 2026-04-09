const PriceAlert = require("../models/priceAlert");
const MarketplaceListing = require("../models/Marketplacelisting");
const { sendPriceDropEmail } = require("../utils/notifications");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Subscribe to a price alert
// @route  POST /api/marketplace/:id/alert
// @access Private (logged-in users)
// Body: { targetPrice: Number }
exports.createAlert = asyncHandler(async (req, res) => {
  const { targetPrice } = req.body;
  const listingId = req.params.id;

  if (!targetPrice || isNaN(targetPrice) || targetPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "targetPrice must be a positive number",
    });
  }

  const listing = await MarketplaceListing.findById(listingId);
  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  if (listing.price <= targetPrice) {
    return res.status(400).json({
      success: false,
      message: `Current price (KES ${listing.price.toLocaleString()}) is already at or below your target`,
    });
  }

  // Upsert — update targetPrice if alert already exists
  const alert = await PriceAlert.findOneAndUpdate(
    { listingId, userId: req.user._id },
    {
      listingId,
      userId: req.user._id,
      email: req.user.email,
      targetPrice,
      notified: false,
      notifiedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({
    success: true,
    message: `Alert set — we'll email you when price drops to KES ${Number(targetPrice).toLocaleString()} or below`,
    data: alert,
  });
});

// @desc   Delete a price alert
// @route  DELETE /api/marketplace/:id/alert
// @access Private
exports.deleteAlert = asyncHandler(async (req, res) => {
  const deleted = await PriceAlert.findOneAndDelete({
    listingId: req.params.id,
    userId: req.user._id,
  });

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Alert not found" });
  }

  res.status(200).json({ success: true, message: "Alert removed" });
});

// @desc   Get all alerts for the logged-in user
// @route  GET /api/alerts/mine
// @access Private
exports.getMyAlerts = asyncHandler(async (req, res) => {
  const alerts = await PriceAlert.find({ userId: req.user._id })
    .populate("listingId", "name brand price images active")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: alerts.length, data: alerts });
});

/**
 * Internal helper — called by marketplaceController after a price update.
 * Finds all un-notified alerts that are now satisfied and sends emails.
 *
 * @param {Object} listing - the updated listing document (post-save)
 * @param {number} oldPrice - price before the update
 */
exports.triggerPriceAlerts = async (listing, oldPrice) => {
  if (listing.price >= oldPrice) return; // price went up or unchanged — nothing to do

  try {
    const satisfiedAlerts = await PriceAlert.find({
      listingId: listing._id,
      targetPrice: { $gte: listing.price }, // user's target is now at or above the new price
      notified: false,
    });

    if (!satisfiedAlerts.length) return;

    await Promise.all(
      satisfiedAlerts.map(async (alert) => {
        try {
          await sendPriceDropEmail({
            to: alert.email,
            listingName: listing.name,
            oldPrice,
            newPrice: listing.price,
            listingId: listing._id,
          });

          alert.notified = true;
          alert.notifiedAt = new Date();
          await alert.save();
        } catch (err) {
          console.error(
            `[PriceAlert] Failed to notify ${alert.email}:`,
            err.message,
          );
        }
      }),
    );

    console.log(
      `[PriceAlert] Sent ${satisfiedAlerts.length} notification(s) for listing ${listing._id}`,
    );
  } catch (err) {
    // Never let alert processing crash the update response
    console.error("[PriceAlert] triggerPriceAlerts error:", err.message);
  }
};
