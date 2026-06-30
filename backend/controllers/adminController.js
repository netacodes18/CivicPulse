const Report = require("../models/Report");

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
    const { status } = req.body;

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
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