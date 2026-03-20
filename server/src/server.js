const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db/db");
const errorHandler = require("./middleware/Errorhandler");

const authRoutes = require("../src/routers/authRoutes");
const repairRequestRoutes = require("./routers/Repairrequestroutes");
const technicianRoutes = require("./routers/Technicianroutes");
const shopOwnerRoutes = require("./routers/Shopownerroutes");
const marketplaceRoutes = require("./routers/Marketplaceroutes");
const commissionRoutes = require("./routers/Commissionroutes");

// ── Load env ──────────────────────────────────────────────────
dotenv.config();

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Fixly API is running" });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/repair-requests", require("./routes/repairRequestRoutes"));
app.use("/api/technicians", require("./routes/technicianRoutes"));
app.use("/api/shop-owners", require("./routes/shopOwnerRoutes"));
app.use("/api/marketplace", require("./routes/marketplaceRoutes"));
app.use("/api/commissions", require("./routes/commissionRoutes"));

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Fixly API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});

module.exports = app;
