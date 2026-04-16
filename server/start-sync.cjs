const http = require('http');
const WebSocket = require('ws');
const yUtils = require('./node_modules/y-websocket/dist/y-websocket.cjs');

// In modern y-websocket, we handle the messages via the exported protocols
const port = 1234;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Yjs Sync Server is Running');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
  console.log(`✨ New Peer joined: ${req.url}`);

  // Broadcast every message to all other connected clients
  // This is the core of how Yjs syncs without the 'setupWSConnection' utility
  conn.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== conn && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  conn.on('close', () => console.log('Peer left.'));
});

server.listen(port, () => {
  console.log(`🚀 Yjs Server running at http://localhost:${port}`);
  console.log(`👉 Your frontend should connect to: ws://localhost:${port}`);
});
//node start-sync.cjs