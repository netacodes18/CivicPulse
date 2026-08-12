const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Required for SMS notifications
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "moderator", "admin", "super_admin"], default: "user" },
  department: { type: String, enum: ["roads", "water", "sanitation", "electricity", "other"], default: null },
  state: { type: String, required: true },
  area: { type: String },
  pincode: { type: String, required: true },
  points: { type: Number, default: 0 },
  isSuspended: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
