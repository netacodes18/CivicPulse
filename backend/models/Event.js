const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  state: { type: String, required: true },
  area: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
