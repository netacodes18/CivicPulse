const Report = require("../models/Report");

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || (process.env.NODE_ENV === "production" ? "http://civicpulse-rag:10000" : "http://localhost:8000");

exports.getDashboardSummary = async (req, res) => {
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

    // Fetch up to 50 recent reports to summarize
    const recentReports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .select("title description category status area pincode createdAt");

    if (recentReports.length === 0) {
      return res.json({ summary: "No recent reports available to summarize." });
    }

    // Send to Python RAG service
    const response = await fetch(`${RAG_SERVICE_URL}/ai/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reports: recentReports,
        state: adminState,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("RAG Service Summarize Error:", errText);
      return res.status(response.status).json({ message: "Failed to generate AI summary" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("AI Summary Error:", err);
    res.status(500).json({ message: "Error generating AI summary", error: err.message });
  }
};

exports.translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "Text and targetLanguage are required" });
    }

    // Send to Python RAG service
    const response = await fetch(`${RAG_SERVICE_URL}/ai/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("RAG Service Translate Error:", errText);
      return res.status(response.status).json({ message: "Failed to translate text" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("AI Translate Error:", err);
    res.status(500).json({ message: "Error translating text", error: err.message });
  }
};
