const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ===================================================
// 🔥 CORS CONFIGURATION (PRODUCTION SAFE)
// ===================================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://civic-pulse-steel.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Preflight support (MANDATORY)
app.options("*", cors());

// ===================================================
// Middleware
// ===================================================
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ===================================================
// API Routes
// ===================================================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// ===================================================
// Health Check
// ===================================================
app.get("/", (req, res) => {
  res.status(200).send("CivicPulse Backend Running 🚀");
});

// ===================================================
// Global Error Handler
// ===================================================
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});

// ===================================================
// MongoDB + Server Start
// ===================================================
const PORT = process.env.PORT || 10000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("📦 Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });
