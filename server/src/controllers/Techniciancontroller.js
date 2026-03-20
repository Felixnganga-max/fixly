const Technician = require("../models/technicians");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Get all technicians
// @route  GET /api/technicians
// @access Public (verified + available for customer use) / Admin (all)
exports.getAllTechnicians = asyncHandler(async (req, res) => {
  const {
    category,
    availability,
    verified,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (availability) filter.availability = availability;

  // Public endpoint only shows verified technicians
  // Admin can pass ?all=true to see everyone
  if (req.query.all !== "true") filter.verified = true;
  else if (verified !== undefined) filter.verified = verified === "true";

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { shopAddress: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [technicians, total] = await Promise.all([
    Technician.find(filter)
      .populate("shopOwner", "shopName location")
      .sort({ availability: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Technician.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: technicians.length,
    total,
    data: technicians,
  });
});

// @desc   Get single technician
// @route  GET /api/technicians/:id
// @access Private/Admin
exports.getTechnicianById = asyncHandler(async (req, res) => {
  const tech = await Technician.findById(req.params.id).populate(
    "shopOwner",
    "shopName location phone",
  );
  if (!tech)
    return res
      .status(404)
      .json({ success: false, message: "Technician not found" });
  res.status(200).json({ success: true, data: tech });
});

// @desc   Add technician
// @route  POST /api/technicians
// @access Private/Admin
exports.createTechnician = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    category,
    specializations,
    shopAddress,
    shopOwner,
    verified,
    notes,
  } = req.body;

  if (!name || !phone || !category || !shopAddress) {
    return res.status(400).json({
      success: false,
      message: "name, phone, category and shopAddress are required",
    });
  }

  const tech = await Technician.create({
    name,
    phone,
    email: email || "",
    category,
    specializations: specializations || [],
    shopAddress,
    shopOwner: shopOwner || null,
    verified: verified ?? false,
    notes: notes || "",
  });

  res
    .status(201)
    .json({ success: true, message: "Technician added", data: tech });
});

// @desc   Update technician
// @route  PUT /api/technicians/:id
// @access Private/Admin
exports.updateTechnician = asyncHandler(async (req, res) => {
  const tech = await Technician.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tech)
    return res
      .status(404)
      .json({ success: false, message: "Technician not found" });
  res
    .status(200)
    .json({ success: true, message: "Technician updated", data: tech });
});

// @desc   Update availability only
// @route  PATCH /api/technicians/:id/availability
// @access Private/Admin
exports.updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;
  const valid = ["Available", "Busy", "Offline"];
  if (!valid.includes(availability)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid availability value" });
  }
  const tech = await Technician.findByIdAndUpdate(
    req.params.id,
    { availability },
    { new: true },
  );
  if (!tech)
    return res
      .status(404)
      .json({ success: false, message: "Technician not found" });
  res.status(200).json({ success: true, data: tech });
});

// @desc   Delete technician
// @route  DELETE /api/technicians/:id
// @access Private/Admin
exports.deleteTechnician = asyncHandler(async (req, res) => {
  const tech = await Technician.findByIdAndDelete(req.params.id);
  if (!tech)
    return res
      .status(404)
      .json({ success: false, message: "Technician not found" });
  res
    .status(200)
    .json({ success: true, message: "Technician deleted", data: {} });
});
