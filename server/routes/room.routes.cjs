const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Room = require('../models/Room.model.cjs');
const { requireAuth } = require('../middleware/auth.middleware.cjs');
const { forceCloseRoom } = require('../realtime.cjs');

const router = express.Router();
router.use(requireAuth); // every route below requires a valid JWT

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many rooms created, please slow down' }
});

// Create a room — the creator becomes owner + first collaborator
router.post('/', createLimiter, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    // hex, not base64url — base64url as a Buffer encoding needs Node 15.7+,
    // hex works everywhere and is just as unguessable at this length
    const roomId = crypto.randomBytes(9).toString('hex');

    const room = await Room.create({
      roomId,
      name,
      owner: req.userId,
      collaborators: [req.userId]
    });

    res.status(201).json({ roomId: room.roomId, name: room.name });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// List rooms the current user owns or collaborates on — powers the dashboard
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ collaborators: req.userId })
      .select('roomId name lastUpdated owner')
      .sort({ lastUpdated: -1 });
    res.json(rooms);
  } catch (err) {
    console.error('List rooms error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Join a room via its invite id — adds the user as a collaborator.
// This is the ONLY way to gain access to a room; the WebSocket layer
// checks collaborator membership before allowing a connection at all.
router.post('/:roomId/join', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (!room.collaborators.some(id => id.toString() === req.userId)) {
      room.collaborators.push(req.userId);
      await room.save();
    }

    res.json({ roomId: room.roomId, name: room.name });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Rename a room — owner only. Purely a display-name change, doesn't
// touch roomId (the invite link stays valid) or any Yjs content.
router.patch('/:roomId', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the room owner can rename it' });
    }

    room.name = name.trim();
    await room.save();
    res.json({ roomId: room.roomId, name: room.name });
  } catch (err) {
    console.error('Rename room error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Delete a room — owner only. Removes it from MongoDB AND forcibly
// disconnects anyone currently connected via WebSocket, so no one keeps
// editing a room that no longer officially exists.
router.delete('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the room owner can delete it' });
    }

    await Room.deleteOne({ roomId: req.params.roomId });
    forceCloseRoom(req.params.roomId);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete room error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
