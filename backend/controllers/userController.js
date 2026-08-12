const Report = require("../models/Report");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Event = require("../models/Event");
const Group = require("../models/Group");
const Category = require("../models/Category");
const Announcement = require("../models/Announcement");

exports.getUserProfile = (req, res) => {
  res.json({
    message: `Welcome ${req.user.username}, you are authenticated as a user.`,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      state: req.user.state,
      area: req.user.area,
    },
  });
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username, state, area } = req.body;
    
    // Find the user by ID from the decoded JWT token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (state) user.state = state;
    if (area !== undefined) user.area = area;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        state: user.state,
        area: user.area,
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { title, description, category, lat, lng, area, pincode } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    // Handle image upload with compression
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    let filename = "";
    
    if (req.file && req.file.buffer) {
      const sharp = require('sharp');
      const path = require('path');
      const fs = require('fs');
      
      filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
      const filepath = path.join(__dirname, "..", "uploads", filename);
      
      // Compress and resize image
      await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
    }
    
    const imageUrl = filename
      ? `${protocol}://${req.get("host")}/uploads/${filename}`
      : "";

    // Auto-assign department based on the selected category
    let assignedDepartment = null;
    if (category) {
      const catDoc = await Category.findOne({ value: category });
      if (catDoc && catDoc.department) {
        assignedDepartment = catDoc.department;
      }
    }

    const report = new Report({
      title,
      description,
      category, // ✅ add category here
      imageUrl,
      user: req.user.id,
      state: req.user.state,
      area: area || req.user.area,
      pincode: pincode || req.user.pincode,
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
      assignedDepartment,
      idempotencyKey: idempotencyKey || undefined, // only set if provided
    });

    await report.save();
    
    // Add 10 points for creating a report
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    // 11000 is the MongoDB duplicate key error code
    if (err.code === 11000 && err.keyPattern && err.keyPattern.idempotencyKey) {
      console.log(`🟡 Idempotent request blocked: duplicate key ${err.keyValue.idempotencyKey}`);
      return res.status(200).json({ message: "Report already submitted (Idempotent response)" });
    }
    console.error("Error in createReport:", err);
    res
      .status(500)
      .json({ message: "Error creating report", error: err.message });
  }
};


// GET all reports submitted by the logged-in user
exports.getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Report.countDocuments({ user: req.user.id });
      
    res.json({
      reports,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalReports: total
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching reports", error: err.message });
  }
};

exports.getCommunityReports = async (req, res) => {
  try {
    const { area, pincode, page = 1, limit = 20 } = req.query;
    const filter = { state: req.user.state };
    if (area) filter.area = area;
    if (pincode) filter.pincode = pincode;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "username state area");

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalReports: total
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching community reports", error: err.message });
  }
};

// GET single report by ID (for detail page)
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "username state area")
      .populate("upvotes", "username");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const comments = await Comment.find({ report: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json({ report, comments });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching report", error: err.message });
  }
};

// PUT update a report
exports.updateReport = async (req, res) => {
  try {
    const { title, description } = req.body;

    const updatedReport = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description },
      { new: true }
    );

    if (!updatedReport) {
      return res
        .status(404)
        .json({ message: "Report not found or unauthorized" });
    }

    res.json({ message: "Report updated", report: updatedReport });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating report", error: err.message });
  }
};

// DELETE a report
exports.deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedReport) {
      return res
        .status(404)
        .json({ message: "Report not found or unauthorized" });
    }

    // Also delete associated comments
    await Comment.deleteMany({ report: req.params.id });

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting report", error: err.message });
  }
};

// POST toggle upvote on a report
exports.toggleUpvote = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const userId = req.user.id;
    const index = report.upvotes.indexOf(userId);

    if (index === -1) {
      report.upvotes.push(userId);
      // Give 2 points to the report creator
      await User.findByIdAndUpdate(report.user, { $inc: { points: 2 } });
    } else {
      report.upvotes.splice(index, 1);
      // Remove 2 points from the report creator
      await User.findByIdAndUpdate(report.user, { $inc: { points: -2 } });
    }

    await report.save();
    res.json({
      message: index === -1 ? "Upvoted" : "Upvote removed",
      upvoteCount: report.upvotes.length,
      upvoted: index === -1,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error toggling upvote", error: err.message });
  }
};

// POST create a comment on a report
exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({ message: "Comment must be under 1000 characters" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const comment = await Comment.create({
      report: req.params.id,
      user: req.user.id,
      text: text.trim(),
    });

    const populated = await comment.populate("user", "username");

    res.status(201).json({ message: "Comment added", comment: populated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: err.message });
  }
};

// GET comments for a report
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: err.message });
  }
};

// GET dashboard stats for user's state
exports.getDashboardStats = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const result = await Report.aggregate([
      { $match: { state: req.user.state } },
      {
        $facet: {
          total: [{ $count: "count" }],
          thisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" }
          ],
          resolved: [{ $match: { status: "resolved" } }, { $count: "count" }],
          inProgress: [{ $match: { status: "in-progress" } }, { $count: "count" }],
          upvotes: [
            { $project: { numUpvotes: { $size: { $ifNull: ["$upvotes", []] } } } },
            { $group: { _id: null, totalUpvotes: { $sum: "$numUpvotes" } } }
          ]
        }
      }
    ]);

    const stats = result[0] || {};
    
    res.json({
      total: stats.total[0]?.count || 0,
      thisWeek: stats.thisWeek[0]?.count || 0,
      resolved: stats.resolved[0]?.count || 0,
      inProgress: stats.inProgress[0]?.count || 0,
      upvotes: stats.upvotes[0]?.totalUpvotes || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
  }
};

// GET dashboard categories for user's state
exports.getDashboardCategories = async (req, res) => {
  try {
    const categories = await Report.aggregate([
      { $match: { state: req.user.state } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard categories", error: err.message });
  }
};

// GET community sidebar data
exports.getCommunitySidebar = async (req, res) => {
  try {
    const state = req.user.state;
    
    // Fetch stats in parallel
    const [memberCount, discussionCount, eventCount, groupCount] = await Promise.all([
      User.countDocuments({ state }),
      Report.countDocuments({ state }),
      Event.countDocuments({ state }),
      Group.countDocuments({ state })
    ]);

    // Fetch popular discussions (top 3 by upvotes in state)
    const popularDiscussions = await Report.aggregate([
      { $match: { state } },
      { $project: { title: 1, createdAt: 1, upvoteCount: { $size: { $ifNull: ["$upvotes", []] } }, imageUrl: 1 } },
      { $sort: { upvoteCount: -1 } },
      { $limit: 3 }
    ]);

    // Fetch upcoming events
    const upcomingEvents = await Event.find({ state, date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(3)
      .select("title date location");

    // Fetch top contributors
    const topContributors = await User.find({ state })
      .sort({ points: -1 })
      .limit(3)
      .select("username points");

    res.json({
      stats: {
        members: memberCount,
        discussions: discussionCount,
        events: eventCount,
        groups: groupCount
      },
      popularDiscussions,
      upcomingEvents,
      topContributors
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching community sidebar data", error: err.message });
  }
};

// GET announcements for user's state
exports.getAnnouncements = async (req, res) => {
  try {
    const userState = req.user.state || "ALL";
    const announcements = await require("../models/Announcement")
      .find({ state: { $in: ["ALL", userState] } })
      .sort({ createdAt: -1 })
      .populate("author", "username");
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcements", error: err.message });
  }
};

// GET user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await require("../models/Notification").find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
};

// PUT mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await require("../models/Notification").findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
};

// ==========================================
// GROUPS & EVENTS
// ==========================================

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ state: req.user.state }).populate("members", "username");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch groups", error: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }
    res.json({ message: "Successfully joined group", group });
  } catch (err) {
    res.status(500).json({ message: "Failed to join group", error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ state: req.user.state }).populate("attendees", "username");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
    }
    res.json({ message: "Successfully RSVP'd to event", event });
  } catch (err) {
    res.status(500).json({ message: "Failed to RSVP", error: err.message });
  }
};
