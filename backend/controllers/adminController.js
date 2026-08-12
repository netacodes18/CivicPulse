const Report = require("../models/Report");
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const AuditLog = require("../models/AuditLog");
const Group = require("../models/Group");
const Event = require("../models/Event");
const { publishMessage } = require("../utils/rabbitmq");
const { logAction } = require("../utils/auditLogger");

exports.getAllReports = async (req, res) => {
  try {
    const adminState = req.user.state;
    const adminPincode = req.user.pincode;
    const { pincode, page = 1, limit = 25 } = req.query;

    let filter = {
      state: { $regex: new RegExp(`^${adminState}$`, 'i') },
    };

    if (adminPincode) {
      filter.pincode = adminPincode;
    } else if (pincode) {
      filter.pincode = pincode;
    }

    if (req.user.role === "moderator" && req.user.department) {
      filter.category = req.user.department;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "username email state area");

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
      .json({ message: "Error fetching reports", error: err.message });
  }
};

// PUT update status of any report (admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, version } = req.body;

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (version === undefined) {
      return res.status(400).json({ message: "Version (__v) is required for concurrency control" });
    }

    const updated = await Report.findOneAndUpdate(
      { _id: req.params.id, __v: version },
      { $set: { status }, $inc: { __v: 1 } },
      { new: true }
    ).populate("user", "phone username email");

    if (!updated) {
      // If the report exists but the version doesn't match, it was modified by someone else
      const existingReport = await Report.findById(req.params.id);
      if (existingReport) {
        return res.status(409).json({ message: "Conflict: This report was recently updated by another administrator. Please refresh the dashboard to see the latest status." });
      }
      return res.status(404).json({ message: "Report not found" });
    }

    // AUDIT LOG
    logAction({
      action: "STATUS_UPDATE",
      admin: req.user.id,
      details: `Updated report status to ${status}`,
      metadata: { from: existingReport ? existingReport.status : "unknown", to: status },
      targetModel: "Report",
      targetId: updated._id,
      state: updated.state
    });

    // Trigger RabbitMQ Notification Event
    if (updated.user && updated.user.phone) {
      const messageData = {
        type: "SMS",
        phone: updated.user.phone,
        body: `CivicPulse Update: The status of your anomaly report "${updated.title}" is now: ${status.toUpperCase()}.`,
        reportId: updated._id,
      };

      // Publish SMS event asynchronously to the broker
      publishMessage("notification_queue", messageData);

      // Publish EMAIL event asynchronously to the broker
      if (updated.user.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1c523c;">CivicPulse Status Update</h2>
            <p>Hello ${updated.user.username},</p>
            <p>The status of your anomaly report <strong>"${updated.title}"</strong> has been updated to:</p>
            <h3 style="color: #D96C4A;">${status.toUpperCase()}</h3>
            <br/>
            <p>Thank you for using CivicPulse to keep our community safe.</p>
          </div>
        `;
        publishMessage("notification_queue", {
          type: "EMAIL",
          to: updated.user.email,
          subject: `Status Update: ${updated.title}`,
          html: emailHtml,
        });
      }
    }

    res.json({ message: "Report status updated", report: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating status", error: err.message });
  }
};
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const adminState = req.user.state;
    const adminPincode = req.user.pincode;

    let filter = { state: { $regex: new RegExp(`^${adminState}$`, 'i') } };
    if (adminPincode) {
      filter.pincode = adminPincode;
    }

    if (req.user.role === "moderator" && req.user.department) {
      filter.category = req.user.department;
    }

    // Optimized: single aggregation pipeline instead of 4 separate queries
    const pipeline = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          avgResolutionTimeMs: {
            $avg: {
              $cond: [
                { $eq: ["$status", "resolved"] },
                { $subtract: ["$updatedAt", "$createdAt"] },
                null
              ]
            }
          }
        },
      },
    ]);

    const stats = pipeline[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, avgResolutionTimeMs: null };
    delete stats._id;

    // Fetch 5 most recent reports for the dashboard feed
    const recentReports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username state area");

    res.json({ stats, recentReports });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get stats", error: err.message });
  }
};

exports.bulkUpdateReports = async (req, res) => {
  try {
    const { reportIds, action, value } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: "No reports provided for bulk update" });
    }

    if (action === "status") {
      const validStatuses = ["pending", "in-progress", "resolved"];
      if (!validStatuses.includes(value)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      await Report.updateMany(
        { _id: { $in: reportIds } },
        { 
          $set: { status: value },
          $currentDate: { updatedAt: true }
        }
      );

      return res.json({ message: `Successfully updated ${reportIds.length} reports to ${value}` });
    }

    return res.status(400).json({ message: "Invalid bulk action" });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ message: "Failed to perform bulk update", error: err.message });
  }
};

exports.assignReport = async (req, res) => {
  try {
    const { assignedTo, assignedDepartment } = req.body;
    
    const updateFields = {};
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo || null;
    if (assignedDepartment !== undefined) updateFields.assignedDepartment = assignedDepartment || null;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // AUDIT LOG
    logAction({
      action: "REPORT_ASSIGN",
      admin: req.user.id,
      details: `Assigned report to ${assignedDepartment}`,
      metadata: { to: assignedDepartment },
      targetModel: "Report",
      targetId: report._id,
      state: report.state
    });

    res.json({ message: "Report assigned successfully", report });
  } catch (err) {
    console.error("Assign report error:", err);
    res.status(500).json({ message: "Failed to assign report", error: err.message });
  }
};

// DELETE any report (admin)
exports.deleteAnyReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    // AUDIT LOG (before delete)
    logAction({
      action: "REPORT_DELETE",
      admin: req.user.id,
      details: `Deleted report "${report.title}"`,
      targetModel: "Report",
      targetId: report._id,
      state: report.state
    });

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
};

exports.getAdminAnalytics = async (req, res) => {
  try {
    // 1. Build Base Filter
    let filter = {};
    if (req.user.role !== "super_admin") {
      if (req.user.state) filter.state = { $regex: new RegExp(`^${req.user.state}$`, 'i') };
      if (req.user.pincode) filter.pincode = req.user.pincode;
      if (req.user.role === "moderator" && req.user.department) filter.category = req.user.department;
    }

    // 2. High-Level KPIs
    const kpiPipeline = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          avgResolutionTimeMs: {
            $avg: {
              $cond: [
                { $eq: ["$status", "resolved"] },
                { $subtract: ["$updatedAt", "$createdAt"] },
                null
              ]
            }
          }
        },
      },
    ]);
    const kpi = kpiPipeline[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, avgResolutionTimeMs: null };

    // 3. Trend over the last 6 months (Monthly volume)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const trendPipeline = await Report.aggregate([
      { $match: { ...filter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format trend data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trend = trendPipeline.map(item => ({
      label: `${monthNames[item._id.month - 1]}`,
      count: item.count
    }));

    // 4. Department SLA Analysis (Avg Resolution Time by assignedDepartment)
    const slaPipeline = await Report.aggregate([
      { $match: { ...filter, status: "resolved" } },
      {
        $group: {
          _id: "$assignedDepartment",
          avgResolutionTimeMs: { $avg: { $subtract: ["$updatedAt", "$createdAt"] } },
          resolvedCount: { $sum: 1 }
        }
      },
      { $sort: { avgResolutionTimeMs: -1 } } // longest first
    ]);

    const sla = slaPipeline.map(item => ({
      department: item._id || "Unassigned",
      avgResolutionTimeDays: item.avgResolutionTimeMs / (1000 * 60 * 60 * 24),
      resolvedCount: item.resolvedCount
    }));

    // 5. Geographic Hotspots (Top 5 Pincodes)
    const hotspotsPipeline = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$pincode",
          count: { $sum: 1 },
          pendingCount: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const hotspots = hotspotsPipeline.map(item => ({
      pincode: item._id || "Unknown",
      count: item.count,
      pendingCount: item.pendingCount
    }));

    // 6. Category breakdown
    const categoryPipeline = await Report.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      kpi,
      trend,
      sla,
      hotspots,
      categories: categoryPipeline
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Failed to generate analytics", error: err.message });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

exports.getUsers = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== "super_admin") {
      filter.state = { $regex: new RegExp(`^${req.user.state}$`, 'i') };
    }
    const users = await User.find(filter).select("-password").sort({ points: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to get users", error: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent suspending self or super admins
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot suspend yourself" });
    }
    if (user.role === "super_admin") {
      return res.status(403).json({ message: "Cannot suspend a super admin" });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    // AUDIT LOG
    logAction({
      action: "USER_SUSPEND",
      admin: req.user.id,
      details: user.isSuspended ? `Suspended user ${user.username}` : `Unsuspended user ${user.username}`,
      metadata: { from: !user.isSuspended ? "suspended" : "active", to: user.isSuspended ? "suspended" : "active" },
      targetModel: "User",
      targetId: user._id,
      state: user.state
    });

    res.json({ message: user.isSuspended ? "User suspended" : "User unsuspended", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update suspension status", error: err.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // AUDIT LOG
    logAction({
      action: "USER_ROLE_CHANGE",
      admin: req.user.id,
      details: `Changed role of ${user.username} from ${oldRole} to ${role}`,
      metadata: { from: oldRole, to: role },
      targetModel: "User",
      targetId: user._id,
      state: user.state
    });

    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to change user role", error: err.message });
  }
};

// ==========================================
// ANNOUNCEMENTS
// ==========================================

exports.broadcastAnnouncement = async (req, res) => {
  try {
    const { title, content, targetState } = req.body;
    
    // Default to admin's state unless super_admin specifically targets ALL
    let announcementState = req.user.state;
    if (req.user.role === "super_admin" && targetState === "ALL") {
      announcementState = "ALL";
    }

    const announcement = new Announcement({
      title,
      content,
      state: announcementState,
      author: req.user.id
    });

    await announcement.save();

    // AUDIT LOG
    logAction({
      action: "BROADCAST",
      admin: req.user.id,
      details: `Broadcasted announcement: "${title}" to ${announcementState}`,
      targetModel: "Announcement",
      targetId: announcement._id,
      state: announcementState === "ALL" ? null : announcementState
    });

    res.status(201).json({ message: "Announcement broadcasted successfully", announcement });
  } catch (err) {
    res.status(500).json({ message: "Failed to broadcast announcement", error: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete announcement", error: err.message });
  }
};

// ==========================================
// AUDIT LOGS
// ==========================================

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 25, action, admin, targetModel, dateFrom, dateTo } = req.query;

    let filter = {};
    if (req.user.role !== "super_admin") {
      filter.state = { $regex: new RegExp(`^${req.user.state}$`, 'i') };
    }

    if (action) filter.action = action;
    if (admin) filter.admin = admin;
    if (targetModel) filter.targetModel = targetModel;
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("admin", "username email");

    const totalCount = await AuditLog.countDocuments(filter);

    res.json({ 
      logs, 
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
  }
};

// ==========================================
// GROUPS & EVENTS
// ==========================================

exports.createGroup = async (req, res) => {
  try {
    const { name, description, category, area } = req.body;
    
    // Admins create groups for their state
    const group = new Group({
      name,
      description,
      category: category || "General",
      state: req.user.state,
      area: area || null,
      creator: req.user.id,
      members: [req.user.id] // creator is automatically a member
    });

    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (err) {
    res.status(500).json({ message: "Failed to create group", error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, area } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      location,
      state: req.user.state,
      area: area || null,
      creator: req.user.id,
      attendees: [req.user.id] // creator is automatically an attendee
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};