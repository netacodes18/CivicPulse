const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Required for SMS notifications
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  state: { type: String, required: true },
  area: { type: String },
});


module.exports = mongoose.model("User", userSchema);
