const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // This is your Vite frontend URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('code-change', (newCode) => {
        // Broadcast the new code to all other connected clients
        socket.broadcast.emit('code-update', newCode);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});