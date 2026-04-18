const WebSocket = require('ws');
const http = require('http');

const port = 1234;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Collaborative Server is Running');
});

const wss = new WebSocket.Server({ server });

// This Map will store rooms: { "room-name": Set(connections) }
const rooms = new Map();

wss.on('connection', (conn, req) => {
  // Extract room name from URL (e.g., "/room-1" -> "room-1")
  const roomName = req.url.slice(1) || 'default';
  
  console.log(`✨ User joined room: ${roomName}`);

  // Add user to the specific room
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(conn);

  conn.on('message', (message) => {
    // Only broadcast to people in the SAME room
    const clientsInRoom = rooms.get(roomName);
    if (clientsInRoom) {
      clientsInRoom.forEach((client) => {
        if (client !== conn && client.readyState === WebSocket.OPEN) {
          // Send the Yjs update only to roommates
          client.send(message);
        }
      });
    }
  });

  conn.on('close', () => {
    const clientsInRoom = rooms.get(roomName);
    if (clientsInRoom) {
      clientsInRoom.delete(conn);
      if (clientsInRoom.size === 0) {
        rooms.delete(roomName); // Clean up empty rooms
      }
    }
    console.log(`❌ User left room: ${roomName}`);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`✅ Manual Room Isolation is ACTIVE.`);
});
//node start-sync.cjs