import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId || !username) return alert('Please enter Username & Room ID');
    
    // Store username in session so the editor can see it
    sessionStorage.setItem('username', username);
    
    // Redirect to the room
    navigate(`/editor/${roomId}`);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#121212' }}>
      <form onSubmit={handleJoin} style={{ background: '#1e1e1e', padding: '40px', borderRadius: '8px', width: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#4caf50', marginBottom: '20px', textAlign: 'center' }}>Join a Room</h2>
        <input 
          type="text" placeholder="Username" 
          value={username} onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #333', background: '#2d2d2d', color: '#fff' }}
        />
        <input 
          type="text" placeholder="Room ID (e.g. project-x)" 
          value={roomId} onChange={(e) => setRoomId(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #333', background: '#2d2d2d', color: '#fff' }}
        />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Start Coding
        </button>
      </form>
    </div>
  );
};

export default Home;