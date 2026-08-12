const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["STATUS_UPDATE", "REPORT_ASSIGN", "REPORT_DELETE", "USER_SUSPEND", "USER_ROLE_CHANGE", "BROADCAST"],
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    targetModel: {
      type: String,
      enum: ["Report", "User", "Announcement"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    state: {
      type: String,
      default: null, // target's state
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: false // Only createdAt is needed, no updatedAt because it's immutable
  }
);

// Indexes for querying
AuditLogSchema.index({ state: 1, createdAt: -1 });
AuditLogSchema.index({ admin: 1 });
AuditLogSchema.index({ targetId: 1 });
AuditLogSchema.index({ action: 1 });

// TTL index for lower-severity actions (90 days = 7776000 seconds)
AuditLogSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 7776000, 
    partialFilterExpression: { 
      action: { $in: ["STATUS_UPDATE", "REPORT_ASSIGN"] } 
    } 
  }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
