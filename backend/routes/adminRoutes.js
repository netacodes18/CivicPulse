const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getAllReports,
  updateReportStatus,
  deleteAnyReport,
  getAdminDashboardStats
} = require("../controllers/adminController");

// ✅ Admin can view all reports from their state only
router.get("/reports", authMiddleware, requireRole("admin"), getAllReports);

router.get(
  "/dashboard-stats",
  authMiddleware,
  requireRole("admin"),
  getAdminDashboardStats
);

// ✅ Admin can update status of a report (e.g., to "in-progress", "resolved")
router.put(
  "/report/:id/status",
  authMiddleware,
  requireRole("admin"),
  updateReportStatus
);

// ✅ Admin can delete any report
router.delete(
  "/report/:id",
  authMiddleware,
  requireRole("admin"),
  deleteAnyReport
);


module.exports = router;
