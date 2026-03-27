const PurchaseRequest = require("../models/purchaseRequest");
const MarketplaceListing = require("../models/Marketplacelisting");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Submit a purchase request (Buy Now)
// @route  POST /api/marketplace/:id/buy
// @access Public
exports.createPurchaseRequest = asyncHandler(async (req, res) => {
  const { firstName, email, phone, address, deliveryMethod } = req.body;

  // Validate required fields
  if (!firstName || !email || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: "firstName, email, phone and address are all required.",
    });
  }

  // Verify listing exists and is active
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing || !listing.active) {
    return res.status(404).json({
      success: false,
      message: "This listing is no longer available.",
    });
  }

  // Build request with listing snapshot
  const request = await PurchaseRequest.create({
    listing: listing._id,
    listingSnapshot: {
      name: listing.name,
      brand: listing.brand,
      category: listing.category,
      price: listing.price,
      condition: listing.condition,
      image: listing.images?.[0] || "",
    },
    firstName,
    email,
    phone,
    address,
    deliveryMethod: deliveryMethod || "undecided",
  });

  res.status(201).json({
    success: true,
    message: "Purchase request submitted! We'll be in touch shortly.",
    data: request,
  });
});

// @desc   Get all purchase requests (admin)
// @route  GET /api/purchase-requests
// @access Private/Admin
exports.getAllRequests = asyncHandler(async (req, res) => {
  const {
    status,
    listing,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (listing) filter.listing = listing;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [requests, total] = await Promise.all([
    PurchaseRequest.find(filter)
      .populate("listing", "name brand price images")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    PurchaseRequest.countDocuments(filter),
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

// @desc   Get single purchase request
// @route  GET /api/purchase-requests/:id
// @access Private/Admin
exports.getRequestById = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate(
    "listing",
    "name brand price images condition",
  );
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  res.status(200).json({ success: true, data: request });
});

// @desc   Update request status / notes (admin)
// @route  PATCH /api/purchase-requests/:id
// @access Private/Admin
exports.updateRequest = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const update = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;

  const request = await PurchaseRequest.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true },
  );
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  res.status(200).json({
    success: true,
    message: "Request updated",
    data: request,
  });
});

// @desc   Delete a purchase request (admin)
// @route  DELETE /api/purchase-requests/:id
// @access Private/Admin
exports.deleteRequest = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findByIdAndDelete(req.params.id);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  res.status(200).json({ success: true, message: "Request deleted", data: {} });
});
