const AuditLog = require("../models/AuditLog");

/**
 * Non-blocking audit logger helper
 * @param {Object} params
 * @param {String} params.action - Enum action
 * @param {ObjectId} params.admin - The actor ID
 * @param {String} params.details - Human readable description
 * @param {Object} [params.metadata] - Optional structured diff data
 * @param {String} params.targetModel - Enum model name
 * @param {ObjectId} params.targetId - Target document ID
 * @param {String} [params.state] - Target's state for scoping
 */
const logAction = async ({ action, admin, details, metadata, targetModel, targetId, state }) => {
  try {
    const log = new AuditLog({
      action,
      admin,
      details,
      metadata,
      targetModel,
      targetId,
      state
    });
    
    // Fire and forget
    log.save().catch(err => {
      console.error("[AuditLogger] Failed to save audit log in background:", err);
    });
  } catch (err) {
    console.error("[AuditLogger] Failed to construct audit log:", err);
  }
};

module.exports = { logAction };
