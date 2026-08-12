const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getAllReports,
  updateReportStatus,
  deleteAnyReport,
  getAdminDashboardStats,
  bulkUpdateReports,
  assignReport,
  getAdminAnalytics,
  getUsers,
  suspendUser,
  changeUserRole,
  broadcastAnnouncement,
  deleteAnnouncement,
  getAuditLogs,
  createGroup,
  createEvent
} = require("../controllers/adminController");
const {
  getAllCategories,
  createCategory,
  updateCategory
} = require("../controllers/categoryController");

// Admin can view all reports from their state only
router.get("/reports",
  authMiddleware,
  requireRole("admin", "super_admin", "moderator"),
  getAllReports);

router.get(
  "/dashboard-stats",
  authMiddleware,
  requireRole("admin", "super_admin", "moderator"),
  getAdminDashboardStats
);

// Admin can update status of a report (e.g., to "in-progress", "resolved")
router.patch(
  "/reports/:id/status",
  authMiddleware,
  requireRole("admin", "super_admin", "moderator"),
  updateReportStatus
);

// Bulk Update Reports
router.patch(
  "/reports/bulk",
  authMiddleware,
  requireRole("admin", "super_admin", "moderator"),
  bulkUpdateReports
);

// Admin can delete any report
router.delete(
  "/report/:id",
  authMiddleware,
  requireRole("admin", "super_admin"),
  deleteAnyReport
);

// Assign Report
router.patch(
  "/reports/:id/assign",
  authMiddleware,
  requireRole("admin", "super_admin", "moderator"),
  assignReport
);

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
router.get("/categories", authMiddleware, requireRole("admin", "super_admin"), getAllCategories);
router.post("/categories", authMiddleware, requireRole("admin", "super_admin"), createCategory);
router.put("/categories/:id", authMiddleware, requireRole("admin", "super_admin"), updateCategory);

// ==========================================
// ANALYTICS
// ==========================================
router.get("/analytics", authMiddleware, requireRole("admin", "super_admin", "moderator"), getAdminAnalytics);

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get("/users", authMiddleware, requireRole("admin", "super_admin"), getUsers);
router.patch("/users/:id/suspend", authMiddleware, requireRole("admin", "super_admin"), suspendUser);
router.patch("/users/:id/role", authMiddleware, requireRole("super_admin"), changeUserRole);

// ==========================================
// ANNOUNCEMENTS
// ==========================================
router.post("/announcements", authMiddleware, requireRole("admin", "super_admin"), broadcastAnnouncement);
router.delete("/announcements/:id", authMiddleware, requireRole("admin", "super_admin"), deleteAnnouncement);

// ==========================================
// AUDIT LOGS
// ==========================================
router.get("/audit-logs", authMiddleware, requireRole("admin", "super_admin"), getAuditLogs);

// ==========================================
// GROUPS & EVENTS
// ==========================================
router.post("/groups", authMiddleware, requireRole("admin", "super_admin"), createGroup);
router.post("/events", authMiddleware, requireRole("admin", "super_admin"), createEvent);

module.exports = router;
