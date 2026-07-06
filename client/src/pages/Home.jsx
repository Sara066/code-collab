import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId || !username) return alert('Please enter Username & Room ID');
    sessionStorage.setItem('username', username);
    navigate(`/editor/${roomId}`);
  };

  return (
    <div style={styles.fullscreenWrapper}>
      {/* Background decorative elements */}
      <div style={styles.glowTarget}></div>
      
      <form onSubmit={handleJoin} style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <span style={styles.iconSymbol}>&lt;/&gt;</span>
          </div>
          <h2 style={styles.title}>CodeCollab</h2>
          <p style={styles.subtitle}>Collaborative Coding Environment</p>
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Username</label>
          <input 
            type="text" 
            placeholder="e.g. Developer123" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Room ID</label>
          <input 
            type="text" 
            placeholder="e.g. project-alpha" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          Enter Workspace
        </button>

        <div style={styles.statusFooter}>
          <span style={styles.statusDot}></span>
          Server Online: localhost:1234
        </div>
      </form>
    </div>
  );
};

const styles = {
  fullscreenWrapper: {
    margin: 0,
    padding: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  glowTarget: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  formCard: {
    background: '#111111',
    border: '1px solid #222',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  iconBox: {
    width: '50px',
    height: '50px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    border: '1px solid #333'
  },
  iconSymbol: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  title: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  inputContainer: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    color: '#999',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#0a0a0a',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4caf50',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s ease, transform 0.1s ease'
  },
  statusFooter: {
    marginTop: '24px',
    textAlign: 'center',
    color: '#444',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4caf50',
    borderRadius: '50%',
    boxShadow: '0 0 8px #4caf50'
  }
};

export default Home;