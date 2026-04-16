import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// We use the 'utils' file because it contains the magic 'setupWSConnection'
const { setupWSConnection } = require('y-websocket/bin/utils');

const port = 1234;
const wss = new WebSocketServer({ port });

wss.on('connection', (conn, req) => {
  // This one line replaces your entire 'conn.on(message)' block
  // It handles rooms, binary syncing, and awareness automatically
  setupWSConnection(conn, req);
  
  console.log(`✨ Peer connected to: ${req.url}`);
});

console.log(`🚀 Yjs Sync Server is running on port ${port}`);