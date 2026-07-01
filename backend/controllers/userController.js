const Report = require("../models/Report");
const Comment = require("../models/Comment");

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

exports.createReport = async (req, res) => {
  try {
    const { title, description, category, lat, lng } = req.body;

    // Use filename to avoid Windows backslash issues
   // Use X-Forwarded-Proto to handle reverse proxies (like Render) correctly, or fallback to req.protocol
   const protocol = req.headers["x-forwarded-proto"] || req.protocol;
   const filename = req.file?.filename || "";
   const imageUrl = filename
     ? `${protocol}://${req.get("host")}/uploads/${filename}`.replace(/\\/g, "/")
     : "";

    const report = new Report({
      title,
      description,
      category, // ✅ add category here
      imageUrl,
      user: req.user.id,
      state: req.user.state,
      area: req.user.area,
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    console.error("Error in createReport:", err);
    res
      .status(500)
      .json({ message: "Error creating report", error: err.message });
  }
};


// GET all reports submitted by the logged-in user
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ reports });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching reports", error: err.message });
  }
};

// GET all reports in the user's state (community feed)
exports.getCommunityReports = async (req, res) => {
  try {
    const { area } = req.query;
    const filter = { state: req.user.state };
    if (area) filter.area = area;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username state area");

    res.json({ reports });
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
    } else {
      report.upvotes.splice(index, 1);
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
