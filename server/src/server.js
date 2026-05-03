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

// ── CORS ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://www.fixlykenya.co.ke",
  "https://fixly-wcao.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Handle preflight for ALL routes — must come before everything else
app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

// ── Body parsers ──────────────────────────────────────────────
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
app.use("/fixly/brands", require("./routes/brandsRoutes"));
app.use("/fixly/alerts", require("./routes/alerts"));
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
connectRedis();

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
