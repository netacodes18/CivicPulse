const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Hello ${req.user.username}, you're authenticated.`,
  });
});

module.exports = router;