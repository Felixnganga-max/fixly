const RepairRequest = require("../models/repairRequest");
const Commission = require("../models/comissions");

// ── Helper ────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────

// @desc   Submit new repair request (customer facing)
// @route  POST /api/repair-requests
// @access Public
exports.submitRequest = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    deviceType,
    deviceModel,
    issueType,
    issueDescription,
  } = req.body;

  if (!name || !phone || !location || !deviceType) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, phone, location and deviceType",
    });
  }

  const request = await RepairRequest.create({
    name,
    phone,
    location,
    deviceType,
    deviceModel: deviceModel || "",
    issueType: issueType || "",
    issueDescription: issueDescription || "",
  });

  res.status(201).json({ success: true, data: request });
});

// @desc   Get single request by ID (for confirmation page)
// @route  GET /api/repair-requests/:id
// @access Public
exports.getRequestById = asyncHandler(async (req, res) => {
  const request = await RepairRequest.findById(req.params.id)
    .populate("assignedTechnician", "name phone shopAddress category")
    .populate("assignedShop", "shopName location phone");

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  res.status(200).json({ success: true, data: request });
});

// ─────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────

// @desc   Get all requests with filters and pagination
// @route  GET /api/repair-requests
// @access Private/Admin
exports.getAllRequests = asyncHandler(async (req, res) => {
  const {
    status,
    deviceType,
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (deviceType) filter.deviceType = deviceType;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [requests, total] = await Promise.all([
    RepairRequest.find(filter)
      .populate("assignedTechnician", "name phone category")
      .populate("assignedShop", "shopName location")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    RepairRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: requests,
  });
});

// @desc   Assign technician + set quote
// @route  PATCH /api/repair-requests/:id/assign
// @access Private/Admin
exports.assignRequest = asyncHandler(async (req, res) => {
  const {
    technicianId,
    shopId,
    estimatedPriceMin,
    estimatedPriceMax,
    estimatedTime,
    adminNotes,
  } = req.body;

  if (!technicianId) {
    return res
      .status(400)
      .json({ success: false, message: "technicianId is required" });
  }

  const request = await RepairRequest.findByIdAndUpdate(
    req.params.id,
    {
      assignedTechnician: technicianId,
      assignedShop: shopId || null,
      estimatedPriceMin: estimatedPriceMin ? Number(estimatedPriceMin) : null,
      estimatedPriceMax: estimatedPriceMax ? Number(estimatedPriceMax) : null,
      estimatedTime: estimatedTime || null,
      adminNotes: adminNotes || "",
      status: "Assigned",
    },
    { new: true, runValidators: true },
  )
    .populate("assignedTechnician", "name phone shopAddress")
    .populate("assignedShop", "shopName location");

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Technician assigned", data: request });
});

// @desc   Update request status
// @route  PATCH /api/repair-requests/:id/status
// @access Private/Admin
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const validStatuses = [
    "Pending",
    "Assigned",
    "InProgress",
    "Completed",
    "IssueReported",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const update = { status };
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const request = await RepairRequest.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  // Auto-create commission when job is completed
  if (status === "Completed" && request.estimatedPriceMin) {
    const repairPrice = request.estimatedPriceMin;
    const commissionAmt = Commission.calculateAmount(repairPrice);

    await Commission.findOneAndUpdate(
      { job: request._id },
      {
        job: request._id,
        technician: request.assignedTechnician,
        repairPrice,
        amount: commissionAmt,
        status: "Pending",
      },
      { upsert: true, new: true },
    );
  }

  res
    .status(200)
    .json({ success: true, message: "Status updated", data: request });
});

// @desc   Admin stats overview
// @route  GET /api/repair-requests/stats
// @access Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [
    total,
    pending,
    assigned,
    inProgress,
    completed,
    issueReported,
    phones,
    laptops,
  ] = await Promise.all([
    RepairRequest.countDocuments(),
    RepairRequest.countDocuments({ status: "Pending" }),
    RepairRequest.countDocuments({ status: "Assigned" }),
    RepairRequest.countDocuments({ status: "InProgress" }),
    RepairRequest.countDocuments({ status: "Completed" }),
    RepairRequest.countDocuments({ status: "IssueReported" }),
    RepairRequest.countDocuments({ deviceType: "phone" }),
    RepairRequest.countDocuments({ deviceType: "laptop" }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      assigned,
      inProgress,
      completed,
      issueReported,
      phones,
      laptops,
    },
  });
});

// @desc   Delete a request (admin only)
// @route  DELETE /api/repair-requests/:id
// @access Private/Admin
exports.deleteRequest = asyncHandler(async (req, res) => {
  const request = await RepairRequest.findByIdAndDelete(req.params.id);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  res.status(200).json({ success: true, message: "Request deleted", data: {} });
});
