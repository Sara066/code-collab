require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');

const Room = require('./models/Room.model.cjs');
const { verifyToken } = require('./utils/jwt.util.cjs');
const authRoutes = require('./routes/auth.routes.cjs');
const roomRoutes = require('./routes/room.routes.cjs');
const { watchedRooms, saveTimers } = require('./realtime.cjs');

const PORT = process.env.PORT || 1234;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🍃 MongoDB connected'))
  .catch(err => console.error('❌ Mongo connection error:', err));

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

const server = http.createServer(app);

// noServer: true — we handle the upgrade manually so we can check the JWT
// and room membership BEFORE the WebSocket connection is ever accepted.
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', async (req, socket, head) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = decodeURIComponent(url.pathname.slice(1));
    const token = url.searchParams.get('token');

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      return socket.destroy();
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      return socket.destroy();
    }

    const room = await Room.findOne({ roomId });
    const isCollaborator = room?.collaborators.some(id => id.toString() === decoded.userId);
    if (!room || !isCollaborator) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      return socket.destroy();
    }

    req.userId = decoded.userId;
    req.roomId = roomId;

    wss.handleUpgrade(req, socket, head, (conn) => {
      wss.emit('connection', conn, req);
    });
  } catch (err) {
    console.error('Upgrade error:', err);
    socket.destroy();
  }
});

wss.on('connection', async (conn, req) => {
  const roomId = req.roomId;
  console.log(`✨ User ${req.userId} joined room: ${roomId}`);

  setupWSConnection(conn, req, { docName: roomId, gc: true });

  setImmediate(async () => {
    const ydoc = docs.get(roomId);
    if (!ydoc) return;

    if (!watchedRooms.has(roomId)) {
      const currentState = Y.encodeStateAsUpdate(ydoc);
      const isEmpty = currentState.length <= 2;

      if (isEmpty) {
        try {
          const savedRoom = await Room.findOne({ roomId });
          if (savedRoom?.content) {
            Y.applyUpdate(ydoc, new Uint8Array(savedRoom.content));
            console.log(`Rehydrated: ${roomId} from DB`);
          }
        } catch (err) {
          console.error('❌ DB Load Error:', err);
        }
      }

      watchedRooms.add(roomId);

      ydoc.on('update', () => {
        if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId));

        saveTimers.set(roomId, setTimeout(async () => {
          try {
            const content = Buffer.from(Y.encodeStateAsUpdate(ydoc));
            // No upsert here on purpose — a room must already exist (created via
            // the REST API) before its document content can be saved.
            await Room.findOneAndUpdate({ roomId }, { content, lastUpdated: new Date() });
            console.log(`Persisted: ${roomId}`);
          } catch (err) {
            console.error('❌ DB Save Error:', err);
          }
          saveTimers.delete(roomId);
        }, 1000));
      });
    }
  });

  conn.on('close', () => {
    console.log(`User ${req.userId} left room: ${roomId}`);
    setImmediate(() => {
      const ydoc = docs.get(roomId);
      if (!ydoc) {
        watchedRooms.delete(roomId);
        saveTimers.delete(roomId);
        console.log(`🧹 ${roomId} cleared from memory`);
      }
    });
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


//node start-sync.cjs