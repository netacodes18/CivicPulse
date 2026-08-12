const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if user is suspended
    const userDoc = await User.findById(decoded.id);
    if (!userDoc) {
      return res.status(401).json({ message: "User not found" });
    }
    if (userDoc.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    console.log("✅ TOKEN DECODED:", {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    });

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    console.log("🔍 ROLE CHECK:", {
      fromToken: req.user?.role,
      required: roles,
      type: typeof req.user?.role,
    });

    if (
      !req.user?.role ||
      !roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())
    ) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient role" });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
