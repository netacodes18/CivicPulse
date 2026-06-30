const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: "other", trim: true },
    imageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    state: { type: String, required: true, index: true },
    area: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
