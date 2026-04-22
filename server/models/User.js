const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, default: "" },
  email:    { type: String, default: "", index: true },
  role:     { type: String, enum: ["admin", "reporter"], default: "reporter" },
  googleId: { type: String, default: "" },
  avatar:   { type: String, default: "" },
  resetCode:       { type: String },
  resetCodeExpiry: { type: Date },
}, { timestamps: true });

// Hash password before save — skip if empty (Google OAuth users)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
