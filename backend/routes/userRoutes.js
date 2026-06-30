const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  createReport,
  getMyReports,
  getCommunityReports,
  getReportById,
  updateReport,
  deleteReport,
  toggleUpvote,
  createComment,
  getComments,
} = require("../controllers/userController");

// 🔥 PROFILE
router.get(
  "/profile",
  authMiddleware,
  getUserProfile
);

// 🔥 CREATE REPORT
router.post(
  "/report",
  authMiddleware,
  upload.single("image"),
  createReport
);

// 🔥 MY REPORTS
router.get(
  "/my-reports",
  authMiddleware,
  getMyReports
);

// 🔥 COMMUNITY FEED (all reports in user's state)
router.get(
  "/community",
  authMiddleware,
  getCommunityReports
);

// 🔥 GET SINGLE REPORT (detail page)
router.get(
  "/report/:id",
  authMiddleware,
  getReportById
);

// 🔥 UPDATE REPORT
router.put(
  "/report/:id",
  authMiddleware,
  updateReport
);

// 🔥 DELETE REPORT
router.delete(
  "/report/:id",
  authMiddleware,
  deleteReport
);

// 🔥 UPVOTE TOGGLE
router.post(
  "/report/:id/upvote",
  authMiddleware,
  toggleUpvote
);

// 🔥 CREATE COMMENT
router.post(
  "/report/:id/comment",
  authMiddleware,
  createComment
);

// 🔥 GET COMMENTS
router.get(
  "/report/:id/comments",
  authMiddleware,
  getComments
);

module.exports = router;
