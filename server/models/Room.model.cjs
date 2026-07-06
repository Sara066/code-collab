const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Unguessable token used in the URL/invite link — replaces the old free-typed roomName
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // human-friendly display name, not used for access
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  content: { type: Buffer }, // Yjs binary state
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);