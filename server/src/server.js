const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/Errorhandler");

// ── Load env ──────────────────────────────────────────────────
dotenv.config();

const app = express();

// ── Lazy DB connection (required for Vercel serverless) ───────
let isConnected = false;
const ensureDB = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── DB connection middleware (runs before every request) ──────
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Fixly API is running" });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/fixly/auth", require("./routes/authRoutes"));
app.use("/fixly/repair-requests", require("./routes/repairRequestRoutes"));
app.use("/fixly/technicians", require("./routes/technicianRoutes"));
app.use("/fixly/shop-owners", require("./routes/shopOwnerRoutes"));
app.use("/fixly/marketplace", require("./routes/marketplaceRoutes"));
app.use("/fixly/commissions", require("./routes/commissionRoutes"));
app.use("/fixly/purchase-requests", require("./routes/purchaseRoutes"));

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server (local dev only) ─────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(
      `Fixly API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
    );
  });
}

// ── Export for Vercel ─────────────────────────────────────────
module.exports = app;
