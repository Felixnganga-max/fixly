const PurchaseRequest = require("../models/purchaseRequest");
const MarketplaceListing = require("../models/Marketplacelisting");
const ShopOwner = require("../models/shopOwners");
const Commission = require("../models/comissions");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Submit a purchase request (Buy Now)
// @route  POST /fixly/marketplace/:id/buy
// @access Public
exports.createPurchaseRequest = asyncHandler(async (req, res) => {
  const { firstName, email, phone, address, deliveryMethod } = req.body;

  if (!firstName || !email || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: "firstName, email, phone and address are all required.",
    });
  }

  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing || !listing.active) {
    return res.status(404).json({
      success: false,
      message: "This listing is no longer available.",
    });
  }

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

// @desc   Get all purchase requests
// @route  GET /fixly/purchase-requests
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
      .populate("assignedShop", "shopName ownerName phone location")
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
// @route  GET /fixly/purchase-requests/:id
// @access Private/Admin
exports.getRequestById = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id)
    .populate("listing", "name brand price images condition")
    .populate(
      "assignedShop",
      "shopName ownerName phone location category verified",
    );

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  res.status(200).json({ success: true, data: request });
});

// @desc   Update purchase request status / notes
// @route  PATCH /fixly/purchase-requests/:id
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

  // ── Auto-create sale commission when marked completed ──
  if (status === "completed" && request.listingSnapshot?.price) {
    const basePrice = request.listingSnapshot.price;
    const rate = 0.045;
    const amount = Commission.calculateAmount(basePrice, "sale");

    await Commission.findOneAndUpdate(
      { purchase: request._id },
      {
        type: "sale",
        purchase: request._id,
        listing: request.listing,
        basePrice,
        rate,
        amount,
        status: "Pending",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  res
    .status(200)
    .json({ success: true, message: "Request updated", data: request });
});

// @desc   Assign a shop owner to a purchase request
// @route  PATCH /fixly/purchase-requests/:id/assign-shop
// @access Private/Admin
exports.assignShop = asyncHandler(async (req, res) => {
  const { shopId } = req.body;

  if (!shopId) {
    return res
      .status(400)
      .json({ success: false, message: "shopId is required" });
  }

  // Validate the shop exists and is active
  const shop = await ShopOwner.findById(shopId);
  if (!shop) {
    return res.status(404).json({ success: false, message: "Shop not found" });
  }
  if (!shop.active) {
    return res
      .status(400)
      .json({ success: false, message: "This shop is currently inactive" });
  }

  const request = await PurchaseRequest.findByIdAndUpdate(
    req.params.id,
    {
      assignedShop: shopId,
      assignedAt: new Date(),
      // Auto-advance status from pending → contacted when a shop is assigned
      ...(await PurchaseRequest.findById(req.params.id).then((r) =>
        r?.status === "pending" ? { status: "contacted" } : {},
      )),
    },
    { new: true, runValidators: true },
  ).populate("assignedShop", "shopName ownerName phone location");

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Purchase request not found" });
  }

  res.status(200).json({
    success: true,
    message: `Shop "${shop.shopName}" assigned successfully`,
    data: request,
  });
});

// @desc   Remove shop assignment from a purchase request
// @route  PATCH /fixly/purchase-requests/:id/unassign-shop
// @access Private/Admin
exports.unassignShop = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findByIdAndUpdate(
    req.params.id,
    { assignedShop: null, assignedAt: null },
    { new: true },
  );

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Purchase request not found" });
  }

  res.status(200).json({
    success: true,
    message: "Shop assignment removed",
    data: request,
  });
});

// @desc   Delete a purchase request
// @route  DELETE /fixly/purchase-requests/:id
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
