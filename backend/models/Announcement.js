const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
      default: "ALL", // "ALL" or specific state like "Maharashtra"
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Must be an admin
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
