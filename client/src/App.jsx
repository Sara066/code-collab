import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/Editor';

// Connect to your Node.js server URL
const socket = io('http://localhost:3001');

function App() {
  const [code, setCode] = useState('// Welcome to your Real-time Editor\nconsole.log("Hello Phase 1!");');

  useEffect(() => {
  socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
  });

  // Listen for code updates from the server (sent by other users)
  socket.on('code-update', (updatedCode) => {
    setCode(updatedCode); // This updates the editor for the other person
  });

  return () => {
    socket.off('connect');
    socket.off('code-update');
  };
}, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // PHASE 2 START: Send the code to the server
    socket.emit('code-change', newCode);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1e1e1e' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CodeEditor code={code} onCodeChange={handleCodeChange} />
      </div>
    </div>
  );
}

export default App;