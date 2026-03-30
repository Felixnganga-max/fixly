const Commission = require("../models/comissions");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Get all commissions
// @route  GET /fixly/commissions
// @access Private/Admin
exports.getAllCommissions = asyncHandler(async (req, res) => {
  const { status, technician, type, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (technician) filter.technician = technician;
  if (type) filter.type = type; // "repair" | "sale"

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [commissions, total] = await Promise.all([
    Commission.find(filter)
      .populate("job", "name phone deviceType status createdAt")
      .populate("technician", "name category")
      .populate("purchase", "firstName email phone listingSnapshot createdAt")
      .populate("listing", "name brand price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Commission.countDocuments(filter),
  ]);

  res
    .status(200)
    .json({
      success: true,
      count: commissions.length,
      total,
      data: commissions,
    });
});

// @desc   Manually record a commission (admin override)
// @route  POST /fixly/commissions
// @access Private/Admin
exports.createCommission = asyncHandler(async (req, res) => {
  const { type, jobId, technicianId, purchaseId, listingId, basePrice } =
    req.body;

  if (!type || !basePrice) {
    return res.status(400).json({
      success: false,
      message: "type and basePrice are required",
    });
  }
  if (type === "repair" && (!jobId || !technicianId)) {
    return res.status(400).json({
      success: false,
      message: "jobId and technicianId are required for repair commissions",
    });
  }
  if (type === "sale" && !purchaseId) {
    return res.status(400).json({
      success: false,
      message: "purchaseId is required for sale commissions",
    });
  }

  const rate = type === "sale" ? 0.045 : 0.09;
  const amount = Commission.calculateAmount(Number(basePrice), type);

  const filter = type === "repair" ? { job: jobId } : { purchase: purchaseId };
  const document = {
    type,
    basePrice: Number(basePrice),
    rate,
    amount,
    status: "Pending",
    ...(type === "repair"
      ? { job: jobId, technician: technicianId }
      : { purchase: purchaseId, listing: listingId || null }),
  };

  const commission = await Commission.findOneAndUpdate(filter, document, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  res
    .status(201)
    .json({ success: true, message: "Commission recorded", data: commission });
});

// @desc   Mark commission as paid
// @route  PATCH /fixly/commissions/:id/pay
// @access Private/Admin
exports.markPaid = asyncHandler(async (req, res) => {
  const commission = await Commission.findByIdAndUpdate(
    req.params.id,
    { status: "Paid", paidAt: new Date() },
    { new: true },
  );
  if (!commission) {
    return res
      .status(404)
      .json({ success: false, message: "Commission not found" });
  }
  res
    .status(200)
    .json({
      success: true,
      message: "Commission marked as paid",
      data: commission,
    });
});

// @desc   Commission stats — split by type
// @route  GET /fixly/commissions/stats
// @access Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalEarned,
    totalPending,
    repairEarned,
    repairPending,
    saleEarned,
    salePending,
    count,
  ] = await Promise.all([
    // Overall
    Commission.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Commission.aggregate([
      { $match: { status: "Pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    // Repairs
    Commission.aggregate([
      { $match: { status: "Paid", type: "repair" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Commission.aggregate([
      { $match: { status: "Pending", type: "repair" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    // Sales
    Commission.aggregate([
      { $match: { status: "Paid", type: "sale" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Commission.aggregate([
      { $match: { status: "Pending", type: "sale" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Commission.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalEarned: totalEarned[0]?.total ?? 0,
      totalPending: totalPending[0]?.total ?? 0,
      repair: {
        earned: repairEarned[0]?.total ?? 0,
        pending: repairPending[0]?.total ?? 0,
        rate: "9%",
      },
      sale: {
        earned: saleEarned[0]?.total ?? 0,
        pending: salePending[0]?.total ?? 0,
        rate: "4.5%",
      },
      count,
      rates: Commission.getRates(),
    },
  });
});

// @desc   Delete commission
// @route  DELETE /fixly/commissions/:id
// @access Private/Admin
exports.deleteCommission = asyncHandler(async (req, res) => {
  const commission = await Commission.findByIdAndDelete(req.params.id);
  if (!commission) {
    return res
      .status(404)
      .json({ success: false, message: "Commission not found" });
  }
  res
    .status(200)
    .json({ success: true, message: "Commission deleted", data: {} });
});
