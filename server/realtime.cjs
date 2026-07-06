const { docs } = require('y-websocket/bin/utils');

// These used to be local variables inside server.cjs. Pulled out here so
// room.routes.cjs can also reach them — specifically to forcibly disconnect
// everyone from a room the moment its owner deletes it.
const watchedRooms = new Set();
const saveTimers = new Map();

function forceCloseRoom(roomId) {
  const ydoc = docs.get(roomId);
  if (ydoc) {
    // Every live WebSocket connection currently in this room gets closed
    // with a specific code so the client can tell the user why.
    ydoc.conns.forEach((_, conn) => conn.close(4001, 'Room deleted'));
    docs.delete(roomId);
  }

  watchedRooms.delete(roomId);
  if (saveTimers.has(roomId)) {
    clearTimeout(saveTimers.get(roomId));
    saveTimers.delete(roomId);
  }
}

module.exports = { watchedRooms, saveTimers, forceCloseRoom };
