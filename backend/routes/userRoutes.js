const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  createReport,
  getMyReports,
  getCommunityReports,
  getReportById,
  updateReport,
  deleteReport,
  toggleUpvote,
  createComment,
  getComments,
  getDashboardStats,
  getDashboardCategories,
  getCommunitySidebar,
  getNotifications,
  markNotificationAsRead,
  getAnnouncements,
  getGroups,
  joinGroup,
  getEvents,
  rsvpEvent
} = require("../controllers/userController");
const { getActiveCategories } = require("../controllers/categoryController");

// CATEGORIES (Public for users)
router.get("/categories", authMiddleware, getActiveCategories);

// PROFILE
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// CREATE REPORT
router.post("/report", authMiddleware, upload.single("image"), createReport);

//MY REPORTS
router.get("/my-reports", authMiddleware, getMyReports);

//COMMUNITY FEED
router.get("/community", authMiddleware, getCommunityReports);

//  GET SINGLE REPORT
router.get("/report/:id", authMiddleware, getReportById);
router.put("/report/:id", authMiddleware, updateReport);
router.delete("/report/:id", authMiddleware, deleteReport);

//  UPVOTE & COMMENT
router.post("/report/:id/upvote", authMiddleware, toggleUpvote);
router.post("/report/:id/comment", authMiddleware, createComment);
router.get("/report/:id/comments", authMiddleware, getComments);

// DASHBOARD STATS
router.get("/dashboard-stats", authMiddleware, getDashboardStats);
router.get("/dashboard-categories", authMiddleware, getDashboardCategories);
router.get("/community-sidebar", authMiddleware, getCommunitySidebar);

// NOTIFICATIONS
router.get("/notifications", authMiddleware, getNotifications);
router.put("/notifications/:id/read", authMiddleware, markNotificationAsRead);

// ANNOUNCEMENTS
router.get("/announcements", authMiddleware, getAnnouncements);

// Donations
// router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

// ==========================================
// GROUPS & EVENTS
// ==========================================
router.get("/groups", authMiddleware, getGroups);
router.post("/groups/:id/join", authMiddleware, joinGroup);
router.get("/events", authMiddleware, getEvents);
router.post("/events/:id/rsvp", authMiddleware, rsvpEvent);

module.exports = router;
