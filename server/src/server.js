const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/Errorhandler");
const { connectRedis } = require("./config/redis");
const { startViewWorker } = require("./utils/viewWorker");

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
    origin: [
      "http://localhost:5173",
      "https://www.fixlykenya.co.ke",
      "https://fixly-wcao.vercel.app", // fixed: removed stray single-quote
    ],
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
app.use("/fixly/marketplace", require("./routes/marketplaceRoutes")); // upgraded file
app.use("/fixly/brands", require("./routes/brandsRoutes")); // new
app.use("/fixly/alerts", require("./routes/alerts")); // new
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

// ── Startup (Redis + view worker) ─────────────────────────────
// connectRedis is non-fatal — app runs fine if Redis is unavailable
connectRedis();

// Only start the view worker in long-running environments.
// On Vercel (serverless), instances are ephemeral so the worker
// isn't useful — the recordView fallback writes directly to DB instead.
if (
  process.env.NODE_ENV !== "production" ||
  process.env.ENABLE_VIEW_WORKER === "true"
) {
  startViewWorker();
}

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
