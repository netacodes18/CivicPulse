const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { getDashboardSummary, translateText } = require("../controllers/aiController");

// Admins and moderators can get the dashboard summary
router.get("/dashboard-summary", authMiddleware, requireRole("admin", "super_admin", "moderator"), getDashboardSummary);

// Any authenticated user can translate text
router.post("/translate", authMiddleware, translateText);

module.exports = router;
