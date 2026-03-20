const Commission = require("../models/comissions");
const RepairRequest = require("../models/repairRequest");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Get all commissions
// @route  GET /api/commissions
// @access Private/Admin
exports.getAllCommissions = asyncHandler(async (req, res) => {
  const { status, technician, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (technician) filter.technician = technician;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [commissions, total] = await Promise.all([
    Commission.find(filter)
      .populate("job", "name phone deviceType status createdAt")
      .populate("technician", "name category")
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

// @desc   Record commission for a completed job
// @route  POST /api/commissions
// @access Private/Admin
exports.createCommission = asyncHandler(async (req, res) => {
  const { jobId, technicianId, repairPrice } = req.body;

  if (!jobId || !technicianId || !repairPrice) {
    return res
      .status(400)
      .json({
        success: false,
        message: "jobId, technicianId and repairPrice are required",
      });
  }

  const amount = Commission.calculateAmount(Number(repairPrice));

  const commission = await Commission.findOneAndUpdate(
    { job: jobId },
    {
      job: jobId,
      technician: technicianId,
      repairPrice: Number(repairPrice),
      amount,
      status: "Pending",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res
    .status(201)
    .json({ success: true, message: "Commission recorded", data: commission });
});

// @desc   Mark commission as paid
// @route  PATCH /api/commissions/:id/pay
// @access Private/Admin
exports.markPaid = asyncHandler(async (req, res) => {
  const commission = await Commission.findByIdAndUpdate(
    req.params.id,
    { status: "Paid", paidAt: new Date() },
    { new: true },
  );
  if (!commission)
    return res
      .status(404)
      .json({ success: false, message: "Commission not found" });
  res
    .status(200)
    .json({
      success: true,
      message: "Commission marked as paid",
      data: commission,
    });
});

// @desc   Commission summary stats
// @route  GET /api/commissions/stats
// @access Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [totalEarned, totalPending, count] = await Promise.all([
    Commission.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Commission.aggregate([
      { $match: { status: "Pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Commission.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalEarned: totalEarned[0]?.total ?? 0,
      totalPending: totalPending[0]?.total ?? 0,
      count,
      tiers: Commission.getTiers(),
    },
  });
});

// @desc   Delete commission record
// @route  DELETE /api/commissions/:id
// @access Private/Admin
exports.deleteCommission = asyncHandler(async (req, res) => {
  const commission = await Commission.findByIdAndDelete(req.params.id);
  if (!commission)
    return res
      .status(404)
      .json({ success: false, message: "Commission not found" });
  res
    .status(200)
    .json({ success: true, message: "Commission deleted", data: {} });
});
