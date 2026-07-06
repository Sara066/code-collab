const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash, never plaintext
  username: { type: String, required: true, trim: true },
  resetTokenHash: { type: String, default: null }, // SHA-256 hash of the reset token, never the raw token
  resetTokenExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
