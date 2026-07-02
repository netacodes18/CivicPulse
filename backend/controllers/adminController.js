const Report = require("../models/Report");
const { publishMessage } = require("../utils/rabbitmq");

exports.getAllReports = async (req, res) => {
  try {
    const adminState = req.user.state;
    const { state, area } = req.query;

    let filter = {
      state: state || adminState, 
    };

    if (area) {
      filter.area = area;
    }

    const reports = await Report.find(filter).populate(
      "user",
      "username email state area"
    );

    res.json({ reports });
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
    // Optimized: single aggregation pipeline instead of 4 separate queries
    const pipeline = await Report.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
        },
      },
    ]);

    const stats = pipeline[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0 };
    delete stats._id;

    // Fetch 5 most recent reports for the dashboard feed
    const recentReports = await Report.find()
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


// DELETE any report (admin)
exports.deleteAnyReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted by admin" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting report", error: err.message });
  }
};