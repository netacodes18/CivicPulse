const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { publishMessage } = require("../utils/rabbitmq");

// 🔥 Token generator (NORMALIZED ROLE)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role.toLowerCase(), // ✅ IMPORTANT
      username: user.username,
      state: user.state,
      area: user.area,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// POST /api/auth/signup
const signup = async (req, res) => {
  const { username, email, password, role, state, area } = req.body;

  if (!username || !email || !password || !role || !state) {
    return res
      .status(400)
      .json({ message: "All fields except area are required" });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role.toLowerCase(), // ✅ IMPORTANT
      state,
      area,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        state: newUser.state,
        area: newUser.area,
      },
      token,
    });

    // Fire asynchronous Welcome Email event
    const welcomeHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1c523c;">Welcome to CivicPulse, ${newUser.username}!</h2>
        <p>You have successfully joined the civic response network. Your voice matters in stewarding our local neighborhoods.</p>
        <p><strong>Your Role:</strong> ${newUser.role.toUpperCase()}</p>
        <p><strong>Region:</strong> ${newUser.state}</p>
        <br/>
        <p>You can now start reporting urban anomalies directly to municipal authorities.</p>
        <p>Best,<br/>The CivicPulse Team</p>
      </div>
    `;
    publishMessage("notification_queue", {
      type: "EMAIL",
      to: newUser.email,
      subject: "Welcome to CivicPulse!",
      html: welcomeHtml,
    });

  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Role check (normalized)
    if (user.role !== role.toLowerCase()) {
      return res
        .status(403)
        .json({ message: "Access denied: Incorrect role selected" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        state: user.state,
        area: user.area,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

module.exports = {
  signup,
  login,
};
