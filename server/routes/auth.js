const router = require("express").Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { protect, adminOnly } = require("../middleware/auth");
const User = require("../models/User");
const { sendResetEmail } = require("../config/mailer");

const signToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, role: user.role, email: user.email || "" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists && exists.username === username) return res.status(409).json({ message: "Username already taken" });
    if (exists && exists.email === email) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ username, password, email, role: "reporter" });
    res.status(201).json({ message: "Account created", token: signToken(user), role: user.role, username: user.username });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/google/callback — OAuth redirect handler for mobile app
// Google redirects here after sign-in, then we deep-link back to the app
router.get("/google/callback", async (req, res) => {
  // Google sends the token in the fragment (#) which servers can't read.
  // We serve a tiny HTML page that reads the fragment and posts it to itself.
  const { code, access_token, error } = req.query;

  if (error) {
    return res.redirect(`safespeak-app://auth?error=${encodeURIComponent(error)}`);
  }

  // If we have an access_token directly (implicit flow via fragment forwarded by JS)
  if (access_token) {
    return res.redirect(`safespeak-app://auth?access_token=${encodeURIComponent(access_token)}`);
  }

  // Serve a page that extracts the fragment token and redirects to the app
  res.send(`<!DOCTYPE html>
<html>
<head><title>Signing in...</title></head>
<body>
<p>Completing sign in, please wait...</p>
<script>
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get('access_token');
  const err = params.get('error');
  if (token) {
    window.location.href = 'safespeak-app://auth?access_token=' + encodeURIComponent(token);
  } else if (err) {
    window.location.href = 'safespeak-app://auth?error=' + encodeURIComponent(err);
  } else {
    document.body.innerHTML = '<p>Sign in failed. Please close this window and try again.</p>';
  }
</script>
</body>
</html>`);
});


router.post("/google-token", async (req, res) => {
  try {
    const { userInfo } = req.body;
    if (!userInfo || !userInfo.sub || !userInfo.email) {
      return res.status(400).json({ message: "Invalid Google user info" });
    }
    const { sub: googleId, email, name, picture } = userInfo;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      let username = (name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase();
      const taken = await User.findOne({ username });
      if (taken) username = username + Math.floor(Math.random() * 9000 + 1000);
      user = await User.create({ username, password: "", email, googleId, avatar: picture || "", role: "reporter" });
    }
    res.json({ token: signToken(user), role: user.role, username: user.username, email: user.email, avatar: user.avatar || "" });
  } catch (err) {
    console.error("Google token auth error:", err.message);
    res.status(401).json({ message: "Google sign-in failed. Please try again." });
  }
});

// POST /api/auth/admin/register
router.post("/admin/register", async (req, res) => {
  try {
    const { username, password, email, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_REGISTER_KEY)
      return res.status(403).json({ message: "Invalid authorization key" });
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (!email) return res.status(400).json({ message: "Email is required for admin accounts" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (password.length < 8) return res.status(400).json({ message: "Admin password must be at least 8 characters" });
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists && exists.username === username) return res.status(409).json({ message: "Username already taken" });
    if (exists && exists.email === email) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ username, password, email, role: "admin" });
    res.status(201).json({ message: "Admin account created", token: signToken(user), role: user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Allow login by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid username or password" });
    res.json({ token: signToken(user), role: user.role, username: user.username, email: user.email });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with that email" });
    const code = crypto.randomInt(100000, 999999).toString();
    user.resetCode = code;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendResetEmail(email, code);
    res.json({ message: "Reset code sent to your email" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetCode !== code) return res.status(400).json({ message: "Invalid reset code" });
    if (new Date() > user.resetCodeExpiry) return res.status(400).json({ message: "Reset code has expired" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/auth/change-password
router.patch("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both current and new password required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
    const user = await User.findById(req.user.id);
    if (!user || !(await user.comparePassword(currentPassword))) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select("username email role createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/auth/users/:id
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
