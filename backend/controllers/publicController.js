const Report = require("../models/Report");
const User = require("../models/User");

exports.getPublicStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: "resolved" });
    const activeCitizens = await User.countDocuments({ role: "user" });

    // Global Resolution Rate
    const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(0) : 0;

    res.json({
      totalReports,
      resolvedReports,
      activeCitizens,
      resolutionRate: parseInt(resolutionRate),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching public stats", error: err.message });
  }
};
