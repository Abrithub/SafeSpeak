const router = require("express").Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendResetEmail } = require("../config/mailer");

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role, email: user.email || "" }, process.env.JWT_SECRET, { expiresIn: "8h" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "Username already taken" });
    const user = await User.create({ username, password, email: email || "", role: "reporter" });
    res.status(201).json({ message: "Account created", token: signToken(user), role: user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/admin/register
router.post("/admin/register", async (req, res) => {
  try {
    const { username, password, email, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_REGISTER_KEY)
      return res.status(403).json({ message: "Invalid authorization key" });
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (password.length < 8) return res.status(400).json({ message: "Admin password must be at least 8 characters" });
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "Username already taken" });
    const user = await User.create({ username, password, email: email || "", role: "admin" });
    res.status(201).json({ message: "Admin account created", token: signToken(user), role: user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid username or password" });
    res.json({ token: signToken(user), role: user.role, username: user.username });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/forgot-password — send reset code
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with that email" });
    const code = crypto.randomInt(100000, 999999).toString();
    user.resetCode = code;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();
    await sendResetEmail(email, code);
    res.json({ message: "Reset code sent to your email" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/reset-password — verify code and set new password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetCode !== code)
      return res.status(400).json({ message: "Invalid reset code" });
    if (new Date() > user.resetCodeExpiry)
      return res.status(400).json({ message: "Reset code has expired" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
