// controllers/customerController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Customer = require("../models/customers");
const ShopOwner = require("../models/shopOwners");
const ShopEvent = require("../models/shopEvents");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sign = (c) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set on the server");
  return jwt.sign({ id: c._id, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const view = (c) => ({
  id: c._id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  marketingConsent: c.marketingConsent,
});

// 0712 345 678 / +254712345678 / 254712345678  ->  254712345678
const normalizePhone = (raw = "") => {
  const d = String(raw).replace(/\D/g, "");
  const intl = d.startsWith("254") ? d : d.startsWith("0") ? `254${d.slice(1)}` : d;
  return /^254[17]\d{8}$/.test(intl) ? intl : null;
};

// POST /fixly/customers/register
exports.register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const phone = normalizePhone(req.body.phone);
  const consent = req.body.marketingConsent === true;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Name and email are required" });
  }
  if (!phone) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid Kenyan phone number, e.g. 0712 345 678" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ success: false, message: "Password must be at least 8 characters" });
  }
  if (await Customer.exists({ email })) {
    return res.status(409).json({
      success: false,
      message: "An account with that email already exists. Log in instead.",
    });
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    password: await bcrypt.hash(password, 12),
    marketingConsent: consent,
    consentAt: consent ? new Date() : null,
    lastLoginAt: new Date(),
  });

  res.status(201).json({ success: true, token: sign(customer), data: view(customer) });
});

// POST /fixly/customers/login
exports.login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const customer = await Customer.findOne({ email }).select("+password");
  const ok = customer && (await bcrypt.compare(password, customer.password));
  if (!ok) {
    return res.status(401).json({ success: false, message: "Wrong email or password" });
  }

  customer.lastLoginAt = new Date();
  await customer.save();
  res.json({ success: true, token: sign(customer), data: view(customer) });
});

// GET /fixly/customers/me   (customer token)
exports.me = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer.id);
  if (!customer) return res.status(401).json({ success: false, message: "Account not found" });
  res.json({ success: true, data: view(customer) });
});

// GET /fixly/customers/shops/:key/contact   (customer token required)
// The ONLY place a shop's phone/WhatsApp is returned.
exports.shopContact = asyncHandler(async (req, res) => {
  const key = req.params.key;
  const match = mongoose.isValidObjectId(key)
    ? { $or: [{ slug: key.toLowerCase() }, { _id: key }] }
    : { slug: key.toLowerCase() };

  const shop = await ShopOwner.findOne({ ...match, active: true }).select(
    "shopName phone whatsapp",
  );
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

  await Customer.updateOne(
    { _id: req.customer.id },
    { $addToSet: { contactedShops: shop._id } },
  );

  // Lead event: same customer unlocking the same shop counts once per 30 days
  const seen = await ShopEvent.exists({
    shop: shop._id,
    type: "contact_reveal",
    customer: req.customer.id,
    createdAt: { $gte: new Date(Date.now() - 30 * 864e5) },
  });
  if (!seen) {
    await ShopEvent.create({ shop: shop._id, type: "contact_reveal", customer: req.customer.id });
  }

  res.json({
    success: true,
    data: { shopName: shop.shopName, phone: shop.phone, whatsapp: shop.whatsapp || shop.phone },
  });
});