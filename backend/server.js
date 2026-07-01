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

app.use((req, res, next) => {
  console.log(`➡️  [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ===================================================
// Rate Limiting (Security)
// ===================================================
const rateLimit = require("express-rate-limit");

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 requests per window
  message: { message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limit for all API endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);

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
// MongoDB, RabbitMQ + Server Start
// ===================================================
const { connectRabbitMQ } = require("./utils/rabbitmq");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 Connected to MongoDB");
    await connectRabbitMQ(); // Connect to RabbitMQ

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });
